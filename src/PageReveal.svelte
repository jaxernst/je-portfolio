<script lang="ts">
  import { slide } from "svelte/transition";
  import ArrowUp from "./lib/components/ArrowUp.svelte";
  import Typewriter from "./Typewriter.svelte";

  export let pages: string[];
  export let color: string = "";
  export let delayIn: number = 0;
  export let padding: string = "pt-10 pr-2";
  export let onPageUpdate: (curPage: number) => void = () => {};

  let revealCount = 1;
  let typingSpeed = 10;

  function autoScroll(node: HTMLElement, _: number) {
    const scroll = () => {
      node.scroll({
        top: node.scrollHeight,
        behavior: "smooth",
      });
    };

    scroll();
    return { update: scroll };
  }
</script>

<div
  out:slide
  in:slide={{ delay: delayIn }}
  use:autoScroll={revealCount}
  class="{padding} overflow-y-auto min-h-0"
>
  <div class="flex flex-col">
    {#each pages.slice(0, revealCount) as page, i}
      <div transition:slide>
        <div
          class={`
             bg-gray-600/20 rounded-sm ml-5 px-4 py-2 backdrop-blur-sm text-sm transition-all duration-300
            ${i === 0 ? "mt-0" : "mt-3"}
            ${i === revealCount - 1 ? " bg-gray-600/20 font-semibold" : "bg-gray-600/10 font-light"}
          `}
          style="border-left: 2.5px solid {color};"
        >
          <Typewriter delayIn={220} text={page} speed={typingSpeed} />
        </div>
      </div>
    {/each}
    <div class="flex gap-3 w-full justify-center pt-4 pb-4">
      {#if revealCount > 1}
        <button
          in:slide={{
            delay: 200,
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
          in:slide={{
            delay: 200,
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

    <div class="h-2" />
  </div>
</div>
