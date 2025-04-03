<script lang="ts">
  import { Canvas } from "@threlte/core";
  import { onMount } from "svelte";
  import { Vinylify } from "$lib/vinylify.svelte";
  import Scene from "@components/3d/Scene.svelte";
  import SongInfo from "@components/SongInfo.svelte";

  let { data } = $props();

  const vinylify = new Vinylify(data.tracks);

  $effect(() => {
    vinylify.tracks = data.tracks;
  });

  onMount(() => {
    document.body.classList.add("overflow-hidden");
  });
</script>

<svelte:head>
  <title>Vinylify | {data.userName}'s Top Tracks</title>
</svelte:head>

<div
  class="font-dm-sans bg-base-100 text-base-content absolute top-2 right-2 z-20 flex flex-row gap-4 rounded p-2 font-bold"
>
  <p>{data.userName}'s Top Tracks</p>
</div>

<SongInfo {vinylify} />

<main class="h-screen w-screen">
  <Canvas>
    <Scene {vinylify} />
  </Canvas>
</main>
