<script lang="ts">
  import { makeAPIClient } from "$lib/api/client";
  import { authClient } from "$lib/auth-client";
  import { Vinylify } from "$lib/vinylify.svelte";
  import Scene from "@components/3d/Scene.svelte";
  import SongInfo from "@components/SongInfo.svelte";
  import { Canvas } from "@threlte/core";
  import { toast } from "svelte-sonner";

  let { data } = $props();
  const session = authClient.useSession();
  const vinylify = new Vinylify(data.tracks);
  const title = `${data.userName}'s Top Tracks`;

  $effect(() => {
    vinylify.tracks = data.tracks;
  });

  const apiClient = makeAPIClient(fetch);

  let creatingPlaylist = $state(false);

  async function onCreatePlaylist() {
    creatingPlaylist = true;
    const res = await apiClient.playlist.$post({
      json: { uris: vinylify.tracks.map((item) => item.uri), name: title },
    });
    if (res.ok) {
      const { url } = await res.json();
      toast.success("Playlist created successfully!", {
        action: { label: "Open", onClick: () => window.open(url, "_blank") },
      });
    } else {
      toast.error("Failed to create playlist. Please try again.");
    }
    creatingPlaylist = false;
  }
</script>

<svelte:head>
  <title>Vinylify | {title}</title>
</svelte:head>

<div class="absolute top-2 right-2 z-20 flex flex-row gap-4">
  {#if $session.data}
    <button
      class={["btn btn-soft btn-primary", creatingPlaylist && "btn-disabled"]}
      onclick={onCreatePlaylist}
      disabled={creatingPlaylist}
      >Create Playlist
      {#if creatingPlaylist}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide-loader-circle size-6 animate-spin fill-none stroke-current stroke-2"
          ><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg
        >
      {:else}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="icon-tabler-playlist-add size-6 fill-none stroke-current stroke-2"
          ><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M19 8h-14" /><path
            d="M5 12h9"
          /><path d="M11 16h-6" /><path d="M15 16h6" /><path d="M18 13v6" /></svg
        >
      {/if}
    </button>
  {/if}
  <p class="btn bg-base-100 pointer-events-none cursor-default">{title}</p>
</div>

<SongInfo {vinylify} />

<main class="h-screen w-screen">
  <Canvas>
    <Scene {vinylify} />
  </Canvas>
</main>
