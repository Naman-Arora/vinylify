<script lang="ts">
  import { authClient } from "$lib/auth-client";
  import Header from "@components/Header.svelte";
  import Footer from "@components/Footer.svelte";
  const session = authClient.useSession();

  let userName = $derived.by(() => {
    if ($session.data) {
      if ($session.data.user.name.includes(" ")) {
        return $session.data.user.name.split(" ")[0];
      }
      return $session.data.user.name;
    }
    return "";
  });
</script>

<svelte:head>
  <title>Vinylify</title>
  <meta name="description" content="Turn your top Spotify songs into vinyl records!" />
</svelte:head>

<Header />
<div
  class="font-dm-sans flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-br from-purple-900 to-indigo-900 p-4 text-white"
>
  <div class="flex flex-col gap-4">
    {#if userName}
      <p class="text-left text-2xl font-semibold">Hi {userName},</p>
    {/if}
    <h1 class="text-center text-6xl font-black">Welcome to Vinylify</h1>
    <p class="text-center text-xl text-pretty">Turn your top Spotify songs into vinyl records!</p>
  </div>

  {#if $session.data}
    <div class="flex flex-row items-center gap-4 text-lg">
      <a
        href="/view"
        class="group relative flex flex-row items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl"
        >View your top vinyls
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
          class="lucide-arrow-right"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg
        >
      </a>
    </div>
  {:else}
    <button
      class="flex w-72 flex-row items-center gap-4 rounded-full bg-green-500 px-6 py-3 font-bold text-white transition duration-300 hover:bg-green-600"
      onclick={async () => {
        await authClient.signIn.social({
          provider: "spotify",
          callbackURL: "/view",
        });
      }}
    >
      <svg
        class="size-10 text-white"
        role="img"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        color="white"
        ><title>Spotify</title><path
          d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"
        /></svg
      >
      Sign in with Spotify
    </button>
  {/if}
</div>
<Footer />
