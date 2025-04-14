import { BETTER_AUTH_SECRET, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from "$env/static/private";
import { PUBLIC_BASE_URL } from "$env/static/public";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";

export const auth = betterAuth({
  baseURL: PUBLIC_BASE_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  secret: BETTER_AUTH_SECRET,

  user: {
    deleteUser: {
      enabled: true,
    },
  },

  // https://www.better-auth.com/docs/concepts/session-management#session-caching
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },

  // https://www.better-auth.com/docs/concepts/oauth
  socialProviders: {
    // github: {
    //   clientId: env.GITHUB_CLIENT_ID,
    //   clientSecret: env.GITHUB_CLIENT_SECRET,
    // },
    spotify: {
      clientId: SPOTIFY_CLIENT_ID,
      clientSecret: SPOTIFY_CLIENT_SECRET,
      scope: [
        "user-read-email",
        "user-read-private",
        // "user-read-playback-state",
        // "user-modify-playback-state",
        "user-library-read",
        // "user-library-modify",
        "user-top-read",
        "user-follow-read",
        "playlist-read-private",
        "playlist-read-collaborative",
        "playlist-modify-private",
        "playlist-modify-public",
        // "user-follow-modify",
      ],
    },
  },
});
