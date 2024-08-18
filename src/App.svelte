<script lang="ts">
  import { width, height, renderable } from "./game.js";
  import Canvas from "./Canvas.svelte";
  import Background from "./Background.svelte";
  import DotGrid from "./DotGrid.svelte";
  import Character from "./MoveableCharacter.svelte";
  import Text from "./Text.svelte";
  import FPS from "./FPS.svelte";
  import BoidSimulation from "./BoidSimulation.svelte";
  import { tweened } from "svelte/motion";
  import { cubicInOut, cubicOut, sineIn, sineInOut } from "svelte/easing";
  import { fade, fly, scale, slide } from "svelte/transition";

  import {
    addBoids,
    boidSim,
    currentBoidType,
    cursorPos,
  } from "./boidSimControls.js";
  import TwitterLogo from "./lib/svelte-components/TwitterLogo.svelte";
  import Detractors from "./Detractors.svelte";
  import { randomizeBoidType } from "./lib/boid-engine/boid-creation.js";
  import {
    BlueAngels,
    BoidSpecies,
    GrouperSpecies1,
    LilBuggers,
    SlowArrows,
  } from "./lib/presetBoids.js";
  import Github from "./lib/svelte-components/Github.svelte";
  import { writable } from "svelte/store";
  import { onDestroy, onMount } from "svelte";

  let started = false;
  let visible = false;

  $: command = $width > 700 ? "click" : "tap";

  let addingDetractor = false;
  let waitingForClick = false;
  function maybeAddDetractor(event) {
    if (!addingDetractor) return;
    if (!waitingForClick) {
      waitingForClick = true;
      return;
    }
    const { clientX, clientY } = event;
    $boidSim.addDetractor({ x: clientX, y: clientY });
  }

  let characterPaused = false;
  function characterPause(node) {
    const onPress = () => (characterPaused = true);
    const onRelease = () => (characterPaused = false);
    node.addEventListener("mousedown", onPress);
    node.addEventListener("mouseup", onRelease);
    node.addEventListener("touchstart", onPress);
    node.addEventListener("touchend", onRelease);
    return {
      destroy() {
        node.removeEventListener("mousedown", onPress);
        node.removeEventListener("mouseup", onRelease);
        node.removeEventListener("touchstart", onPress);
        node.removeEventListener("touchend", onRelease);
      },
    };
  }

  function toggleDetractorPen() {
    addingDetractor = !addingDetractor;
    waitingForClick = false;
  }

  onMount(() => {
    visible = true;
  });

  let fps = writable(60);
  let tab = writable<"me" | "projects" | "links">("me");

  const warningText = "Warning: Contains interactive motion";

  function waveIndexValue(i, length, t) {
    const frac = (0.08 * (i * Math.PI)) / length;
    return 0.07 * Math.sin((frac * 180) / Math.PI + t);
  }

  const time = tweened(0, {
    duration: 2000,
    easing: cubicInOut,
  });

  $: waveLetters = warningText.split("").map((char, i) => ({
    char,
    y: waveIndexValue(i, warningText.length, $time * Math.PI * 2),
  }));

  function animateWave() {
    time.set($time + 1);
  }

  $: if (visible) {
    animateWave();
    const interval = setInterval(animateWave, 2000);
  }
</script>

<svelte:window on:click={maybeAddDetractor} />

<div class="main">
  <Canvas>
    <Background color="hsl(0, 0%, 10%)">
      <DotGrid divisions={40} color="hsla(0, 0%, 100%, 0.5)" pointSize={0.8} />
    </Background>

    <BoidSimulation {started} initNumBoids={25} />
    <Character
      storeToUpdate={cursorPos}
      size={$width > 700 ? 10 : 7}
      startX={$width / 2}
      startY={$height / 1.1}
      {characterPaused}
    />

    <Detractors />

    <FPS onFrame={(_fps) => ($fps = _fps)} />
  </Canvas>

  <div class="overlay">
    <div class="flex justify-between">
      <div class="ml-5 pt-5 left">
        <div class="text-xs">{$fps.toPrecision(4)} fps</div>

        {#if started}
          <div
            class="p-3 bg-transparent border border-gray-400 rounded backdrop-blur-sm mt-3 leading-none"
          >
            <h1 class="text-[33px] md:text-[35px]">Jackson Ernst</h1>

            <div class="flex gap-2 font-medium text-sm mt-2 e">
              <div>Full Stack Engineer</div>
              <div class="text-gray-200">|</div>
              <div>Blockchain Application Developer</div>
            </div>
          </div>

          <div class="flex gap-1 mt-3 font-bold">
            <button
              on:click={() => ($tab = "me")}
              class={`${$tab === "me" ? "bg-red" : ""}  rounded-lg transition-colors duration-200 hover:bg-solid-red`}
              >Me</button
            >
            <button
              on:click={() => ($tab = "projects")}
              class={`${$tab === "projects" ? "bg-yellow" : ""}  rounded-lg transition-colors duration-200 hover:bg-solid-yellow`}
              >Projects</button
            >
            <button
              on:click={() => ($tab = "links")}
              class={`${$tab === "links" ? "bg-green" : ""} rounded-lg  transition-colors duration-200 hover:bg-solid-green`}
              >Links</button
            >
            <div class="grow flex justify-end">
              <button class="text-xs italic rounded underline">Clear</button>
            </div>
          </div>
        {/if}
      </div>

      <!-- Sidebar -->
      <!-- <div class="flex flex-col m-5 gap-2 items-end text-xs md:text-base">
        {#if started}
          <button use:characterPause on:click={() => $boidSim.reset()}>
            Reset
          </button>
          {#if $width > 700}
            <button
              use:characterPause
              on:click={toggleDetractorPen}
              class:purple-bg={addingDetractor}
              >{addingDetractor
                ? "Adding Detractors"
                : "Add Detractors"}</button
            >
          {/if}
          <button
            class="flex gap-2 items-center"
            use:characterPause
            on:click={() => ($currentBoidType = randomizeBoidType())}
            >Randomize Species {" "}
            <div
              style={`background-color: ${$currentBoidType.color}; height:15px; width:15px; border-radius:100%; display:inline-block;`}
            /></button
          >

          {#if true}
            <div class="p-2 border border-[#b12727c9] rounded-lg">
              <div class="pb-2 text-gray-300 font-semibold">
                Featured Species
              </div>
              <div>
                <select
                  class="bg-transparent"
                  on:change={(e) => {
                    const choice = BoidSpecies.find((s) => {
                      return s.name === e.target.value;
                    });

                    if (choice) {
                      $currentBoidType = choice;
                    }
                  }}
                >
                  <option value={"default"}>Default</option>
                  {#each BoidSpecies as species}
                    <option value={species.name}>{species.name}</option>
                  {/each}
                </select>
              </div>
            </div>
          {/if}

          <div class="spacer h-2" />
          <button
            style="padding: 12px; background-color: green"
            use:characterPause
            on:click={() => $addBoids && $addBoids($currentBoidType, 10)}
            >Spawn</button
          >
        {/if}
      </div> -->
    </div>
  </div>

  {#if !started}
    <div class="centered-button flex flex-col gap-12 items-center pb-[180px]">
      {#if visible}
        <div>
          <div
            class="text-3xl font-extralight"
            in:fade={{ duration: 1200, delay: 100, easing: cubicOut }}
          >
            Hi, welcome to my website
          </div>
          <div
            class="warning-container"
            in:slide={{ duration: 800, delay: 1400, easing: cubicOut }}
          >
            <i class="text-gray-200 text-sm font-thin">
              {#each waveLetters as { char, y }, i (i)}
                <span
                  class={i < 8 ? "text-gray-400 font-semibold" : ""}
                  style="display: inline-block; transform: translateY({y *
                    10}px);"
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              {/each}
            </i>
          </div>
        </div>
        <button
          in:fade={{ duration: 500, delay: 2400 }}
          out:scale
          on:click={() => (started = true)}
          class="border rounded-lg"
        >
          Enter
        </button>
      {/if}
    </div>
  {/if}
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
  }

  .twitter-link {
    position: absolute;
    bottom: 19px;
    left: 1em;
  }

  .centered-button {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .main {
    position: fixed;
    top: 0%;
    left: 0%;
  }

  .overlay {
    position: absolute;
    top: 0%;
    left: 0%;
    width: 100%;
  }

  .content-container {
    display: flex;
    justify-content: space-between;
  }

  .right-bar {
    grid-column: 2;
    grid-row: 1/-1;
  }

  @media (max-width: 700px) {
    .right-bar {
      font-size: 0.65em;
      gap: 0.5em;
    }
  }

  .purple-bg {
    background-color: #a55bd7;
  }

  @keyframes wave {
    0% {
      transform: translateY(10);
    }
    100% {
      transform: translateY(-10);
    }
  }

  .wave-letter {
    display: inline-block;
    animation: wave 2s linear infinite;
  }
</style>
