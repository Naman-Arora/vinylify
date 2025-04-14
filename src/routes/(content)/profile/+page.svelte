<script lang="ts">
  import { authClient } from "$lib/auth-client";
  // import { makeAPIClient } from "$lib/api/client";
  // const apiClient = makeAPIClient(fetch);
  const session = authClient.useSession();

  // let dialog = $state<HTMLDialogElement | null>(null);

  const name = $derived($session.data?.user?.name);
  const email = $derived($session.data?.user?.email);

  // function onDeleteUser() {
  //   authClient.deleteUser({ callbackURL: "/" });
  // }

  // function onDeleteShare() {
  //   apiClient.share.$delete();
  // }
</script>

<svelte:head>
  <title>Vinylify | Profile</title>
</svelte:head>

<!-- <dialog bind:this={dialog}></dialog> -->

<main class="flex flex-1 justify-center py-8">
  <!-- <article class="prose prose-xl w-[65ch]">
    <h1>Profile</h1>

    <section class="not-prose">
      <div role="alert" class="alert alert-info alert-soft">
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
          class="lucide lucide-info-icon lucide-info"
          ><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg
        >
        <span>12 unread messages. Tap to see.</span>
      </div>
    </section>
  </article> -->
  <div class="flex flex-row items-center gap-4">
    <div class={["avatar avatar-placeholder"]}>
      <div class="bg-neutral text-neutral-content w-24 rounded-full">
        {#if $session.data?.user.image}
          <img alt="Profile" src={$session.data.user.image} class="h-full w-full" />
        {:else}
          <span class="text-5xl font-bold"
            >{$session.data?.user.name.at(0)?.toLocaleUpperCase()}</span
          >
        {/if}
      </div>
    </div>
    <div class="">
      <p class="text-xl font-bold">{name}</p>
      <p class="text-base font-semibold">{email}</p>
    </div>
  </div>
</main>
