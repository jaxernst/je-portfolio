<script lang="ts">
  import { width, height, renderable } from "./game.js";
  import Canvas from "./Canvas.svelte";
  import Background from "./Background.svelte";
  import DotGrid from "./DotGrid.svelte";
  import Character from "./MoveableCharacter.svelte";
  import FPS from "./FPS.svelte";
  import BoidSimulation from "./BoidSimulation.svelte";
  import { tweened } from "svelte/motion";
  import { cubicInOut, cubicOut, sineInOut } from "svelte/easing";
  import { fade, fly, scale, slide } from "svelte/transition";

  import { addBoids, boidSim, cursorPos } from "./boidSimControls.js";
  import {
    AtomBoid,
    BlueTab,
    Default,
    OrangeTab,
    YellowTab,
  } from "./lib/presetBoids.js";
  import { derived, get, writable } from "svelte/store";
  import { onDestroy, onMount } from "svelte";
  import PageReveal from "./PageReveal.svelte";
  import { numActiveBoids } from "./lib/boid-engine/main.js";
  import SlideDrawer from "./SlideDrawer.svelte";
  import CarouselTabs from "./CarouselTabs.svelte";
  import { randomizeBoidType } from "./lib/boid-engine/boid-creation";
  import ColorLink from "./ColorLink.svelte";
  import Github from "./lib/svelte-components/Github.svelte";
  import TwitterLogo from "./lib/svelte-components/TwitterLogo.svelte";
  import LinkedIn from "./lib/svelte-components/LinkedIn.svelte";
  import Warpcast from "./lib/svelte-components/Warpcast.svelte";
  import Email from "./lib/svelte-components/Email.svelte";

  let started = true;

  function spawnRandomBoid() {
    if (!$cursorPos) return;
    const randomBoidType = randomizeBoidType();
    $addBoids(randomBoidType, 1, $cursorPos);
  }

  function handleKeydown(event) {
    if (event.key === "Enter" && !started && startScreenActive) {
      started = true;
      startScreenActive = false;
    } else if (event.key === "s" || event.key === "S") {
      spawnRandomBoid();
    } else if (event.key === "c" || event.key === "C") {
      $boidSim.reset();
    }
  }

  let visible = false;

  // prettier-ignore
  const tabs = [
        { id: "intro", text: "䷉ Intro", boidType: Default },
        { id: "my-stuff", text: "䷑ My Stuff", boidType: BlueTab },
        { id: "puzzlebets", text: "⁒ Smart Contract PvP Betting", boidType: OrangeTab },
        { id: "editor", text: "⌥ Editor Theme", boidType: YellowTab },
        { id: "boids", text: "⌔ Boids (↓ those guys)", boidType: AtomBoid },
    ] as const;

  type Tab = (typeof tabs)[number];

  const tabIndex = writable<number>(1);
  const curTab = derived(tabIndex, (i) => tabs[i]);

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
    window.addEventListener("keydown", handleKeydown);
    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
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

    const centerScreenPos = {
      x: $width / 2,
      y: $height / 2,
    };

    $addBoids(boidType, 9, centerScreenPos);
  }

  let leftBarTextRevealCount = 1;

  function scaleImage(node) {
    let observer;

    function updateSize() {
      const parent = node.closest(".slide-drawer-content");
      if (parent) {
        const { width, height } = parent.getBoundingClientRect();
        node.style.width = `${width}px`;
        node.style.height = `${height * 0.8}px`;
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

  let startScreenActive = true;

  onMount(() => {
    window.addEventListener("keydown", handleKeydown);
    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  });

  function handleSpawn() {
    spawnRandomBoid();
  }

  function handleClear() {
    $boidSim.reset();
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
    <div class="shrink-0 flex flex-col w-full sm:w-[500px]">
      <!-- Page Header and Navigation -->
      <div class="px-5 pt-5">
        <div class="flex mb-2 justify-between items-center w-full">
          <div class=" text-xs flex items-center gap-2">
            {#if started}
              <div class="whitespace-nowrap" in:slide={{ axis: "x" }}>
                {$numActiveBoids} boids
              </div>
              |
            {/if}
            <div class="whitespace-nowrap">
              {$fps.toPrecision(3)} fps
            </div>
          </div>
        </div>

        {#if started}
          <div in:slide={{ easing: cubicInOut, duration: 250 }}>
            <!--Page Header-->
            <div
              class="p-4 bg-transparent border border-gray-400 rounded backdrop-blur-sm leading-none"
            >
              <div class="flex gap-2 items-end">
                <h1 class="text-[33px] md:text-[35px]">Jackson Ernst</h1>
                <h1 class="text-sm leading-relaxed font-medium">
                  ( jaxer.eth )
                </h1>
              </div>
              <div
                class="flex gap-2 font-light text-sm mt-0.5 text-neutral-300"
              >
                Full stack engineer building blockchain applications
              </div>
            </div>

            <!-- Tab Buttons -->
            <div class="mt-3">
              <CarouselTabs
                {tabs}
                activeIndex={tabIndex}
                onTabClick={handleSpawnButtonClick}
              />
            </div>
          </div>
        {/if}
      </div>

      <!-- Sidebar Tab Content -->
      {#if started}
        {#if $curTab.id === "intro"}
          <PageReveal
            pages={[
              "My name is Jackson. I'm a self-taught software developer.",
              "I'm a natural tinkerer, and I'm often drawn to new technologies/unexplored concepts. (Easily nerd-sniped)",
              "Originally an aerospace engineer, I developed a knack for creating and thinking about software systems. I now spend my time building full-stack web applications, with a strong focus around blockchain-supported tech stacks.",
              "I've worked professionally on flight control systems, automated trading systems, an early defi protocol, decentralized social platforms, onchain gaming, and LLM based chat apps.",
            ]}
            color={tabs[0].boidType.color}
            delayIn={500}
          />

          <!-- Puzzle Bets Page -->
        {:else if $curTab.id === "puzzlebets"}
          <PageReveal
            pages={[
              "Puzzle Bets, a casual PvP onchain betting game, is the result of a multi-year solo exploration into real-time consumer crypto.",
              "I started iterating on the early concepts before smart wallets or social sign-in embedded wallets even existed. This started as a an alarm clock game where puzzles were solved to wake up.",
              "After iterating on the concept and devleoping my go-to full-stack toolkit for onchain app development, I built a blockchain app simple enough for my mother to use.",
            ]}
            color={tabs[2].boidType.color}
            delayIn={500}
          />
        {:else if $curTab.id === "my-stuff"}
          <div class="flex justify-center items-center gap-5 p-4">
            <a
              href="https://github.com/jaxernst"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github />
            </a>
            <a
              href="https://x.com/yachtyyachty"
              target="_blank"
              rel="noopener noreferrer"
            >
              <TwitterLogo />
            </a>
            <a
              href="https://warpcast.com/jaxer.eth"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Warpcast />
            </a>
            <a
              href="https://www.linkedin.com/in/jackson-ernst-9ab68014a/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <LinkedIn />
            </a>
            <a href="mailto:jaxernst@gmail.com">
              <Email />
            </a>
          </div>

          <!---
          - Tech stack (tech I like)
          - Github, Farcaster, Twitter 
          -->
        {/if}
      {/if}
    </div>

    <!-- Slide drawer content -->
    <div
      class="w-full h-full lg:w-[700px] relative overflow-hidden px-10"
      style="pointer-events: none;"
    >
      {#if $tabIndex === 2}
        <SlideDrawer
          title="Puzzle Bets - Component Architecture"
          arrowColor={$curTab.boidType.color}
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
  {#if !started && startScreenActive}
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
          on:click={() => {
            started = true;
            startScreenActive = false;
          }}
          class="border backdrop-blur-sm font-bold rounded-lg hover:border-red hover:scale-110 hover:rotate-1 duration-150 transition-transform active:scale-100"
        >
          Enter
        </button>
      {/if}
    </div>
  {/if}

  {#if started}
    <div
      class="absolute top-2 right-2 p-2 rounded text-white text-[10px] flex gap-2"
    >
      <button
        on:click={handleSpawn}
        class="hidden sm:flex items-center gap-1 border border-white/20 px-2 py-1 rounded hover:bg-white/10 transition-colors"
      >
        <div class="font-medium">S</div>
        <span class=" font-extralight">Spawn</span>
      </button>
      <button
        on:click={handleClear}
        class="flex items-center gap-1 border border-white/20 px-2 py-1 rounded hover:bg-white/10 transition-colors"
      >
        <div class="font-medium sm:inline hidden">C</div>
        <span class="font-extralight">Clear</span>
      </button>
    </div>
  {/if}
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
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
