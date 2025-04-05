import { Tween } from "svelte/motion";
import { quadInOut } from "svelte/easing";
import { type Track } from "@spotify/web-api-ts-sdk";

export class Vinylify {
  focusedIndex = $state<number | null>(null);
  tracks = $state<Track[]>([]);
  cardGroup = {
    posX: new Tween(0, { easing: quadInOut, duration: 500 }),
    posY: new Tween(0, { easing: quadInOut, duration: 500 }),
    posZ: new Tween(0, { easing: quadInOut, duration: 500 }),
  };
  trackLength = $derived(this.tracks.length);
  progress = $derived.by(() => {
    let percent = -this.cardGroup.posX.current / (-0.5 + (this.trackLength - 1) * 0.175);
    if (percent < 0) percent = 0;
    if (percent > 1) percent = 1;
    return percent * 100;
  });
  focusedSongDetails = $derived.by(() => {
    if (this.focusedIndex === null) return null;
    return this.tracks[this.focusedIndex];
  });

  constructor(tracks: Track[]) {
    this.tracks = tracks;
  }
}
