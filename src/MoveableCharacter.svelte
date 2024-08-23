<script lang="ts">
  import { renderable, width, height } from "./game.js";
  import type { Writable } from "svelte/store";
  import Text from "./Text.svelte";
  import { spring } from "svelte/motion";
  export let storeToUpdate: null | Writable<{ x: number; y: number }> = null;
  export let showPos = false;
  export let color = "#ffe554";
  export let size = 10;
  export let thickness = 3;
  export let startX = $width / 2;
  export let startY = $height / 2;
  export let characterPaused: boolean = false;
  export let stiffness = 0.15;
  export let damping = 0.65;

  let text;

  const position = spring(
    { x: startX, y: startY },
    {
      stiffness,
      damping,
    }
  );

  let touch = { x: startX, y: startY };

  renderable((props, dt) => {
    const { context, width, height } = props;

    if (!characterPaused) {
      position.set(touch);
    }

    const { x, y } = $position;

    if (storeToUpdate) {
      storeToUpdate.set({ x, y });
    }

    context.lineCap = "round";
    context.beginPath();
    context.fillStyle = color;
    context.strokeStyle = color;
    context.lineWidth = thickness;
    context.arc(x, y, size, 0, Math.PI * 2);
    context.stroke();

    if (showPos) {
      text.$set({
        text: `(${Math.round(x)}, ${Math.round(y)})`,
        x,
        y: y + size + 10,
      });
    }
  });

  function handleMouseMove({ clientX, clientY }) {
    if (!clientX || !clientY || characterPaused) return;
    touch = { x: clientX, y: clientY };
  }
</script>

<svelte:window
  on:mousemove={handleMouseMove}
  on:selectstart={(e) => e.preventDefault()}
  on:contextmenu={(e) => e.preventDefault()}
/>
<Text fontSize={8} baseline="top" bind:this={text} />
<slot />
