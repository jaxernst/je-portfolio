<script lang="ts">
  import { fade, scale, slide } from "svelte/transition";
  import ArrowUp from "./lib/components/ArrowUp.svelte";
  import { cubicInOut } from "svelte/easing";

  export let label: string;
  export let href: string;

  export let color: string = "";
  export let delayIn: number = 0;
</script>

<div
  out:slide
  in:slide={{ delay: delayIn }}
  class="overflow-y-auto rounded"
  style="border: 1px solid {color}; color: {color};"
>
  {label}
</div>
