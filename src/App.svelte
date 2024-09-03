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

  import { addBoids, boidSim, cursorPos } from "./boidSimControls.js";
  import TwitterLogo from "./lib/svelte-components/TwitterLogo.svelte";
  import {
    AtomBoid,
    BlueAngels,
    Default,
    ElegantFlocks,
    Juggernauts,
    SlowArrows,
    SpeedRacers,
  } from "./lib/presetBoids.js";
  import Github from "./lib/svelte-components/Github.svelte";
  import { derived, get, writable } from "svelte/store";
  import { onDestroy, onMount } from "svelte";
  import PageReveal from "./PageReveal.svelte";
  import { numActiveBoids } from "./lib/boid-engine/main.js";
  import SlideDrawer from "./SlideDrawer.svelte";

  let started = true;
  let visible = false;

  // prettier-ignore
  const tabs = [
        { text: "䷉ Intro", boidType: Default },
        { text: "䷑ What I do", boidType: SpeedRacers },
        { text: "⁒ Smart Contract PvP Betting", boidType: ElegantFlocks },
        { text: "⌥ Editor Theme", boidType: SlowArrows },
        { text: "⌔ Boids (↓ those guys)", boidType: AtomBoid },
    ] as const;

  type Tab = (typeof tabs)[number];

  const tabIndex = writable<number>(0);
  const curBoid = derived(tabIndex, (i) => tabs[i]);

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

  function handleSpawnButtonClick(event, clickTabIdx: number) {
    $tabIndex = clickTabIdx;
    const clickTab = tabs[clickTabIdx];
    const boidType = clickTab.boidType;
    const rect = event.target.getBoundingClientRect();
    const buttonScreenPos = {
      x: 13 + rect.left + rect.width / 2, // Center X of the button
      y: 22 + rect.top + rect.height / 2, // Center Y of the button
    };

    $addBoids(boidType, 11, buttonScreenPos);
  }

  let leftBarTextRevealCount = 1;

  function scaleImage(node) {
    let observer;

    function updateSize() {
      const parent = node.closest(".slide-drawer-content");
      if (parent) {
        const { width, height } = parent.getBoundingClientRect();
        node.style.width = `${width}px`;
        node.style.height = `${height * 0.8}px`; // Ensure image height matches drawer height
      }
    }

    onMount(() => {
      observer = new ResizeObserver(updateSize);
      observer.observe(node.parentElement);
      updateSize();
    });

    return {
      destroy() {
        if (observer) {
          observer.disconnect();
        }
      },
    };
  }
</script>

<svelte:window on:click={maybeAddDetractor} />

<div class="main cursor-none hover:cursor-none">
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

  <div class="overlay flex flex-col lg:flex-row justify-between gap-14">
    <div class="shrink-0 flex flex-col gap-10 w-full sm:w-[500px]">
      <!-- Page Header and Navigation -->
      <div class="px-5 pt-5">
        <div class="flex mb-2 justify-between items-center w-full">
          <div class=" text-xs flex items-center gap-2">
            {#if started}
              <div in:slide={{ axis: "x" }}>{$numActiveBoids} boids</div>
              |
            {/if}
            <div class="whitespace-nowrap">
              {$fps.toPrecision(4)} fps
            </div>
          </div>

          {#if started}
            <button on:click={$boidSim.reset} class="text-xs underline"
              >Clear Boids</button
            >
          {/if}
        </div>

        {#if started}
          <div in:slide={{ easing: cubicInOut, duration: 250 }}>
            <!--Page Header-->
            <div
              class="p-3 bg-transparent border border-gray-400 rounded backdrop-blur-sm leading-none"
            >
              <div class="flex gap-3 items-end">
                <h1 class="text-[33px] md:text-[35px]">Jackson Ernst</h1>
                <h1 class="text-sm leading-relaxed font-medium">
                  ( jaxer.eth )
                </h1>
              </div>
              <div class="flex gap-2 font-light text-sm mt-1 text-neutral-300">
                Full stack software engineer working on blockchain tech
              </div>
            </div>

            <!-- Tab Buttons -->
            <div class="flex flex-wrap gap-2 mt-3">
              {#each tabs as tab, tabIdx}
                {@const selected = tabIdx === $tabIndex}
                <button
                  on:click={(e) => handleSpawnButtonClick(e, tabIdx)}
                  class="tab-button basis-2 sm:w-auto py-1 px-2 rounded-lg transition-all tracking-tight duration-200 {selected
                    ? 'selected'
                    : ''}"
                  style={`--boid-color: ${tab.boidType.color}`}
                >
                  {tab.text}
                </button>
              {/each}
            </div>
          </div>
        {/if}
      </div>

      <!-- Sidebar Tab Content -->
      <div class="overflow-y-auto">
        {#if started}
          {#if $tabIndex === 0}
            <PageReveal
              pages={[
                "My name is Jackson. I'm a self-taught software developer.",
                "I like tinkering with novel and unexplored concepts. Ocassionality I'll take these explorations into full fledged applications.",
                "Originally an aerospace engineer, I developed a knack for creating and thinking about software systems. I was particularly fascinated by smart contracts and blockchain networks; Money Lego programs that are universally accessible with guarenteed availability? I was convinced.",
                "After studying and applying myself to the defi trade, I got an opportunity to work with a founding defi team prototyping a novel MEV capture protocol.",
                "From there I never looked back...",
              ]}
              color={tabs[0].boidType.color}
            />

            <!-- Puzzle Bets Page -->
          {:else if $tabIndex === 2}
            <PageReveal
              pages={[
                "Two years ago I asked myself: how hard could it be to build and launch a nice-to-use onchain pvp betting game?",
                "Puzzle Bets, an onchain puzzle competition game, is the result of some deep experimentation, iterating, and learning on top of the EVM (Ethereum Virtual Maching). This use case demands reliability and near-realtime state syncing, which proved to a development rollarcoster",
                "The right tool for this turned out to be Mud, a smart contract storage + indexing protocol + framework for developing highly interactive onchain apps.",
                "Mud combined with modern full stack development tools such as SvelteKit and Supabase are helping to realize this long-term vision.",
              ]}
              color={tabs[2].boidType.color}
            />
          {/if}
        {/if}
      </div>
    </div>

    <!-- Slide drawer content -->
    <div
      class="w-full h-full lg:w-[700px] relative overflow-hidden px-10"
      style="pointer-events: none;"
    >
      {#if $tabIndex === 2}
        <SlideDrawer
          title="Puzzle Bets - Component Architecture"
          arrowColor={$curBoid.boidType.color}
        >
          <div class="w-full h-full">
            <img
              use:scaleImage
              src="img/PuzzleBetsArch.drawio.png"
              class="mx-auto rounded-lg opacity-75 object-contain"
              alt="Puzzle Bets Architecture"
            />
          </div>
        </SlideDrawer>
      {/if}
    </div>

    {#if started && false}
      <div class="absolute top-5 right-5">
        <button
          class="border border-purple-600/80 py-2 rounded font-extrabold text-[10px]"
          >Mint a Boid</button
        >
      </div>
    {/if}
  </div>

  <!--Landing Page-->
  {#if !started}
    <div
      out:slide={{ easing: cubicInOut, duration: 250 }}
      class="centered-button flex flex-col gap-20 items-center pb-[180px]"
    >
      {#if visible}
        <div>
          <div
            class="sm:text-3xl text-xl font-extralight min-w-fit whitespace-nowrap"
            in:fade={{
              duration: 1200,
              delay: 100,
              easing: cubicOut,
            }}
          >
            Hello 👋, welcome to my website.
          </div>

          <div
            class="warning-container"
            in:slide={{
              duration: 800,
              delay: 1400,
              easing: cubicOut,
            }}
          >
            <i class="text-gray-200 text-xs sm:text-sm font-thin">
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
          class="border backdrop-blur-sm font-bold rounded-lg hover:border-red hover:scale-110 hover:rotate-1 duration-150 transition-transform active:scale-100"
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

  .tab-button {
    background-color: transparent;
    border: 1px solid transparent;
    font-weight: 400;
    opacity: 0.7;
    transition: all 0.2s ease;
    backdrop-filter: blur(0);
  }

  .tab-button.selected {
    border-color: var(--boid-color);
    font-weight: 700;
    opacity: 1;
    backdrop-filter: blur(5px);
  }

  .tab-button:hover {
    backdrop-filter: blur(5px);
    border-color: var(--boid-color);
  }
</style>
