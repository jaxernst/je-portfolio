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
    SlowArrows,
    YellowTab,
  } from "./lib/presetBoids.js";
  import { derived, get, writable } from "svelte/store";
  import { onDestroy, onMount } from "svelte";
  import PageReveal from "./PageReveal.svelte";
  import { numActiveBoids } from "./lib/boid-engine/main.js";
  import SlideDrawer from "./SlideDrawer.svelte";
  import CarouselTabs from "./CarouselTabs.svelte";

  let started = false;
  let visible = false;

  // prettier-ignore
  const tabs = [
        { id: "intro", text: "䷉ Intro", boidType: Default },
        { id: "what-i-do", text: "䷑ What I do", boidType: BlueTab },
        { id: "puzzlebets", text: "⁒ Smart Contract PvP Betting", boidType: YellowTab },
        { id: "editor", text: "⌥ Editor Theme", boidType: SlowArrows },
        { id: "boids", text: "⌔ Boids (↓ those guys)", boidType: AtomBoid },
    ] as const;

  type Tab = (typeof tabs)[number];

  const tabIndex = writable<number>(0);
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

    $addBoids(boidType, 11, centerScreenPos);
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
              class="p-4 bg-transparent border border-gray-400 rounded backdrop-blur-sm leading-none"
            >
              <div class="flex gap-2 items-end">
                <h1 class="text-[33px] md:text-[35px]">Jackson Ernst</h1>
                <h1 class="text-sm leading-relaxed font-medium">
                  ( jaxer.eth )
                </h1>
              </div>
              <div class="flex gap-2 font-light text-sm mt-0 text-neutral-300">
                Full stack software engineer working on blockchain tech
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
              "I like tinkering with novel and unexplored concepts. Ocassionality I'll take these explorations into full fledged applications.",
              "Originally an aerospace engineer, I developed a knack for creating and thinking about software systems. I was particularly fascinated by blockchain networks, smart contract protocols, and game theory.",
              "After studying and applying myself to the defi trade, I got an opportunity to work with a founding defi team prototyping a novel MEV capture protocol.",
              "From there I never looked back...",
            ]}
            color={tabs[0].boidType.color}
            delayIn={500}
          />

          <!-- Puzzle Bets Page -->
        {:else if $curTab.id === "puzzlebets"}
          <PageReveal
            pages={[
              "Puzzle Bets, a casual PvP onchain betting game, is the result of a multi-year solo exploration into real-time consumer crypto.",
              "The right tool for this turned out to be Mud, a smart contract storage + indexing protocol + framework for developing highly interactive onchain apps.",
              "Mud combined with modern full stack development tools such as SvelteKit and Supabase are helping to realize this long-term vision.",
            ]}
            color={tabs[2].boidType.color}
            delayIn={500}
          />
        {:else if $curTab.id === "what-i-do"}
          <PageReveal
            pages={[
              "In short, I build full stack onchain applications. I write smart contracts, I build frontends, and I build backends to serve and support these applications.",
              "My first dose of professional experience in this space was a dive straight into the deep end as I worked alongside a brilliant engineer co-developing a novel MEV capture protocol.",
              "In doing so, I got to write core protocol code in solidity, prototype off-chain meta-transaction execution infrastructure, and even integrate our protocol into a fully functional Uniswap fork.",
              "Today I'm still building in the blockchain rabbit hole, working on an oncahin profile/media discovery tool (eth.co), and also experimenting my own onchain PvP betting platform.",
            ]}
            color={tabs[1].boidType.color}
            delayIn={500}
          />
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
