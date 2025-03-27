import { auth } from "$lib/server/auth";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ request, url }) => {
  const session = await auth.api.getSession({ headers: request.headers });

  const redirectPath = url.searchParams.get("redirectPath") || "/";

  if (session) {
    redirect(302, redirectPath);
  }

  return {
    redirectPath,
  };
};
