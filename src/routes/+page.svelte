<script lang="ts">
  import { authClient } from "$lib/auth-client";
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

<header class="navbar fixed top-0 left-0 bg-white/75 shadow-sm backdrop-blur-md">
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
    <button
      onclick={async () => {
        await authClient.signOut();
      }}
      class="btn btn-ghost btn-secondary"
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
        class="lucide-log-out size-6"
        ><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline
          points="16 17 21 12 16 7"
        /><line x1="21" x2="9" y1="12" y2="12" /></svg
      >
      Sign Out
    </button>
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
<footer class="footer footer-horizontal footer-center bg-base-200 text-base-content rounded p-10">
  <nav class="grid grid-flow-col gap-4">
    <a href="/" aria-label="Home" class="link link-hover hover:text-accent">Home</a>
    <a href="/about" aria-label="About" class="link link-hover hover:text-accent">About</a>
    <a href="/privacy" aria-label="Privacy" class="link link-hover hover:text-accent"
      >Privacy Policy</a
    >
  </nav>
  <nav>
    <div class="grid grid-flow-col gap-4">
      <a href="https://namanarora.net" aria-label="Portfolio">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="hover:stroke-accent size-8 fill-none stroke-current stroke-2"
          ><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
            d="M19.5 7a9 9 0 0 0 -7.5 -4a8.991 8.991 0 0 0 -7.484 4"
          /><path d="M11.5 3a16.989 16.989 0 0 0 -1.826 4" /><path
            d="M12.5 3a16.989 16.989 0 0 1 1.828 4"
          /><path d="M19.5 17a9 9 0 0 1 -7.5 4a8.991 8.991 0 0 1 -7.484 -4" /><path
            d="M11.5 21a16.989 16.989 0 0 1 -1.826 -4"
          /><path d="M12.5 21a16.989 16.989 0 0 0 1.828 -4" /><path
            d="M2 10l1 4l1.5 -4l1.5 4l1 -4"
          /><path d="M17 10l1 4l1.5 -4l1.5 4l1 -4" /><path d="M9.5 10l1 4l1.5 -4l1.5 4l1 -4" /></svg
        >
      </a>
      <a href="mailto:contact@namanarora.net" aria-label="Email Me">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="hover:stroke-accent size-8 fill-none stroke-current stroke-2"
          ><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
            d="M13 19h-8a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v6"
          /><path d="M3 7l9 6l9 -6" /><path d="M16 22l5 -5" /><path d="M21 21.5v-4.5h-4.5" /></svg
        >
      </a>
      <a href="https://linkedin.com/in/namarora" aria-label="LinkedIn">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="hover:stroke-accent size-8 fill-none stroke-current stroke-2"
          ><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M8 11v5" /><path
            d="M8 8v.01"
          /><path d="M12 16v-5" /><path d="M16 16v-3a2 2 0 1 0 -4 0" /><path
            d="M3 7a4 4 0 0 1 4 -4h10a4 4 0 0 1 4 4v10a4 4 0 0 1 -4 4h-10a4 4 0 0 1 -4 -4z"
          /></svg
        >
      </a>
      <a href="https://github.com/naman-arora" aria-label="GitHub">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="hover:stroke-accent size-8 fill-none stroke-current stroke-2"
          ><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
            d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5"
          /></svg
        >
      </a>
      <a href="https://instagram.com/namarora" aria-label="Instagram">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="hover:stroke-accent size-8 fill-none stroke-current stroke-2"
          ><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
            d="M4 8a4 4 0 0 1 4 -4h8a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4z"
          /><path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" /><path d="M16.5 7.5v.01" /></svg
        >
      </a>
    </div>
  </nav>
  <aside>
    <p>© {new Date().getFullYear()} Naman Arora. All rights reserved.</p>
  </aside>
</footer>
