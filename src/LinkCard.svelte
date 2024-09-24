<script lang="ts">
  export let label;
  export let img = null;
  export let description;
  export let link;
  export let color = "hsl(0, 0%, 90%)";
  export let imgSize = "w-6 h-6";
</script>

<a
  href={link}
  target="_blank"
  class="border-l-2 pl-2 hover:bg-gray-600/20 hover:backdrop-blur hover:rounded transition-all duration-150 ease-in-out"
  style="border-color: {color};"
>
  <div class="overflow-hidden rounded-md flex items-center gap-2">
    {#if img}
      <img src={img} class={imgSize} />
    {/if}

    <div class="p-1">
      <h3 class="text-base font-semibold leading-tight">{label}</h3>
      <p class="text-sm text-gray-400 leading-tight">{description}</p>
    </div>
  </div>
</a>
