import { Hono } from "hono";
// import * as v from "valibot";
// import { vValidator } from "@hono/valibot-validator";
import { trimTrailingSlash } from "hono/trailing-slash";
import { auth } from "$lib/server/auth";

type User = typeof auth.$Infer.Session.user | null;
type Session = typeof auth.$Infer.Session.session | null;

type AuthRouter = {
  Variables: {
    user: User;
    session: Session;
  };
};

export const router = new Hono<AuthRouter>({ strict: true });

router.use(trimTrailingSlash());

router.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }

  c.set("user", session.user);
  c.set("session", session.session);
  return next();
});

router.get("/", (c) => c.text("Hello World"));

router.on(["POST", "GET"], "/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

router.get("/session", async (c) => {
  const session = c.get("session");
  const user = c.get("user");

  if (!user) return c.body(null, 401);

  return c.json({
    session,
    user,
  });
});

router.get("/test", (c) => {
  const user = c.get("user");
  const session = c.get("session");

  if (!user) return c.text("Unauthorized", 401);
  if (!session) return c.text("Session expired", 401);

  return c.text(`Hi, ${user.name}!`);
});

export const api = new Hono().route("/api", router);

export type Router = typeof router;
