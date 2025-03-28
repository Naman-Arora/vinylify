import { db } from "$lib/server/db";
import { auth } from "$lib/server/auth";
import { env } from "$env/dynamic/private";
import { account } from "$lib/server/db/schema";
import ky from "ky";
import { Hono } from "hono";
import * as v from "valibot";
import { eq } from "drizzle-orm";
import { trimTrailingSlash } from "hono/trailing-slash";
// import { SpotifyApi } from "@spotify/web-api-ts-sdk";

const SpotifyRefresh = v.object({
  access_token: v.string(),
  token_type: v.string(),
  expires_in: v.number(),
  refresh_token: v.string(),
  scope: v.string(),
});

type SpotifyRefresh = v.InferOutput<typeof SpotifyRefresh>;

const SpotifyTopTracks = v.object({
  href: v.string(),
  limit: v.number(),
  offset: v.number(),
  total: v.number(),
  next: v.nullable(v.string()),
  previous: v.nullable(v.string()),
  items: v.array(
    v.object({
      album: v.object({
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
        artists: v.array(
          v.object({
            external_urls: v.object({
              spotify: v.string(),
            }),
            href: v.string(),
            id: v.string(),
            name: v.string(),
            type: v.string(),
            uri: v.string(),
          }),
        ),
      }),
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
      // images: v.array(
      //   v.object({
      //     url: v.string(),
      //     height: v.nullable(v.number()),
      //     width: v.nullable(v.number()),
      //   }),
      // ),
      name: v.string(),
      popularity: v.number(),
      type: v.string(),
      uri: v.string(),
    }),
  ),
});

type SpotifyTopTracks = v.InferOutput<typeof SpotifyTopTracks>;

// const spotifyApi = SpotifyApi.withClientCredentials(
//   process.env.SPOTIFY_CLIENT_ID!,
//   process.env.SPOTIFY_CLIENT_SECRET!,
//   [],
// );

type User = typeof auth.$Infer.Session.user;
type Session = typeof auth.$Infer.Session.session;

type AuthRouter = {
  Variables: {
    user: User | null;
    session: Session | null;
  };
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

  .get("/top-tracks", async (c) => {
    const user = c.get("user");
    const session = c.get("session");

    if (!user || !session) return c.text("Unauthorized", 401);

    const acc = await db.select().from(account).where(eq(account.userId, user.id));

    if (!acc || !acc[0] || !acc[0].accessToken) return c.text("Unauthorized", 401);

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
        "https://api.spotify.com/v1/me/top/tracks?limit=10&time_range=long_term",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      .json();
    return c.json(topSongs);
  });

export const api = new Hono().route("/api", router);

export type Router = typeof router;
