<script lang="ts">
  import { flip } from "svelte/animate";
  import { cubicInOut } from "svelte/easing";
  import { writable } from "svelte/store";

  export let tabs;
  export let activeIndex;
  export let onTabClick;

  let containerWidth;
  let tabsRef;
  let offset = 0;

  $: visibleTabs = getVisibleTabs($activeIndex, tabs);

  function getVisibleTabs(activeIndex, allTabs) {
    const rotatedTabs = [
      ...allTabs.slice(activeIndex),
      ...allTabs.slice(0, activeIndex),
    ];
    return rotatedTabs.slice(0, 5);
  }

  function handleTabClick(e, clickedIndex) {
    const newIndex = (clickedIndex + $activeIndex) % tabs.length;
    onTabClick(e, newIndex);
  }
</script>

<div
  class="tabs-container"
  bind:clientWidth={containerWidth}
  bind:this={tabsRef}
>
  <div class="tabs-wrapper" style="transform: translateX({-1 * offset}px)">
    {#each visibleTabs as tab, index (tab.id)}
      <button
        animate:flip={{ duration: 320, easing: cubicInOut }}
        on:click={(e) => handleTabClick(e, index)}
        class="tab-button basis-2 sm:w-auto py-1 px-2 rounded-lg transition-all tracking-tight duration-200 {index ===
        0
          ? 'selected'
          : ''}"
        style="--boid-color: {tab.boidType.color}"
      >
        {tab.text}
      </button>
    {/each}
  </div>
</div>

<style>
  .tabs-container {
    overflow-x: hidden;
    width: 100%;
  }

  .tabs-wrapper {
    display: flex;
    gap: 10px;
    transition: transform 0.3s ease;
  }

  .tab-button {
    flex-shrink: 0;
    background-color: transparent;
    border: 1px solid transparent;
    font-weight: 400;
    opacity: 0.7;
    transition: all 0.2s ease;
    backdrop-filter: blur(0);
  }

  .tab-button.selected {
    border-color: var(--boid-color);
    font-weight: 700;
    opacity: 1;
    backdrop-filter: blur(5px);
  }

  .tab-button:hover {
    backdrop-filter: blur(5px);
    border-color: var(--boid-color);
  }
</style>
