<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import { makeAPIClient } from "$lib/api/client";
  import { authClient } from "$lib/auth-client";
  import ShareLink from "@components/ShareLink.svelte";
  import { onMount } from "svelte";
  import { toast } from "svelte-sonner";

  const { data } = $props();

  const apiClient = makeAPIClient(fetch);

  let modal = $state<HTMLDialogElement | null>(null);
  let modalType = $state<"deleteShared" | "deleteAccount">("deleteShared");
  let modalInput = $state<string>("");
  let modalInputValid = $state<boolean>(true);

  const name = $derived(data.profile.user.name);
  const email = $derived(data.profile.user.email);
  let shareLink = $state("");

  const timeFrame = $derived.by(() => {
    if (data.profile.share?.timeRange === "short_term") return "to recently";
    if (data.profile.share?.timeRange === "medium_term") return "to over the last 6 months";
    return "through all time";
  });

  async function deleteShared() {
    toast.promise(apiClient.share.$delete(), {
      loading: "Deleting your shared songs...",
      success: () => {
        modal?.close();
        invalidateAll();
        return "Your shared songs were deleted successfully!";
      },
      error: () => {
        modal?.close();
        return "Failed to delete your shared songs. Please try again later.";
      },
    });
  }

  function deleteAccount() {
    if (modalInput !== "DELETE") {
      modalInputValid = false;
      return;
    }
    modalInputValid = true;
    authClient.deleteUser({ callbackURL: "/" });
  }

  onMount(() => {
    shareLink = `${window.location.host}/s/${data.profile.share?.id}`;
  });
</script>

<svelte:head>
  <title>Vinylify | Profile</title>
</svelte:head>

<dialog bind:this={modal} class="modal">
  <div class="modal-box flex flex-col gap-3">
    {#if modalType === "deleteShared"}
      <p class="text-xl font-bold">Delete Shared Songs</p>
      <p class="">If you want to reshare your songs, click the "Share" button on the view page.</p>

      <button class="btn btn-error" onclick={deleteShared}>Delete Shared</button>
    {:else}
      <p class="text-xl font-bold">Delete Account</p>
      <p class="">
        Are you sure you want to delete your account? This action is permanent and cannot be undone
        once started.
      </p>
      <fieldset class="fieldset text-base">
        <legend class="fieldset-legend">To confirm, type "DELETE"</legend>
        <input
          bind:value={modalInput}
          type="text"
          class={["input w-full", !modalInputValid && "input-error"]}
          placeholder="DELETE"
        />
        {#if !modalInputValid}
          <p class="fieldset-label text-error text-sm">Input does not match "DELETE"</p>
        {/if}
      </fieldset>
      <button class="btn btn-error" onclick={deleteAccount}>Delete Account</button>
    {/if}
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>

<main class="flex min-h-screen w-full flex-col gap-8 px-0 py-8 md:px-12 lg:px-20">
  <p class="flex flex-row items-center gap-4 px-4 text-3xl font-bold md:px-0">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="lucide-circle-user-round size-10 fill-none stroke-current stroke-2"
      ><path d="M18 20a6 6 0 0 0-12 0" /><circle cx="12" cy="10" r="4" /><circle
        cx="12"
        cy="12"
        r="10"
      /></svg
    >Profile
  </p>
  <section class="bg-base-200 rounded-box flex flex-col items-center gap-4 px-8 py-4">
    <div class="flex flex-row items-center gap-4">
      <div class={["avatar avatar-placeholder"]}>
        <div class="bg-neutral text-neutral-content size-20 rounded-full md:size-28">
          {#if data.profile.user.image}
            <img alt="Profile" src={data.profile.user.image} class="h-full w-full" />
          {:else}
            <span class="text-5xl font-bold md:text-6xl">{name.at(0)?.toLocaleUpperCase()}</span>
          {/if}
        </div>
      </div>
      <div class="flex flex-col gap-1">
        <p class="text-3xl font-bold">{name}</p>
        <p class="text-xl font-semibold">{email}</p>
      </div>
    </div>
    <div>
      <div class="flex flex-row gap-4">
        <button class="btn btn-primary min-w-40" onclick={async () => await authClient.signOut()}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide-log-out size-4 fill-none stroke-current stroke-2"
            ><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline
              points="16 17 21 12 16 7"
            /><line x1="21" x2="9" y1="12" y2="12" /></svg
          >Sign Out</button
        >
        <button
          class="btn btn-error min-w-40"
          onclick={() => {
            modalType = "deleteAccount";
            modal?.show();
          }}
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="icon-tabler-trash size-4 fill-none stroke-current stroke-2"
            ><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M4 7l16 0" /><path
              d="M10 11l0 6"
            /><path d="M14 11l0 6" /><path
              d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"
            /><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></svg
          >Delete Account</button
        >
      </div>
    </div>
  </section>
  {#if data.profile.share && data.profile.topTracks}
    <section class="bg-base-200 rounded-box flex w-full flex-col gap-4 p-4">
      <p class="text-xl font-bold">Your Shared Songs</p>
      <p class="text-lg font-semibold">Link</p>
      <ShareLink url={shareLink} />
      <p class="text-lg font-semibold">Songs</p>
      <ul class="list bg-base-100 rounded-box max-h-120 overflow-x-auto shadow-md">
        <li
          class="bg-base-100/80 sticky top-0 z-[2] p-4 pb-2 text-sm tracking-wide opacity-100 backdrop-blur"
        >
          Your shared songs, listened {timeFrame}.
        </li>
        {#each data.profile.topTracks.tracks as track (track.id)}
          <li class="list-row">
            <div>
              <img
                class="rounded-box size-10"
                src={track.album.images[0].url}
                alt={track.album.name}
              />
            </div>
            <div>
              <div>{track.name}</div>
              <div class="text-xs font-semibold opacity-60">
                {track.artists.map((artist) => artist.name).join(", ")} – {track.album.name}
              </div>
            </div>
            <a
              class="btn btn-square btn-ghost"
              aria-label="Play on Spotify"
              href={track.external_urls.spotify}
            >
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
                class="lucide lucide-play-icon lucide-play"
                ><polygon points="6 3 20 12 6 21 6 3" /></svg
              >
            </a>
          </li>{/each}
      </ul>
      <p class="text-lg font-semibold">Delete Shared Songs</p>
      <div role="alert" class="alert alert-info">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide-info size-6 fill-none stroke-current stroke-2"
          ><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg
        >
        <span
          >To share your top songs again, visit the <a href="/view" class="link">view</a> page and
          click the
          <code>share</code> button.</span
        >
      </div>
      <button
        class="btn btn-error w-full md:max-w-64"
        onclick={() => {
          modalType = "deleteShared";
          modal?.show();
        }}
        ><svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="icon-tabler-share-off size-6 fill-none stroke-current stroke-2"
          ><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
            d="M6 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"
          /><path d="M18 6m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path
            d="M15.861 15.896a3 3 0 0 0 4.265 4.22m.578 -3.417a3.012 3.012 0 0 0 -1.507 -1.45"
          /><path d="M8.7 10.7l1.336 -.688m2.624 -1.352l2.64 -1.36" /><path
            d="M8.7 13.3l6.6 3.4"
          /><path d="M3 3l18 18" /></svg
        >Delete Shared Songs</button
      >
    </section>
  {/if}
</main>
