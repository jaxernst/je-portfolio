<script lang="ts">
  import { width, height, renderable } from "./game.js";
  import Canvas from "./Canvas.svelte";
  import Background from "./Background.svelte";
  import DotGrid from "./DotGrid.svelte";
  import Character from "./MoveableCharacter.svelte";
  import FPS from "./FPS.svelte";
  import BoidSimulation from "./BoidSimulation.svelte";
  import { tweened } from "svelte/motion";
  import {
    cubicIn,
    cubicInOut,
    cubicOut,
    sineIn,
    sineInOut,
  } from "svelte/easing";
  import { fade, fly, scale, slide } from "svelte/transition";

  import {
    addBoids,
    boidSim,
    currentBoidType,
    cursorPos,
  } from "./boidSimControls.js";
  import TwitterLogo from "./lib/svelte-components/TwitterLogo.svelte";
  import {
    AtomBoid,
    Default,
    Juggernauts,
    SpeedRacers,
  } from "./lib/presetBoids.js";
  import Github from "./lib/svelte-components/Github.svelte";
  import { writable } from "svelte/store";
  import { onDestroy, onMount } from "svelte";
  import PageReveal from "./PageReveal.svelte";

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

  function handleSpawnButtonClick(event, _tab: "me" | "projects" | "links") {
    $tab = _tab;

    const boidType =
      _tab === "me" ? Default : _tab === "projects" ? SpeedRacers : AtomBoid;

    const rect = event.target.getBoundingClientRect();
    const buttonScreenPos = {
      x: 13 + rect.left + rect.width / 2, // Center X of the button
      y: 22 + rect.top + rect.height / 2, // Center Y of the button
    };

    $addBoids(boidType, 15, buttonScreenPos);
  }

  let leftBarTextRevealCount = 1;
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

    <FPS onFrame={(_fps) => ($fps = _fps)} />
  </Canvas>

  <div class="overlay">
    <div class="flex flex-col gap-6 max-w-[400px]">
      <!-- Page Header and Navigation -->
      <div class="ml-5 pt-5 left">
        <div class="text-xs">{$fps.toPrecision(4)} fps</div>

        {#if started}
          <div in:slide={{ easing: cubicInOut, duration: 250 }}>
            <div
              class="p-3 bg-transparent border border-gray-400 rounded backdrop-blur-sm mt-3 leading-none"
            >
              <h1 class="text-[33px] md:text-[35px]">Jackson Ernst</h1>

              <div
                class="flex gap-2 font-extralight text-sm mt-2 text-neutral-300"
              >
                <div>Full Stack Engineer</div>
                <div class="text-gray-200">|</div>
                <div>Blockchain Application Developer</div>
              </div>
            </div>

            <div class="flex gap-1 mt-3">
              <button
                on:click={(e) => handleSpawnButtonClick(e, "me")}
                class={`${$tab === "me" ? "bg-red" : ""}  rounded-lg transition-colors duration-200 hover:bg-solid-red`}
                >Me</button
              >
              <button
                on:click={(e) => handleSpawnButtonClick(e, "projects")}
                class={`${$tab === "projects" ? "bg-yellow" : ""}  rounded-lg transition-colors duration-200 hover:bg-solid-yellow`}
                >Projects</button
              >
              <button
                on:click={(e) => handleSpawnButtonClick(e, "links")}
                class={`${$tab === "links" ? "bg-green" : ""} rounded-lg  transition-colors duration-200 hover:bg-solid-green`}
                >Links</button
              >
              <div class="grow flex justify-end">
                <button
                  class="text-xs italic rounded underline hover:shadow-md hover:scale-110 transition-transform duration-150"
                  on:click={() => $boidSim.reset()}
                >
                  Clear Boids
                </button>
              </div>
            </div>
          </div>
        {/if}
      </div>

      <!-- Sidebar Tab Content -->
      {#if started}
        {#if $tab === "me"}
          <PageReveal
            pages={[
              "My name is Jackson. I'm a self-taught software developer and I like building highly interactive blockchain applications",
              "I tinker a lot. I love exploring novel concepts and building them to life.",
              "Originally an aerospace engineer, I developed a passion creating and understanding software systems. I was particularly fascinated in smart contract applications and the properties of blockchain networks.",
              "After getting the opportunity to work with a founding team prototyping a novel MEV capture protocol, I never looked back.",
              "I got an opportunity to work with a founding team prototyping a novel MEV capture protocol, and from there I never looked back.",
            ]}
          />
        {/if}
      {/if}
    </div>
  </div>

  {#if !started}
    <div
      out:slide={{ easing: cubicInOut, duration: 250 }}
      class="centered-button flex flex-col gap-12 items-center pb-[180px]"
    >
      {#if visible}
        <div>
          <div
            class="text-3xl font-extralight"
            in:fade={{ duration: 1200, delay: 100, easing: cubicOut }}
          >
            Hello 👋, welcome to my website.
          </div>
          <div
            class="warning-container"
            in:slide={{ duration: 800, delay: 1400, easing: cubicOut }}
          >
            <i class="text-gray-200 text-sm font-thin">
              {#each waveLetters as { char, y }, i (i)}
                <span
                  class={i < 8 ? "text-neutral-400 font-semibold" : ""}
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
          on:click={() => (started = true)}
          class="border rounded-lg hover:border-solid-red hover:scale-110 hover:rotate-1 duration-150 transition-transform active:scale-100"
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
    height: 100%;
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
