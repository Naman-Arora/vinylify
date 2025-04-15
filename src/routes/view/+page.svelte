<script lang="ts">
  import { makeAPIClient } from "$lib/api/client";
  import { Vinylify } from "$lib/vinylify.svelte";
  import Scene from "@components/3d/Scene.svelte";
  import ShareLink from "@components/ShareLink.svelte";
  import SongInfo from "@components/SongInfo.svelte";
  import { Canvas } from "@threlte/core";
  import { toast } from "svelte-sonner";

  let { data } = $props();
  const vinylify = new Vinylify(data.tracks);

  const apiClient = makeAPIClient(fetch);

  let dialog = $state<HTMLDialogElement | null>(null);
  let shareMutating = $state(false);
  let creatingPlaylist = $state(false);
  let dialogContent = $state({
    title: "Error",
    link: "",
    message: "An error occured while creating a shareable link of your vinyls. Please try again.",
    success: false,
  });

  async function onCreatePlaylist() {
    creatingPlaylist = true;
    const res = await apiClient.playlist.$post({
      json: { uris: vinylify.tracks.map((item) => item.uri) },
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

  async function onShare() {
    if (dialogContent.success) {
      dialog?.showModal();
      return;
    }

    shareMutating = true;
    const res = await apiClient.share.$post({
      json: { trackIds: vinylify.tracks.map((item) => item.id), timeRange: vinylify.timeRange },
    });

    if (res.ok) {
      const { shareLink } = await res.json();
      dialogContent = {
        title: "Success",
        link: `${window.location.protocol}//${window.location.host}/share/${shareLink}`,
        message: "Shareable link created successfully, make sure to show your friends!",
        success: true,
      };
    }
    shareMutating = false;
    dialog?.showModal();
  }
</script>

<svelte:head>
  <title>Vinylify | Your Top Songs</title>
</svelte:head>

<dialog bind:this={dialog} class="modal">
  <div
    class={[
      "modal-box flex flex-col gap-4",
      dialogContent.success ? "bg-success text-success-content" : "bg-error text-error-content",
    ]}
  >
    <h3 class="text-2xl font-bold">{dialogContent.title}</h3>
    <p>{dialogContent.message}</p>
    {#if dialogContent.link}
      <ShareLink url={dialogContent.link} />
    {/if}
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>

<div class="absolute top-0 right-0 z-20 flex flex-row gap-2 p-4 md:gap-4">
  <select
    bind:value={() => vinylify.range, (v) => vinylify.onTimeRangeChange(v)}
    class="select select-primary font-semibold"
  >
    <option disabled>Duration</option>
    <option>Recent</option>
    <option>Last 6 Months</option>
    <option>All Time</option>
  </select>
  <button
    class={["btn btn-soft btn-secondary", creatingPlaylist && "btn-disabled"]}
    onclick={onCreatePlaylist}
    disabled={creatingPlaylist}
    >Add Playlist
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

  <button
    class={["btn btn-soft btn-accent", shareMutating && "btn-disabled"]}
    disabled={shareMutating}
    onclick={onShare}
  >
    Share
    {#if shareMutating}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="lucide-loader-circle size-6 animate-spin"
        ><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg
      >
    {:else}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="lucide-share size-6"
        ><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline
          points="16 6 12 2 8 6"
        /><line x1="12" x2="12" y1="2" y2="15" /></svg
      >
    {/if}
  </button>
</div>

<SongInfo {vinylify} />

<main class="h-screen w-screen">
  <Canvas>
    <Scene {vinylify} />
  </Canvas>
</main>
