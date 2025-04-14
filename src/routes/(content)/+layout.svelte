<script lang="ts">
  import { authClient } from "$lib/auth-client";
  let { children } = $props();

  const session = authClient.useSession();
</script>

<header class="navbar fixed bg-white/75 backdrop-blur-md top-0 left-0 shadow-sm">
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
<div class="mt-16"></div>
{@render children()}
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
