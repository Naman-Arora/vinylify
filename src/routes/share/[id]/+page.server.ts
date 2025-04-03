import { makeAPIClient } from "$lib/api";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch, params }) => {
  const api = makeAPIClient(fetch);
  const response = await api.share.$get({ query: { id: params.id } });
  const data = await response.json();
  // console.log(data);

  if (!response.ok || "error" in data) {
    return error(404, { message: "Link does not exist" });
  }

  return { tracks: data.tracks, userName: data.userName };
};
