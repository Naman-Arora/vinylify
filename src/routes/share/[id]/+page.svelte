<script lang="ts">
  import Scene from "@components/3d/Scene.svelte";
  import { Canvas } from "@threlte/core";
  import { onMount } from "svelte";

  let { data } = $props();

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

<main class="h-screen w-screen">
  <Canvas>
    <Scene topTracks={data.tracks} />
  </Canvas>
</main>
