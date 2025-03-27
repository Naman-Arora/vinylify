import { Hono } from "hono";
import * as v from "valibot";
import { vValidator } from "@hono/valibot-validator";
import { trimTrailingSlash } from "hono/trailing-slash";
import { auth } from "$lib/server/auth";

export const Task = v.object({
  id: v.pipe(v.string(), v.uuid()),
  name: v.pipe(v.string("The name must be a string"), v.minLength(1)),
  done: v.boolean(),
});

export type Task = v.InferOutput<typeof Task>;

export const TaskCreateInput = v.pick(Task, ["name"]);

export type TaskCreateInput = v.InferOutput<typeof TaskCreateInput>;

export const TaskParam = v.pick(Task, ["id"]);
export type TaskParam = v.InferOutput<typeof TaskParam>;

/**
 * This will be our in-memory data store
 */
let tasks: Task[] = [];

export const router = new Hono({ strict: true })
  .use(trimTrailingSlash())
  .get("/", (c) => c.text("Hello World"))
  // http://localhost:5173/api/add

  .get("/add", (c) => {
    tasks = [
      {
        id: "a98e8c1b-bcac-4460-9fe7-969629e300fa",
        name: "One",
        done: false,
      },
      {
        id: "60738274-7dca-4465-ae61-7e6279903a10",
        name: "Two",
        done: false,
      },
      {
        id: "6a21109f-1fae-4b91-8af9-e5d550f7d4b3",
        name: "Three",
        done: false,
      },
      {
        id: "f0ed91c2-0b0f-408f-87fe-15e355790baa",
        name: "Four",
        done: false,
      },
    ];
    return c.json(tasks);
  })
  // http://localhost:5173/api/search?includes=o
  .get(
    "/search",
    vValidator("query", v.object({ includes: v.pipe(v.string(), v.minLength(1)) })),
    (c) =>
      c.json<Task[]>(
        tasks.flatMap((task) =>
          task.name.toLocaleLowerCase().includes(c.req.valid("query").includes) ? [task] : [],
        ),
      ),
  )

  .get("/tasks", (c) => c.json<Task[]>(tasks))
  .post("/tasks", vValidator("json", TaskCreateInput), (c) => {
    const body = c.req.valid("json");
    const task = {
      id: crypto.randomUUID(),
      name: body.name,
      done: false,
    };
    tasks.push(task);
    return c.json(task);
  })
  .post("/tasks/:id/finish", vValidator("param", TaskParam), (c) => {
    const { id } = c.req.valid("param");
    const task = tasks.find((task) => task.id === id);
    if (task) {
      task.done = true;
      return c.json(task);
    }

    throw c.json({ message: "Task not found" }, 404);
  })
  .post("/tasks/:id/undo", vValidator("param", TaskParam), (c) => {
    const { id } = c.req.valid("param");
    const task = tasks.find((task) => task.id === id);
    if (task) {
      task.done = false;
      return c.json(task);
    }

    throw c.json({ message: "Task not found" }, 404);
  })
  .post("/tasks/:id/delete", vValidator("param", TaskParam), (c) => {
    const { id } = c.req.valid("param");
    tasks = tasks.filter((task) => task.id !== id);
    return c.json({ message: "Task deleted" });
  })
  .on(["POST", "GET"], "/api/auth/*", (c) => {
    return auth.handler(c.req.raw);
  });

export const api = new Hono().route("/api", router);

export type Router = typeof router;
