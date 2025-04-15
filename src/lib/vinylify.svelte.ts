import { type Track } from "@spotify/web-api-ts-sdk";
import { quadInOut } from "svelte/easing";
import { Tween } from "svelte/motion";
import { type Mesh } from "three";
import { makeAPIClient } from "./api/client";

type Range = "Recent" | "Last 6 Months" | "All Time";

class Card {
  mesh = $state<Mesh | null>(null);
  title: string;
  imageUrl: string;
  positionX: Tween<number>;
  positionY: Tween<number>;
  positionZ: Tween<number>;
  rotationX: Tween<number>;
  rotationY: Tween<number>;
  rotationZ: Tween<number>;

  constructor(
    imageUrl: string,
    title: string,
    positionX: number = 0,
    positionY: number = 0,
    positionZ: number = 0,
    rotationX: number = 0,
    rotationY: number = 90,
    rotationZ: number = 0,
  ) {
    this.title = title;
    this.imageUrl = imageUrl;
    this.positionX = new Tween(positionX, { easing: quadInOut });
    this.positionY = new Tween(positionY, { easing: quadInOut });
    this.positionZ = new Tween(positionZ, { easing: quadInOut });
    this.rotationX = new Tween(rotationX, { easing: quadInOut });
    this.rotationY = new Tween(rotationY, { easing: quadInOut });
    this.rotationZ = new Tween(rotationZ, { easing: quadInOut });
  }
}

export class Vinylify {
  private apiClient = makeAPIClient(fetch);
  private trackCache = new Map<string, Track[]>();

  focusedIndex = $state<number | null>(null);

  tracks = $state<Track[]>([]);

  cards = $derived(
    this.tracks.map(
      (track, index) =>
        new Card(
          track.album.images[0].url,
          `${track.name} – ${track.album.artists[0].name}`
            .replace(/[[(].*?[\])]/g, "")
            .replace(/\s+/g, " ")
            .trim(),
          -0.5 + index * 0.175,
        ),
    ),
  );

  cam = {
    posX: new Tween(0, { easing: quadInOut, duration: 500 }),
    posY: new Tween(0.035, { easing: quadInOut, duration: 500 }),
    posZ: new Tween(2.75, { easing: quadInOut, duration: 500 }),
    zoom: new Tween(1, { easing: quadInOut, duration: 500 }),
  };

  cardGroup = {
    posX: new Tween(0, { easing: quadInOut, duration: 500 }),
    posY: new Tween(0, { easing: quadInOut, duration: 500 }),
    posZ: new Tween(0, { easing: quadInOut, duration: 500 }),
  };

  private trackLength = $derived(this.tracks.length);

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

  range = $state<Range>("All Time");

  timeRange = $derived.by<"short_term" | "medium_term" | "long_term">(() => {
    if (this.range === "Recent") return "short_term";
    if (this.range === "Last 6 Months") return "medium_term";
    return "long_term";
  });

  constructor(tracks: Track[]) {
    this.tracks = tracks;
    this.trackCache.set(this.timeRange, tracks);
  }

  onTimeRangeChange(range: Range) {
    this.range = range;
    this.fetchTopTracks();
  }

  private async fetchTopTracks() {
    this.reset();
    if (this.trackCache.has(this.timeRange)) {
      this.tracks = this.trackCache.get(this.timeRange)!;
    }
    const res = await this.apiClient["top-tracks"].$get({ query: { time_range: this.timeRange } });
    if (res.ok) {
      const { items } = await res.json();
      this.trackCache.set(this.timeRange, items);
      this.tracks = items;
    }
  }

  closeVinyl() {
    if (this.focusedIndex === null) return;
    const card = this.cards[this.focusedIndex];
    card.rotationY.set(90, { duration: 500 });
    this.cam.zoom.set(1, { duration: 500 });
    card.positionZ.set(0, { duration: 500, delay: 500 });
    this.cardGroup.posZ.set(0, { duration: 500, delay: 500 });
    this.focusedIndex = null;
  }

  reset() {
    this.closeVinyl();
    this.cardGroup.posX.set(0, { duration: 250 });
  }
}
