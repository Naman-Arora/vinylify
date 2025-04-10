<script lang="ts">
  import { type Vinylify } from "$lib/vinylify.svelte";
  import { fade, blur } from "svelte/transition";

  type Props = {
    vinylify: Vinylify;
  };
  let { vinylify }: Props = $props();
</script>

<div
  class={[
    "font-dm-sans absolute top-[98.5%] left-[50%] z-10 flex w-[98%] -translate-x-1/2 -translate-y-[100%] flex-col justify-center gap-0.5 overflow-hidden rounded-lg border border-gray-200 bg-white/70 bg-clip-padding text-center text-black backdrop-blur-sm backdrop-filter transition-all duration-250 ease-in-out sm:w-[80%] md:w-[60%] lg:w-[40%]",
    vinylify.focusedIndex === null ? "h-4" : "h-20 delay-200",
  ]}
>
  {#if vinylify.focusedIndex === null}
    <div
      transition:blur
      class={["absolute h-full bg-gray-500/75"]}
      style="width: {vinylify.progress}%;"
    ></div>
  {/if}

  {#if vinylify.focusedSongDetails}
    <div
      transition:fade={{ delay: vinylify.focusedIndex === null ? 0 : 200, duration: 250 }}
      class={["text-center"]}
    >
      <p class="truncate px-2 md:px-4">
        <a
          href={vinylify.focusedSongDetails.external_urls.spotify}
          target="_blank"
          class="text-xl font-black hover:underline"
        >
          {vinylify.focusedSongDetails.name
            ?.replace(/[[(].*?[\])]/g, "")
            .replace(/\s+/g, " ")
            .trim()}
        </a>
      </p>
      <p class="truncate px-2 text-lg md:px-4">
        <a
          href={vinylify.focusedSongDetails.album.artists[0].external_urls.spotify}
          target="_blank"
          class="font-bold hover:underline"
        >
          {vinylify.focusedSongDetails.album.artists[0].name
            ?.replace(/[[(].*?[\])]/g, "")
            .replace(/\s+/g, " ")
            .trim()}</a
        >
        –
        <a
          href={vinylify.focusedSongDetails.album.external_urls.spotify}
          target="_blank"
          class="hover:underline"
          >{vinylify.focusedSongDetails.album.name
            ?.replace(/[[(].*?[\])]/g, "")
            .replace(/\s+/g, " ")
            .trim()}</a
        >
      </p>
    </div>
  {/if}
</div>
