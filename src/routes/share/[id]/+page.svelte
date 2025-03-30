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

<main class="h-screen w-screen">
  <Canvas>
    <Scene topTracks={data.tracks} />
  </Canvas>
</main>
