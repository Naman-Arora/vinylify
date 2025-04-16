import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { makeAPIClient } from "$lib/api/client";

export const load: PageServerLoad = async ({ fetch }) => {
  const apiClient = makeAPIClient(fetch);
  const res = await apiClient.profile.$get();

  if (!res.ok) {
    throw redirect(302, "/");
  }

  const profile = await res.json();

  return {
    profile,
  };
};
