import { redirect } from "@sveltejs/kit";
import { makeAPIClient } from "$lib/api";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch }) => {
  const api = makeAPIClient(fetch);
  const data = await api["top-tracks"].$get({ query: {} });

  if (!data.ok) {
    redirect(302, "/");
  }

  return {
    info: await data.json(),
  };
};
