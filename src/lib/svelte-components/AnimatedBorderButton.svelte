<script lang="ts">
  export let onClick: () => void;
</script>

<button
  on:click={onClick}
  class="flex items-center gap-1 sm:px-2 px-1 sm:py-1 hover:bg-white/10 active:bg-white/20 transition-colors"
>
  <div class="relative z-10">
    <div class="font-medium sm:inline hidden pointer-events-none">T</div>
    <span class="font-extralight pointer-events-none">Toggle UI</span>
  </div>
</button>

<style>
  /**
 * `@property` is required for the animation to work.
 * Without it, the angle values won’t interpolate properly.
 *
 * @see https://dev.to/afif/we-can-finally-animate-css-gradient-kdk
 */
  @property --bg-angle {
    inherits: false;
    initial-value: 0deg;
    syntax: "<angle>";
  }

  /**
 * To animate the gradient, we set the custom property to 1 full
 * rotation. The animation starts at the default value of `0deg`.
 */
  @keyframes spin {
    to {
      --bg-angle: 360deg;
    }
  }

  button {
    animation: spin 3s infinite linear;
    position: relative;
    isolation: isolate;

    background:
      linear-gradient(to bottom, hsl(0, 0%, 10%), hsl(0, 0%, 10%)) padding-box,
      conic-gradient(
          from var(--bg-angle) in oklch longer hue,
          oklch(1 0 0 / 0.2) 0%,
          oklch(1 0 0 / 0.2) 40%,
          oklch(0.8 0.1 25 / 0.45) 65%,
          oklch(1 0 0 / 0.2) 90%,
          oklch(1 0 0 / 0.2) 100%
        )
        border-box;
    border: 1px solid transparent;
    border-radius: 4px;

    &:hover {
      animation-play-state: paused;
      background: rgb(255 255 255 / 0.1);
      border: 1px solid rgb(255 255 255 / 0.2);
    }
  }
</style>
