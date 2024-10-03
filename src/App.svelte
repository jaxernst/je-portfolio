<script lang="ts">
  import { width, height, renderable } from "./game.js";
  import Canvas from "./Canvas.svelte";
  import Background from "./Background.svelte";
  import DotGrid from "./DotGrid.svelte";
  import Character from "./MoveableCharacter.svelte";
  import FPS from "./FPS.svelte";
  import BoidSimulation from "./BoidSimulation.svelte";
  import { tweened } from "svelte/motion";
  import { cubicInOut, cubicOut } from "svelte/easing";
  import { fade, slide } from "svelte/transition";
  import { crossfade } from "svelte/transition";

  import { addBoids, boidSim, cursorPos } from "./boidSimControls.js";
  import {
    AtomBoid,
    BlueTab,
    Default,
    OrangeTab,
    YellowTab,
  } from "./lib/presetBoids.js";
  import { derived, writable } from "svelte/store";
  import { onMount } from "svelte";
  import PageReveal from "./PageReveal.svelte";
  import { numActiveBoids } from "./lib/boid-engine/main.js";
  import SlideDrawer from "./SlideDrawer.svelte";
  import CarouselTabs from "./CarouselTabs.svelte";
  import { randomizeBoidType } from "./lib/boid-engine/boid-creation";
  import Github from "./lib/svelte-components/Github.svelte";
  import TwitterLogo from "./lib/svelte-components/TwitterLogo.svelte";
  import LinkedIn from "./lib/svelte-components/LinkedIn.svelte";
  import Warpcast from "./lib/svelte-components/Warpcast.svelte";
  import Email from "./lib/svelte-components/Email.svelte";
  import LinkCard from "./LinkCard.svelte";

  let started = false;

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
    } else if (event.key === "t" || event.key === "T") {
      handleHideUI();
    }
  }

  let visible = false;

  // prettier-ignore
  const tabs = [
        { id: "intro", text: "䷉ Intro", boidType: Default },
        { id: "my-stuff", text: "䷑ My Stuff", boidType: BlueTab },
        { id: "my-tech", text: "⌥ My Tech", boidType: YellowTab },
        { id: "puzzlebets", text: "⁒ Smart Contract PvP Betting", boidType: OrangeTab },
        { id: "boids", text: "⌔ Boids", boidType: AtomBoid },
    ] as const;

  const technologies = [
    { name: "Svelte", rating: 1 },
    { name: "SvelteKit", rating: 0.9 },
    { name: "Elixir", rating: 0.8 },
    { name: "Phoenix", rating: 0.7 },
    { name: "Solidity", rating: 0.8 },
    { name: "Typescript", rating: 0.9 },
    { name: "Rust", rating: 0.3 },
    { name: "React", rating: 0.6 },
    { name: "Foundry", rating: 0.75 },
    { name: "Ethers", rating: 0.5 },
    { name: "Viem", rating: 0.9 },
    { name: "Python", rating: 0.5 },
    { name: "Tailwind", rating: 0.8 },
    { name: "PostgreSQL", rating: 0.5 },
    { name: "Supabase", rating: 0.8 },
    { name: "UI/UX Design", rating: 0.65 },
    { name: "AWS Services", rating: 0.3 },
    { name: "Docker", rating: 0.6 },
    { name: "Playwright", rating: 0.85 },
    { name: "Full Stack Web Development", rating: 1 },
    { name: "EVM Development", rating: 0.9 },
    { name: "Smart Contract Design", rating: 0.8 },
    { name: "Blockchain Indexing", rating: 0.4 },
    { name: "Functional Programming", rating: 0.9 },
    { name: "Assertive Programming", rating: 0.7 },
    { name: "Distributed System Design", rating: 0.6 },
  ];

  const tabIndex = writable<number>(0);
  const curTab = derived(tabIndex, (i) => tabs[i]);

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

  onMount(() => {
    visible = true;
    window.addEventListener("keydown", handleKeydown);
    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  });

  const [send, receive] = crossfade({ duration: 380, easing: cubicInOut });

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

  function borderColorStrength(rating: number, baseColor: string) {
    const [h, s, l] = baseColor.match(/\d+/g).map(Number);
    const adjustedL = Math.round(l * (0.25 + rating)); // Adjust lightness based on rating
    return `hsla(${h}, ${s}%, ${adjustedL}%, ${0.2 + 0.8 * rating})`;
  }

  let uiVisible = true;

  function handleHideUI() {
    uiVisible = !uiVisible;
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
    />

    <FPS onFrame={(_fps) => ($fps = _fps)} />
  </Canvas>

  {#if uiVisible}
    <div
      transition:slide={{ axis: "x", duration: 180, easing: cubicInOut }}
      class="overlay flex flex-col lg:flex-row justify-between gap-14"
    >
      <div class="shrink-0 flex flex-col w-full h-full sm:w-[500px]">
        <!-- Page Header and Navigation -->
        <div class="px-5 pt-5">
          <div class="flex mb-2 justify-between items-center w-full">
            <div
              class=" text-xs flex items-center gap-2"
              in:send={{ key: "fps-toggle" }}
              out:receive={{ key: "fps-toggle" }}
            >
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
              <div
                class="mt-3"
                in:send={{ key: "ui-toggle" }}
                out:receive={{ key: "ui-toggle" }}
              >
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
                "I'm a natural tinkerer often drawn to new technologies and unexplored concepts. (easily nerd-sniped)",
                "Originally an aerospace engineer, I developed a knack for creating and thinking about software systems. I now spend my time building full-stack web applications, with a strong focus around blockchain-supported tech stacks.",
                "I've worked professionally on flight control systems, automated trading systems, an early defi protocol, decentralized social platforms, onchain gaming, an LLM based persona creation app, and more...",
              ]}
              color={tabs[0].boidType.color}
              delayIn={500}
            />

            <!-- Puzzle Bets Page -->
          {:else if $curTab.id === "puzzlebets"}
            <a
              in:slide={{ duration: 200, delay: 300 }}
              out:slide={{ duration: 200 }}
              class="flex gap-3 items-center px-5 pt-6 pb-4"
              href="https://puzzle-bets-v2.vercel.app/"
              target="_blank"
            >
              <img
                src="https://puzzle-bets-v2.vercel.app/character-logo.png"
                class="w-6 h-6 rounded-md"
              />

              <div class="p-1">
                <h3
                  class="text-base font-semibold leading-tight underline underline-offset-2"
                >
                  Puzzle Bets V2 Preview
                </h3>
              </div>
            </a>

            <PageReveal
              pages={[
                "Puzzle Bets, a PvP onchain betting game, is the result of a multi-year solo exploration into a real-time consumer crypto application stack.",
                "My goal was to produce an onchain game with UX rivaling existing web-based social games.",
                "I started iterating on early concepts before smart wallets or social sign-in embedded wallets even existed. Connecting external wallets and enabling real-time blockchain state updates was no easy feat, but as I've learned the tools, the tools themselves have greatly improved.",
                "As account abstraction tooling has matured, I've switched Puzzle Bets to a smart wallet integration. This was a huge unlock that allows users to play games without incurring gas fees or cumbersome transaction popups.",
                "This smart wallet integration comined with MUD (a full stack Smart Contract development framework) and fast Ethereum L2 block times results in a fun, fast, and easy-to-use onchain application.",
              ]}
              color={$curTab.boidType.color}
              delayIn={500}
              padding="pr-2"
            />
          {:else if $curTab.id === "my-stuff"}
            <div transition:slide={{ duration: 200 }} class="overflow-y-auto">
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

              <div class="flex flex-col gap-3 px-4">
                <LinkCard
                  link="https://puzzle-bets-v2.vercel.app/"
                  label="Puzzle Bets V2 (preview)"
                  img="https://puzzle-bets-v2.vercel.app/character-logo.png"
                  description="Revamped onchain competitive puzzle arenas"
                  color={$curTab.boidType.color}
                />
                <LinkCard
                  img="https://beta.puzzlebets.xyz/favicon.png"
                  link="https://beta.puzzlebets.xyz/welcome"
                  label="Puzzle Bets"
                  description="Play puzzles, bets with friends: realtime onchain gaming"
                  color={$curTab.boidType.color}
                />
                <LinkCard
                  img="https://jaxernst.gallerycdn.vsassets.io/extensions/jaxernst/night-shade/0.0.12/1724793766996/Microsoft.VisualStudio.Services.Icons.Default"
                  link="https://marketplace.visualstudio.com/items?itemName=jaxernst.night-shade"
                  label="Night Shade"
                  description="My custom VS Code theme"
                  color={$curTab.boidType.color}
                />
                <LinkCard
                  img="https://alarmbets.tech/favicon.ico"
                  link="https://alarmbets.tech/"
                  label="Social Alarm Clock (Alarm Bets)"
                  description="Create alarm clock contracts and stake money to wake up on time"
                  color={$curTab.boidType.color}
                />
                <LinkCard
                  img="https://avatars.githubusercontent.com/u/35270686?s=200&v=4"
                  link="https://ethglobal.com/showcase/pledger-board-vc1x2"
                  label="Pledger Board"
                  description="EthGlobal hackathon winning submission"
                  color={$curTab.boidType.color}
                  imgSize="w-6 h-6 rounded-md"
                />
              </div>
            </div>
          {:else if $curTab.id === "my-tech"}
            <div
              transition:slide={{ duration: 200 }}
              class="flex flex-wrap gap-3 px-4 pt-8 overflow-y-auto"
            >
              {#each technologies as tech}
                <div
                  class="px-2 py-1 rounded hover:bg-white/10 transition-colors"
                  style="border: 1px solid {borderColorStrength(
                    tech.rating,
                    $curTab.boidType.color
                  )};"
                >
                  {tech.name}
                </div>
              {/each}
            </div>
          {:else if $curTab.id === "boids"}
            <PageReveal
              pages={[
                "Boid's algorithm is a simple yet elegant algorithm that emulates flocking behavior. The core algorithm contains three rules for the each Boid to follow: Align with neighbors, gravitate towards neighbors, and separate from neighbors that are too close.",
                "These rules alone create interesting non-deterministic behavior, but the algorithm can be expanded upon to create even cooler emergent behavior.",
                "My implemenation encodes additional 'behaviors' into a set of attributes which I call a 'species'. While the boids behave roughly the same within their own species, setting them free with other species creates new emergent behaviors that aren't typically observed with the original Boid's alogrithm.",
                "See how many Boids you can get on screen!",
              ]}
              color={$curTab.boidType.color}
              delayIn={500}
            />
          {/if}
        {/if}
      </div>

      <!-- Slide drawer content -->
      <div
        class="w-full h-full lg:w-[700px] xl:w-[800px] relative overflow-hidden px-10"
        style="pointer-events: none;"
      >
        {#if $curTab.id === "puzzlebets"}
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
  {/if}

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
      class="absolute leading-snug right-2 p-2 rounded text-white text-[10px] flex gap-2"
      style={$width > 768 ? "top: .5rem;" : "bottom: .5rem;"}
    >
      <button
        on:click={handleSpawn}
        class="flex items-center gap-1 border border-white/20 sm:px-2 px-1 sm:py-1 hover:bg-white/10 transition-colors rounded"
      >
        <div class="font-medium sm:inline hidden">S</div>
        <span class=" font-extralight">Spawn</span>
      </button>
      <button
        on:click={handleClear}
        class="flex items-center gap-1 border border-white/20 sm:px-2 px-1 sm:py-1rounded hover:bg-white/10 transition-colors rounded"
      >
        <div class="font-medium sm:inline hidden">C</div>
        <span
          class="font-light sm:font-extralight
          ">Clear</span
        >
      </button>
      <button
        on:click={handleHideUI}
        class="flex items-center gap-1 border border-white/20 sm:px-2 px-1 sm:py-1rounded hover:bg-white/10 transition-colors rounded"
      >
        <div class="font-medium sm:inline hidden">T</div>
        <span class="font-extralight">Toggle UI</span>
      </button>
    </div>

    {#if !uiVisible}
      <div
        class="absolute top-2 md:top-5 left-2 flex mb-2 justify-between items-center w-full"
      >
        <div
          class="text-xs flex items-center gap-2"
          in:send={{ key: "fps-toggle" }}
          out:receive={{ key: "fps-toggle" }}
        >
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

      <div
        class="absolute top-10 md:top-14 left-2 flex flex-col gap-2 items-start"
        in:send={{ key: "ui-toggle" }}
        out:receive={{ key: "ui-toggle" }}
      >
        {#each tabs as tab, index}
          <button
            on:click={() => handleSpawnButtonClick(null, index)}
            class="flex items-center gap-1 border border-white/20 px-2 py-1 hover:bg-white/10 transition-colors rounded"
            style="color: {tab.boidType.color};"
          >
            {tab.text.split(" ")[0]}
          </button>
        {/each}
      </div>
    {/if}
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
    height: 100svh;
  }

  @keyframes wave {
    0% {
      transform: translateY(10);
    }
    100% {
      transform: translateY(-10);
    }
  }
</style>
