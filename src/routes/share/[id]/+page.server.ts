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

  const tracks = data.tracks.map((track) => ({
    id: track.id,
    title: `${track.name} – ${track.artists[0].name}`
      .replace(/[[(].*?[\])]/g, "")
      .replace(/\s+/g, " ")
      .trim(),
    imageUrl: track.album.images[0].url,
  }));

  return { tracks, userName: data.userName };
};
