<script lang="ts">
  import { onMount } from "svelte";

  export let text: string;
  export let speed: number = 100;
  export let delayIn: number = 0;

  let displayText = "";
  let index = 0;

  onMount(() => {
    let interval;

    setTimeout(() => {
      interval = setInterval(() => {
        if (index < text.length) {
          displayText += text[index];
          index++;
        } else {
          clearInterval(interval);
        }
      }, speed);
    }, delayIn);

    return () => clearInterval(interval);
  });
</script>

<div style="min-height: 1em;">{displayText}</div>
