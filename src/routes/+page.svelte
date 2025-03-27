<script lang="ts">
  import { authClient } from "$lib/auth-client";
  const session = authClient.useSession();
</script>

<svelte:head>
  <title>Records</title>
</svelte:head>

<div class="flex flex-col gap-4 p-10">
  <h1 class="text-4xl font-bold">Welcome to Records!</h1>

  {#if $session.data}
    <div>
      <p>
        {$session?.data?.user.name}
      </p>
      <button
        onclick={async () => {
          await authClient.signOut();
        }}
      >
        Sign Out
      </button>
    </div>
  {:else}
    <div>
      <p>You are not logged in.</p>
      <a href="/login">Login</a>
    </div>
  {/if}
</div>
