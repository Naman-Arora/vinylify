import { auth } from "$lib/server/auth";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ request: { headers } }) => {
  const session = await auth.api.getSession({ headers });
  if (!session) {
    throw redirect(302, "/");
  }

  return {};
};
