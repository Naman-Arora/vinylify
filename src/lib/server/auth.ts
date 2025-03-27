import { env } from "$env/dynamic/private";
import { PUBLIC_BASE_URL } from "$env/static/public";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "./db";

export const auth = betterAuth({
	baseURL: PUBLIC_BASE_URL,
	database: drizzleAdapter(db, {
		provider: "pg",
	}),

	// https://www.better-auth.com/docs/concepts/session-management#session-caching
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60, // 5 minutes
		},
	},

	// https://www.better-auth.com/docs/concepts/oauth
	socialProviders: {
		github: {
			clientId: env.GITHUB_CLIENT_ID!,
			clientSecret: env.GITHUB_CLIENT_SECRET!,
		},
		spotify: {
			clientId: env.SPOTIFY_CLIENT_ID!,
			clientSecret: env.SPOTIFY_CLIENT_SECRET!,
		},
	},

	// https://www.better-auth.com/docs/authentication/email-password
	// emailAndPassword: {
	//   enabled: true,
	// },
});