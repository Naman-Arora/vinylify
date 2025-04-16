import { env } from "$env/dynamic/private";
import { auth } from "$lib/server/auth";
import { db } from "$lib/server/db";
import { account, share, user, type Account } from "$lib/server/db/schema";
import { vValidator } from "@hono/valibot-validator";
import { type Page, type Track, type Tracks } from "@spotify/web-api-ts-sdk";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { trimTrailingSlash } from "hono/trailing-slash";
import ky from "ky";
import * as v from "valibot";

const SpotifyRefresh = v.object({
  access_token: v.string(),
  token_type: v.string(),
  expires_in: v.number(),
  refresh_token: v.string(),
  scope: v.string(),
});

type SpotifyRefresh = v.InferOutput<typeof SpotifyRefresh>;

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

const spotifyServerAccessToken = async () => {
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

const spotifyUserAccessToken = async (acc: Account) => {
  let token = acc.accessToken;

  if (acc.accessTokenExpiresAt!.getTime() < Date.now()) {
    const refreshDetails = await ky
      .post<SpotifyRefresh>("https://accounts.spotify.com/api/token", {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: acc.refreshToken!,
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
      .where(eq(account.id, acc.id));

    token = refreshDetails.access_token;
  }
  return token;
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
  .on(["POST", "GET"], "/auth/*", (c) => {
    return auth.handler(c.req.raw);
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

      if (!user || !session) return c.json({ error: "Unauthorized" }, 401);

      const acc = await db.select().from(account).where(eq(account.userId, user.id));

      if (!acc || !acc[0] || !acc[0].accessToken) return c.json({ error: "Unauthorized" }, 401);

      const { limit = 40, time_range = "long_term" } = c.req.valid("query");

      const token = await spotifyUserAccessToken(acc[0]);

      const topSongs = await ky
        .get<Page<Track>>(
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
      if (!rows) return c.json({ error: "Not found" }, 404);

      const userId = rows[0].userId;
      const userDetails = await db.select().from(user).where(eq(user.id, userId));
      let userName = userDetails[0].name;
      if (userName.includes(" ")) {
        userName = userName.split(" ")[0];
      }

      const trackIds = rows[0].trackIds.join(",");
      const accessToken = await spotifyServerAccessToken();

      const tracks = await ky
        .get(`https://api.spotify.com/v1/tracks?ids=${trackIds}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .json<Tracks>();

      return c.json({ tracks: tracks.tracks, userName });
    },
  )
  .post(
    "/share",
    vValidator(
      "json",
      v.object({
        trackIds: v.array(v.pipe(v.string(), v.minLength(1))),
        timeRange: v.union([
          v.literal("short_term"),
          v.literal("medium_term"),
          v.literal("long_term"),
        ]),
      }),
    ),
    async (c) => {
      const user = c.get("user");
      const session = c.get("session");

      if (!user || !session) return c.json({ message: "Unauthorized" }, 401);

      const { trackIds, timeRange } = c.req.valid("json");

      const shareInfo = await db
        .insert(share)
        .values({ userId: user.id, trackIds, timeRange })
        .onConflictDoUpdate({ target: share.userId, set: { trackIds, timeRange } })
        .returning({ link: share.id });

      return c.json({ shareLink: shareInfo[0].link });
    },
  )
  .delete("/share", async (c) => {
    const user = c.get("user");
    const session = c.get("session");

    if (!user || !session) return c.json({ message: "Unauthorized" }, 401);

    await db.delete(share).where(eq(share.userId, user.id));

    return c.body(null, 204);
  })
  .post(
    "/playlist",
    vValidator(
      "json",
      v.object({
        uris: v.array(v.pipe(v.string(), v.minLength(1))),
        name: v.optional(v.pipe(v.string(), v.minLength(1))),
      }),
    ),
    async (c) => {
      const user = c.get("user");
      const session = c.get("session");

      if (!user || !session) return c.json({ error: "Unauthorized" }, 401);

      const acc = await db.select().from(account).where(eq(account.userId, user.id));

      if (!acc || !acc[0] || !acc[0].accessToken) return c.json({ error: "Unauthorized" }, 401);

      let userName = user.name;
      if (userName.includes(" ")) {
        userName = userName.split(" ")[0];
      }

      const token = await spotifyUserAccessToken(acc[0]);
      const { name, uris } = c.req.valid("json");

      const res = await ky.post<{ id: string; external_urls: { spotify: string } }>(
        `https://api.spotify.com/v1/users/${acc[0].accountId}/playlists`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          json: {
            name: name ?? `${userName}'s Top Songs`,
            description: "Created by Vinylify",
          },
        },
      );

      if (!res.ok) {
        return c.json({ error: "Failed to create playlist" }, 500);
      }

      const { id, external_urls } = await res.json();

      const trackRes = await ky.post<{ id: string }>(
        `https://api.spotify.com/v1/playlists/${id}/tracks`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          json: {
            uris,
          },
        },
      );

      if (!trackRes.ok) {
        return c.json({ error: "Failed to add tracks to playlist" }, 500);
      }

      return c.json({ playlistName: `${userName}'s Top Songs`, url: external_urls.spotify });
    },
  )
  .get("/profile", async (c) => {
    const user = c.get("user");
    const session = c.get("session");

    if (!user || !session) return c.json({ error: "Unauthorized" }, 401);

    let topTracks: Tracks | null = null;
    const shares = await db.select().from(share).where(eq(share.userId, user.id));

    if (shares.length > 0) {
      const { trackIds } = shares[0];
      const accessToken = await spotifyServerAccessToken();

      topTracks = await ky
        .get(`https://api.spotify.com/v1/tracks?ids=${trackIds}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .json<Tracks>();
    }

    return c.json({ user, topTracks, share: shares.length > 0 ? shares[0] : null });
  });

const apiRouter = new Hono().route("/api", router);

export default apiRouter;

export type Router = typeof router;
