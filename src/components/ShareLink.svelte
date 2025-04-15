<script lang="ts">
  type Props = {
    url: string;
  };

  const { url }: Props = $props();
</script>

<div
  class={[
    "flex w-full flex-col items-center justify-between overflow-hidden rounded bg-gray-200 p-2 font-mono text-sm text-black sm:flex-row",
  ]}
>
  {url}
  <div class="flex flex-row gap-0.5">
    <button
      aria-label="Copy"
      onclick={() => navigator.clipboard.writeText(url)}
      class="btn btn-ghost btn-square"
      ><svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="lucide lucide-clipboard-copy-icon lucide-clipboard-copy"
        ><rect width="8" height="4" x="8" y="2" rx="1" ry="1" /><path
          d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
        /><path d="M16 4h2a2 2 0 0 1 2 2v4" /><path d="M21 14H11" /><path d="m15 10-4 4 4 4" /></svg
      ></button
    >
    <button
      aria-label="Open in new tab"
      onclick={() => window.open(url, "_blank")}
      class="btn btn-ghost btn-square"
      ><svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="lucide-external-link"
        ><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path
          d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
        /></svg
      >
    </button>
  </div>
</div>
