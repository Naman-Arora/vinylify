import apiRouter from "$lib/api/router";
import type { RequestHandler } from "@sveltejs/kit";

export const fallback: RequestHandler = ({ request }) => apiRouter.fetch(request);
