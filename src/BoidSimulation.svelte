<script lang="ts">
  import { height, renderable, width } from "./game";
  import { createBoidSimulation } from "./lib/boid-engine/main";
  import { boidSim, cursorPos } from "./boidSimControls";
  import { MakeBoidDrawer } from "./lib/boid-engine/canvas-drawers";
  import { getRand } from "./lib/util";

  export let started = false;
  export let initNumBoids = 0;

  const sim = createBoidSimulation({
    numBoids: initNumBoids,
    startPos: [() => $width / 2 + getRand(50), () => $height / 2 + getRand(50)],
    startVel: [() => getRand(5), () => getRand(50)],
    boardSize: { w: $width, h: $height },
  });

  boidSim.set(sim);

  $: drawBoid = MakeBoidDrawer($width > 700 ? 3.5 : 3, 0.6);

  renderable((props, dt) => {
    if (!started) return;
    const { context: ctx, width, height } = props;

    const boids = $boidSim.update(
      dt,
      {
        htmlContext: ctx,
        visibleBoard: {
          h: height,
          w: width,
        },
      },
      [{ ...$cursorPos, strength: 1000000, distance: 50 }]
    );

    for (const boid of boids) {
      drawBoid(boid.vec.pos, boid.vec.vel, ctx, boid.color);
    }
  });
</script>
