<script lang="ts">
  import Text from "./Text.svelte";
  import { time, renderable } from "./game.js";

  export let onFrame: (fps: number) => void;

  let text = "";

  let elapsed = 0;
  let frames = 0;
  let prevTime = performance.now();
  renderable((state, dt) => {
    let time = performance.now();
    frames++;
    if (time >= prevTime + 100) {
      const fps = (frames * 1000) / (time - prevTime);
      text = `${fps.toFixed(1)} FPS`;
      prevTime = time;
      frames = 0;

      onFrame(fps);
    }
  });
</script>

<!-- The following allows this component to nest children -->
<slot />
