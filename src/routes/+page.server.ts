import { auth } from "$lib/server/auth";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ request, url }) => {
  const session = await auth.api.getSession({ headers: request.headers });

  const path = url.pathname;
  const params = new URLSearchParams();
  params.append("redirectPath", path);

  if (!session) {
    redirect(302, `/login?${params.toString()}`);
  }
};
