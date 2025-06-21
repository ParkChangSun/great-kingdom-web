<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    popupActive: boolean;
    tailwind?: string;
    children: Snippet;
  }

  let { popupActive, tailwind, children }: Props = $props();
</script>

{#if popupActive}
  <div
    class={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-lg shadow-lg ${tailwind}`}
  >
    {@render children?.()}
  </div>
{/if}

<style lang="postcss">
  @reference "tailwindcss";
</style>
