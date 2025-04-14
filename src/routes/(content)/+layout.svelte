<script lang="ts">
  import Footer from "@components/Footer.svelte";
  import Header from "@components/Header.svelte";
  let { children } = $props();
</script>

<Header />
<div class="mt-16"></div>
{@render children()}
<Footer />
