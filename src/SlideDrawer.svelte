<script>
  import { spring, tweened } from "svelte/motion";
  import { onMount } from "svelte";
  import { cubicInOut } from "svelte/easing";

  export let title = "";
  export let closedHeight = "200px";
  export let arrowColor = null;

  let isOpen = false;
  let containerHeight;

  const height = tweened(0, { duration: 350, easing: cubicInOut });

  $: openHeight = containerHeight ? `${containerHeight * 0.85}px` : "280px";

  $: {
    height.set(isOpen ? parseFloat(openHeight) : parseFloat(closedHeight));
  }

  function toggleDrawer() {
    isOpen = !isOpen;
  }

  function handleResize(node) {
    function updateHeight() {
      if (node && node.parentElement) {
        containerHeight = node.parentElement.clientHeight;
      }
    }

    updateHeight();
    window.addEventListener("resize", updateHeight);

    return {
      destroy() {
        window.removeEventListener("resize", updateHeight);
      },
    };
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  use:handleResize
  class="absolute bottom-0 left-0 right-0 rounded-t-lg bg-gray-600/10"
  style="height: {$height}px;"
>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div
    class="group p-3 pb-1 pt-3 h-8 cursor-pointer flex justify-between items-center rounded-tl-lg gap-3 backdrop-blur-sm"
    on:click={toggleDrawer}
  >
    <div class="font-semibold">{title}</div>
    <div
      class={`${isOpen ? "rotate-180" : ""} ${arrowColor ? arrowColor : ""} transition-transform duration-300`}
      style={`${arrowColor ? `color: ${arrowColor};` : ""}`}
    >
      <div class="group-hover:hidden block">△</div>
      <div class="hidden group-hover:block">▲</div>
    </div>
  </div>
  <div
    class={`p-4 overflow-y-auto h-[calc(100%-2rem)] ${isOpen ? "" : "blur-sm"}`}
  >
    <slot></slot>
  </div>
</div>
