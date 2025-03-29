import { apiRouter } from "$lib/api";
import type { RequestHandler } from "@sveltejs/kit";

export const fallback: RequestHandler = ({ request }) => apiRouter.fetch(request);
