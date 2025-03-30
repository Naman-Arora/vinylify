<script lang="ts">
  type Props = {
    songFocused: boolean;
    songName?: string;
    artistName?: string;
    albumName?: string;
  };
  let { songName = $bindable(), artistName, albumName, songFocused }: Props = $props();
</script>

<div
  class={[
    "glass font-dm-sans absolute top-[50%] left-[50%] z-10 flex h-20 w-64 -translate-x-1/2 -translate-y-1/2 transform flex-col gap-4 rounded-xl text-center",
    songFocused ? "visible block" : "invisible hidden",
  ]}
>
  <p class="text-2xl font-bold">{songName}</p>
  <p class="font-base text-lg">{artistName} – {albumName}</p>
</div>
