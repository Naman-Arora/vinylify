<script lang="ts">
  import { authClient } from "$lib/auth-client";
  const session = authClient.useSession();
</script>

<header class="navbar bg-base-200/75 fixed top-0 left-0 shadow-sm backdrop-blur-md">
  <div class="flex-1">
    <a href="/" aria-label="home" class="btn btn-ghost text-xl font-bold">Vinylify</a>
  </div>
  {#if $session.data}
    <a
      href="/profile"
      aria-label="Profile"
      class={["btn btn-ghost btn-circle avatar", !$session.data.user.image && "avatar-placeholder"]}
    >
      <div class="bg-neutral text-neutral-content w-10 rounded-full">
        {#if $session.data.user.image}
          <img alt="Profile" src={$session.data.user.image} />
        {:else}
          <span class="text-xl">{$session.data.user.name.at(0)?.toLocaleUpperCase()}</span>
        {/if}
      </div>
    </a>
  {/if}
</header>
