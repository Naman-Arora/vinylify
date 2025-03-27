import { Hono } from "hono";
// import * as v from "valibot";
// import { vValidator } from "@hono/valibot-validator";
import { trimTrailingSlash } from "hono/trailing-slash";
import { auth } from "$lib/server/auth";

export const router = new Hono({ strict: true })
  .use(trimTrailingSlash())
  .get("/", (c) => c.text("Hello World"))
  .on(["POST", "GET"], "/auth/*", (c) => {
    return auth.handler(c.req.raw);
  });

export const api = new Hono().route("/api", router);

export type Router = typeof router;
