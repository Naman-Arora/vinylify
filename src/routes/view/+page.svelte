<script lang="ts">
  import { makeAPIClient } from "$lib/api/client";
  import Scene from "@components/3d/Scene.svelte";
  import { onMount } from "svelte";
  import { Canvas } from "@threlte/core";

  let { data } = $props();

  let dialog = $state<HTMLDialogElement | null>(null);
  let shareMutating = $state(false);
  let dialogContent = $state({
    title: "Error",
    link: "",
    message: "An error occured while creating a shareable link of your vinyls. Please try again.",
    success: false,
  });

  async function onShare() {
    if (dialogContent.success) {
      dialog?.showModal();
      return;
    }

    shareMutating = true;

    const res = await makeAPIClient(fetch).share.$post({
      json: data.info.items.map((item) => item.id),
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

  onMount(() => {
    document.body.classList.add("overflow-hidden");
  });
</script>

<svelte:head>
  <title>Vinylify | View</title>
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
      <div
        class={[
          "flex w-full flex-row items-center justify-between rounded bg-gray-200 p-2 font-mono text-black text-sm",
        ]}
      >
        {dialogContent.link}
        <div class="flex flex-row gap-0.5">
          <button
            aria-label="Copy"
            onclick={() => navigator.clipboard.writeText(dialogContent.link)}
            class="btn btn-ghost btn-square"
            ><svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-clipboard-copy-icon lucide-clipboard-copy"
              ><rect width="8" height="4" x="8" y="2" rx="1" ry="1" /><path
                d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
              /><path d="M16 4h2a2 2 0 0 1 2 2v4" /><path d="M21 14H11" /><path
                d="m15 10-4 4 4 4"
              /></svg
            ></button
          >
          <button
            aria-label="Open in new tab"
            onclick={() => window.open(dialogContent.link, "_blank")}
            class="btn btn-ghost btn-square"
            ><svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide-external-link"
              ><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path
                d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
              /></svg
            >
          </button>
        </div>
      </div>
    {/if}
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>

<div class="absolute top-0 right-0 z-20 flex flex-row gap-4 p-4">
  <select class="select select-primary">
    <option>Short Term</option>
    <option>Mediun Term</option>
    <option selected>Long Term</option>
  </select>
  <button
    class={["btn btn-soft btn-secondary", shareMutating ? "btn-disabled" : ""]}
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

<main class="h-screen w-screen">
  <Canvas>
    <Scene
      topTracks={data.info.items.map((track) => ({
        imageUrl: track.album.images[0].url,
        title: `${track.name} – ${track.album.artists[0].name}`
          .replace(/[[(].*?[\])]/g, "")
          .replace(/\s+/g, " ")
          .trim(),
      }))}
    />
  </Canvas>
</main>
