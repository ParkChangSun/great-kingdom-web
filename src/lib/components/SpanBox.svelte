<script lang="ts">
  interface Props {
    list: string[];
    tailwind?: string;
  }

  let { list, tailwind }: Props = $props();

  let div: HTMLDivElement;
  $effect(() => {
    const { scrollTop, scrollHeight, clientHeight } = div;

    if (list && scrollTop + clientHeight >= scrollHeight - 50) {
      div.scroll({ top: div.scrollHeight, behavior: "smooth" });
    }
  });
</script>

<div
  class={`p-2 flex flex-col border-2 border-indigo-500 overflow-y-scroll ${tailwind}`}
  bind:this={div}
>
  {#each list as l}
    <span>{l}</span>
  {/each}
</div>

<style lang="postcss">
  @reference "tailwindcss";
</style>
