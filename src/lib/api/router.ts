import { db } from "$lib/server/db";
import { auth } from "$lib/server/auth";
import { env } from "$env/dynamic/private";
import { account, share } from "$lib/server/db/schema";
import ky from "ky";
import { Hono } from "hono";
import * as v from "valibot";
import { eq } from "drizzle-orm";
import { vValidator } from "@hono/valibot-validator";
import { type Tracks } from "@spotify/web-api-ts-sdk";
import { trimTrailingSlash } from "hono/trailing-slash";

const SpotifyRefresh = v.object({
  access_token: v.string(),
  token_type: v.string(),
  expires_in: v.number(),
  refresh_token: v.string(),
  scope: v.string(),
});

type SpotifyRefresh = v.InferOutput<typeof SpotifyRefresh>;

const SpotifyArtist = v.object({
  external_urls: v.object({
    spotify: v.string(),
  }),
  href: v.string(),
  id: v.string(),
  name: v.string(),
  type: v.string(),
  uri: v.string(),
});

const SpotifyAlbum = v.object({
  album_type: v.string(),
  total_tracks: v.number(),
  available_markets: v.array(v.string()),
  external_urls: v.object({
    spotify: v.string(),
  }),
  href: v.string(),
  id: v.string(),
  images: v.array(
    v.object({
      url: v.string(),
      height: v.nullable(v.number()),
      width: v.nullable(v.number()),
    }),
  ),
  name: v.string(),
  release_date: v.string(),
  release_date_precision: v.string(),
  restrictions: v.nullable(
    v.object({
      reason: v.string(),
    }),
  ),
  type: v.string(),
  uri: v.string(),
  artists: v.array(SpotifyArtist),
});

const SpotifyTopTracks = v.object({
  href: v.string(),
  limit: v.number(),
  offset: v.number(),
  total: v.number(),
  next: v.nullable(v.string()),
  previous: v.nullable(v.string()),
  items: v.array(
    v.object({
      album: SpotifyAlbum,
      external_urls: v.object({
        spotify: v.string(),
      }),
      followers: v.object({
        href: v.nullable(v.string()),
        total: v.number(),
      }),
      genres: v.array(v.string()),
      href: v.nullable(v.string()),
      id: v.string(),
      name: v.string(),
      popularity: v.number(),
      type: v.string(),
      uri: v.string(),
    }),
  ),
});

type SpotifyTopTracks = v.InferOutput<typeof SpotifyTopTracks>;

type User = typeof auth.$Infer.Session.user;
type Session = typeof auth.$Infer.Session.session;

type AuthRouter = {
  Variables: {
    user: User | null;
    session: Session | null;
  };
};

type SpotifyAccessToken = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

const spotifyAccessToken = async () => {
  const authToken = Buffer.from(`${env.SPOTIFY_CLIENT_ID!}:${env.SPOTIFY_CLIENT_SECRET!}`).toString(
    "base64",
  );

  const { access_token } = await ky
    .post("https://accounts.spotify.com/api/token", {
      headers: {
        Authorization: `Basic ${authToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    })
    .json<SpotifyAccessToken>();

  return access_token;
};

export const router = new Hono<AuthRouter>({ strict: true })
  .use(trimTrailingSlash())
  .use("*", async (c, next) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });

    if (!session) {
      c.set("user", null);
      c.set("session", null);
      return next();
    }

    c.set("user", session.user);
    c.set("session", session.session);
    return next();
  })
  .get("/", (c) => c.text("Hello World"))
  .on(["POST", "GET"], "/auth/*", (c) => {
    return auth.handler(c.req.raw);
  })
  .get("/session", async (c) => {
    const session = c.get("session");
    const user = c.get("user");

    if (!user) return c.body(null, 401);

    return c.json({
      session,
      user,
    });
  })
  .get(
    "/top-tracks",
    vValidator(
      "query",
      v.object({
        limit: v.optional(
          v.pipe(v.string(), v.decimal(), v.transform(Number), v.minValue(1), v.maxValue(50)),
        ),
        time_range: v.optional(
          v.union([v.literal("short_term"), v.literal("medium_term"), v.literal("long_term")]),
        ),
      }),
    ),
    async (c) => {
      const user = c.get("user");
      const session = c.get("session");

      if (!user || !session) return c.json({ message: "Unauthorized" }, 401);

      const acc = await db.select().from(account).where(eq(account.userId, user.id));

      if (!acc || !acc[0] || !acc[0].accessToken) return c.json({ message: "Unauthorized" }, 401);

      const { limit = 25, time_range = "long_term" } = c.req.valid("query");

      let token = acc[0].accessToken;

      if (acc[0].accessTokenExpiresAt?.getTime() || 0 < Date.now()) {
        const refreshDetails = await ky
          .post<SpotifyRefresh>("https://accounts.spotify.com/api/token", {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              grant_type: "refresh_token",
              refresh_token: acc[0].refreshToken!,
              client_id: env.SPOTIFY_CLIENT_ID,
            }),
          })
          .json();

        await db
          .update(account)
          .set({
            accessToken: refreshDetails.access_token,
            accessTokenExpiresAt: new Date(Date.now() + refreshDetails.expires_in * 1000),
            refreshToken: refreshDetails.refresh_token,
          })
          .where(eq(account.id, acc[0].id));
        token = refreshDetails.access_token;
      }

      const topSongs = await ky
        .get<SpotifyTopTracks>(
          `https://api.spotify.com/v1/me/top/tracks?limit=${limit}&time_range=${time_range}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
        .json();
      return c.json(topSongs);
    },
  )
  .get(
    "/share",
    vValidator("query", v.object({ id: v.pipe(v.string(), v.length(7)) })),
    async (c) => {
      const { id } = c.req.valid("query");

      const rows = await db.select().from(share).where(eq(share.id, id));
      if (!rows) return c.json({ message: "Not found" }, 404);

      const trackIds = rows[0].trackIds.join(",");
      const accessToken = await spotifyAccessToken();

      const tracks = await ky
        .get(`https://api.spotify.com/v1/tracks?ids=${trackIds}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .json<Tracks>();

      // const data = tracks.tracks.map((track) => ({
      //   title:
      // }));

      return c.json(tracks.tracks);
    },
  )
  .post("/share", vValidator("json", v.array(v.pipe(v.string(), v.minLength(1)))), async (c) => {
    const user = c.get("user");
    const session = c.get("session");

    if (!user || !session) return c.json({ message: "Unauthorized" }, 401);

    const trackIds = c.req.valid("json");

    const shareInfo = await db
      .insert(share)
      .values({ userId: user.id, trackIds })
      .onConflictDoUpdate({ target: share.userId, set: { trackIds } })
      .returning({ link: share.id });

    return c.json({ shareLink: shareInfo[0].link });
  })
  .post("/test", vValidator("json", v.array(v.pipe(v.string(), v.minLength(1)))), async (c) => {
    const trackIds = c.req.valid("json").join(",");

    const accessToken = await spotifyAccessToken();

    const tracks = await ky
      .get(`https://api.spotify.com/v1/tracks?ids=${trackIds}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .json<Tracks>();

    return c.json(tracks.tracks);
  });

const apiRouter = new Hono().route("/api", router);

export default apiRouter;

export type Router = typeof router;
