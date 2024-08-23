<script lang="ts">
  import { fade, slide } from "svelte/transition";
  import ArrowUp from "./lib/svelte-components/ArrowUp.svelte";
  import { cubicInOut } from "svelte/easing";
  export let pages: string[];
  export let color: string = "";
  export let onPageUpdate: (curPage: number) => void = () => {};
  let revealCount = 1;
</script>

<div class="flex flex-col">
  {#each pages.slice(0, revealCount) as page, i}
    <div transition:slide>
      <div
        class={`
            ml-5 px-4 py-1 backdrop-blur-sm text-sm transition-all duration-300
            ${i === 0 ? "mt-0" : "mt-3"}
            ${i === revealCount - 1 ? "font-semibold" : "font-light"}
          `}
        style="border-left: 2px solid {color};"
      >
        {page}
      </div>
    </div>
  {/each}
  <div class="flex gap-3 w-full justify-center pt-4">
    {#if revealCount > 1}
      <button
        transition:slide={{
          delay: 200,
          duration: 200,
          easing: cubicInOut,
          axis: "x",
        }}
        on:click={() => revealCount--}
        class="self-center rounded-full p-1 hover:opacity-80 min-w-0"
        style="border: 1px solid {color};"
      >
        <ArrowUp className="rotate-180" />
      </button>
    {/if}
    {#if revealCount < pages.length}
      <button
        transition:slide={{
          delay: 200,
          duration: 200,
          easing: cubicInOut,
          axis: "x",
        }}
        on:click={() => revealCount++}
        class="self-center rounded-full p-1 hover:opacity-80 min-w-0"
        style="border: 1px solid {color};"
      >
        <ArrowUp />
      </button>
    {/if}
  </div>
</div>
