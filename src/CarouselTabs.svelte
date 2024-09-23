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
  let firstButtonWidth = 0;

  $: visibleTabs = getVisibleTabs($activeIndex, tabs);

  let clickedIndex = -1;

  function getVisibleTabs(activeIndex, allTabs) {
    const rotatedTabs = [
      ...allTabs.slice(activeIndex),
      ...allTabs.slice(0, activeIndex),
    ];

    return [rotatedTabs[rotatedTabs.length - 1], ...rotatedTabs.slice(0, -1)];
  }

  async function handleTabClick(e, index) {
    clickedIndex = index;
    const newIndex = (index + $activeIndex) % tabs.length;
    onTabClick(e, newIndex);
    clickedIndex = -1;
  }
</script>

<div
  class="tabs-container"
  bind:clientWidth={containerWidth}
  bind:this={tabsRef}
>
  <div class="tabs-wrapper">
    {#each visibleTabs as tab, index (tab.id)}
      <button
        class="p-0 relative min-w-0 flex-shrink-0 {index === 0
          ? 'w-10 max-w-10'
          : ''}"
        animate:flip={{ duration: 120, easing: cubicInOut }}
        on:click={(e) =>
          handleTabClick(e, (index - 1 + tabs.length) % tabs.length)}
      >
        <div
          class="whitespace-nowrap float-right tab-button py-1 px-2 rounded-lg tracking-tight
          {index === 1 ? 'selected' : ''}
          {clickedIndex === (index - 1 + tabs.length) % tabs.length
            ? 'clicked'
            : ''}"
          style="--boid-color: {tab.boidType.color};"
        >
          {tab.text}
        </div>
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
  }

  .tab-button {
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

  .tab-button.clicked {
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
