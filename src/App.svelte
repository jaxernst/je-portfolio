<script lang="ts">
  import { width, height } from "./game.js";
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
  import { onDestroy, onMount } from "svelte";
  import PageReveal from "./PageReveal.svelte";
  import { numActiveBoids } from "./lib/boid-engine/main.js";
  import SlideDrawer from "./SlideDrawer.svelte";
  import CarouselTabs from "./CarouselTabs.svelte";
  import { randomizeBoidType } from "./lib/boid-engine/boid-creation";
  import Github from "./lib/components/Github.svelte";
  import TwitterLogo from "./lib/components/TwitterLogo.svelte";
  import LinkedIn from "./lib/components/LinkedIn.svelte";
  import Warpcast from "./lib/components/Warpcast.svelte";
  import Email from "./lib/components/Email.svelte";
  import LinkCard from "./LinkCard.svelte";
  import AnimatedBorderButton from "./lib/svelte-components/AnimatedBorderButton.svelte";

  // Constants
  const warningText = "Warning: Contains interactive motion";

  // prettier-ignore
  const tabs = [
        { id: "intro", text: "䷉ Intro", boidType: Default },
        { id: "my-stuff", text: "䷑ My Stuff", boidType: BlueTab },
        { id: "my-tech", text: "⌥ My Tech", boidType: YellowTab },
        { id: "puzzlebets", text: "⁒ Smart Contract PvP Betting", boidType: OrangeTab },
        { id: "boids", text: "⌔ Boids", boidType: AtomBoid },
    ] as const;

  const technologies = [
    { name: "Svelte", rating: 1, type: "stack" },
    { name: "SvelteKit", rating: 0.9, type: "stack" },
    { name: "Elixir", rating: 0.8, type: "stack" },
    { name: "Phoenix", rating: 0.7, type: "stack" },
    { name: "Solidity", rating: 0.8, type: "stack" },
    { name: "Typescript", rating: 0.9, type: "stack" },
    { name: "Rust", rating: 0.3, type: "stack" },
    { name: "React", rating: 0.8, type: "stack" },
    { name: "Foundry", rating: 0.75, type: "stack" },
    { name: "Ethers", rating: 0.7, type: "stack" },
    { name: "Viem", rating: 0.9, type: "stack" },
    { name: "MUD", rating: 0.8, type: "stack" },
    { name: "Tailwind", rating: 0.8, type: "stack" },
    { name: "PostgreSQL", rating: 0.5, type: "stack" },
    { name: "Docker", rating: 0.6, type: "stack" },
    { name: "Supabase", rating: 0.8, type: "stack" },
    { name: "Playwright", rating: 0.85, type: "stack" },
    { name: "Python", rating: 0.65, type: "stack" },
    { name: "Full Stack Web Development", rating: 0.9, type: "skill" },
    { name: "EVM Development", rating: 0.9, type: "skill" },
    { name: "Smart Contract Design", rating: 0.8, type: "skill" },
    { name: "Smart Contract Standards", rating: 0.8, type: "skill" },
    { name: "UI/UX Design", rating: 0.65, type: "skill" },
    { name: "Blockchain Indexing", rating: 0.58, type: "skill" },
    { name: "AWS Services", rating: 0.3, type: "skill" },
    { name: "E2E Testing", rating: 0.8, type: "skill" },
    { name: "Functional Programming", rating: 0.9, type: "skill" },
    { name: "Assertive Programming", rating: 0.7, type: "skill" },
    { name: "Distributed System Design", rating: 0.6, type: "skill" },
  ];

  // State
  let started = false;
  let addingDetractor = false;
  let waitingForClick = false;
  let startScreenPlaying = false;
  let startScreenActive = true;
  let uiVisible = true;

  const tabIndex = writable<number>(0);
  const curTab = derived(tabIndex, (i) => tabs[i]);

  let fps = writable(60);

  // Animation //

  const [send, receive] = crossfade({ duration: 380, easing: cubicInOut });

  const time = tweened(0, {
    duration: 2000,
    easing: cubicInOut,
  });

  // Animated sine wave text
  $: waveLetters = warningText.split("").map((char, i) => ({
    char,
    y: waveIndexValue(i, warningText.length, $time * Math.PI * 2),
  }));

  let interval;
  $: if (startScreenPlaying) {
    advanceTime();
    interval = setInterval(advanceTime, 2000);
  }

  // Advance time to drive animations
  function advanceTime() {
    time.set($time + 1);
  }

  // Lifecycle //

  onMount(() => {
    startScreenPlaying = true;
    window.addEventListener("keydown", handleKeydown);
    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  });

  onDestroy(() => {
    interval && clearInterval(interval);
  });

  // Event handlers //

  function handleKeydown(event) {
    if (event.key === "Enter" && !started && startScreenActive) {
      started = true;
      startScreenActive = false;
    } else if (event.key === "s" || event.key === "S") {
      spawnRandomBoid();
    } else if (event.key === "c" || event.key === "C") {
      $boidSim.reset();
    } else if (event.key === "b" || event.key === "B") {
      handleHideUI();
    }
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

  function handleSpawn() {
    spawnRandomBoid();
  }

  function handleClear() {
    $boidSim.reset();
  }

  function handleHideUI() {
    uiVisible = !uiVisible;
  }

  // Boid helpers //

  let spawnCount = 0;
  let randomBoidType = randomizeBoidType();
  function spawnRandomBoid() {
    if (!$cursorPos) return;

    if (spawnCount % 15 === 0) {
      randomBoidType = randomizeBoidType();
    }

    $addBoids(randomBoidType, 5, {
      x: $width / 2,
      y: $height / 2,
    });

    spawnCount++;
  }

  function maybeAddDetractor(event) {
    if (!addingDetractor) return;
    if (!waitingForClick) {
      waitingForClick = true;
      return;
    }
    const { clientX, clientY } = event;
    $boidSim.addDetractor({ x: clientX, y: clientY });
  }

  // Misc helpers //

  function waveIndexValue(i, length, t) {
    const frac = (0.08 * (i * Math.PI)) / length;
    return 0.07 * Math.sin((frac * 180) / Math.PI + t);
  }

  function borderColorStrength(rating: number, baseColor: string) {
    const [h, s, l] = baseColor.match(/\d+/g).map(Number);
    const adjustedL = Math.round(l * (0.25 + rating));
    return `hsla(${h}, ${s}%, ${adjustedL}%, ${0.2 + 0.8 * rating})`;
  }

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
                  Full stack engineer building onchain applications
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
                "My name is Jackson. I'm a self-taught software developer and lifelong tinkerer.",
                "I enjoy building full-stack web applications and am often drawn to new technologies and unexplored concepts. (easily nerd-sniped)",
                "Originally an aerospace engineer, I developed a knack for creating and thinking about software systems. I now spend my time building full-stack web applications on top of blockchain-supported tech stacks.",
                "I've worked professionally on military flight control systems, automated crypto trading systems, an MEV-capturing DeFi protocol, a decentralized social platform, onchain gaming, an LLM persona builder app, and more...",
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
                alt="Puzzle Logo"
              />

              <div class="p-1">
                <h3
                  class="text-base font-semibold leading-tight underline underline-offset-2"
                >
                  Puzzle Bets V2 (testnet beta)
                </h3>
              </div>
            </a>

            <PageReveal
              pages={[
                "Puzzle Bets, a player-vs-player (PvP) onchain betting game, is the result of a multi-year solo exploration into a real-time consumer-crypto application stack.",
                "What started as a simple Solidity-based PvP betting protocol with a minimal frontend evolved into a complex distributed system as I uncovered the challenges of building a production-ready crypto app that can scale.",
                "As I got deeper, the unknown unknowns became apparent and the technical scope creeped, but I was determined.",
                "Ultimately, I had produced much more than just some smart contracts and a frontend; I built indexers to track state, I deployed APIs to hydrate clients with queryable state, I wrote client-side code to maintain synchronization, I developed backend services to sign puzzle attestations, I created custom wallet-connect libraries for Svelte, and I iterated on UI implementations for a reliable and intuitive experience.",
                "After years of experimentation, development, and testing, the result is a product that effectively abstracts away these complexities to deliver a fun and casual onchain gaming experience.",
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
                  link="https://beta.puzzlebets.xyz/"
                  label="Puzzle Bets V2 - Testnet Beta"
                  img="https://beta.puzzlebets.xyz/character-logo.png"
                  description="Onchain competitive puzzle arenas with revamped UX"
                  color={$curTab.boidType.color}
                />

                <LinkCard
                  img="https://puzzle-bets.vercel.app/favicon.png"
                  link="https://puzzle-bets.vercel.app/"
                  label="Puzzle Bets"
                  description="Play puzzles, bets with friends: realtime onchain gaming"
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

                <LinkCard
                  img="https://avatars.githubusercontent.com/u/109633172?s=200&v=4"
                  link="https://github.com/wevm/viem/pull/954"
                  label="Viem (contributor)"
                  color={$curTab.boidType.color}
                  imgSize="w-6 h-6 rounded-md"
                  description="PR addressing an event filter polling issue resulting from inconsistent execution client interfaces"
                />

                <LinkCard
                  img="https://jaxernst.gallerycdn.vsassets.io/extensions/jaxernst/night-shade/0.0.12/1724793766996/Microsoft.VisualStudio.Services.Icons.Default"
                  link="https://marketplace.visualstudio.com/items?itemName=jaxernst.night-shade"
                  label="Night Shade"
                  description="My custom VS Code theme"
                  color={$curTab.boidType.color}
                />
              </div>
            </div>
          {:else if $curTab.id === "my-tech"}
            <div
              transition:slide={{ duration: 200 }}
              class="flex flex-col gap-6 px-4 pt-8 overflow-y-auto"
            >
              <div>
                <h3 class="text-lg font-semibold mb-2">Stack</h3>
                <div class="flex flex-wrap gap-3">
                  {#each technologies.filter((tech) => tech.type === "stack") as tech}
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
              </div>

              <div>
                <h3 class="text-lg font-semibold mb-2">Skills</h3>
                <div class="flex flex-wrap gap-3">
                  {#each technologies.filter((tech) => tech.type === "skill") as tech}
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
              </div>
            </div>
          {:else if $curTab.id === "boids"}
            <PageReveal
              pages={[
                "The curious triangles exploring your screen are called Boids. They come in many different colors and species, and they all flock and explore independently.",
                "Their core behavior comes from 'Boid's Algorithm' which describes three simple rules for the Boids to follow: Align with neighbors, gravitate towards neighbors, and separate to avoid collisions.",
                "We can apply these rules to a 2d Euler force-mass simulation and assign unique properties to each Boid species to alter their behavior. These properties include mass, speed, sight peripheral, sight radius, alignment behavior, and more.",
                "The large set of possible parameter combinations results in interesting and emergent behaviors when many Boids of varying species are present. Some emergent patterns can even pseudo resemble fluid flow and biological patterns.",
                "Enter boid mode (B or press 'Boid Mode') to spawn and observe unique flocks of boids. (See how many you can get on screen)",
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

  <!--Boid control buttons -->
  {#if started}
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

    <div
      class="absolute leading-snug right-2 p-2 rounded text-white text-[10px] flex gap-2"
      style={$width > 768 ? "top: .5rem;" : "bottom: .5rem;"}
    >
      <button
        on:click={handleSpawn}
        class="flex items-center gap-1 border border-white/20 sm:px-2 px-1 sm:py-1 hover:bg-white/10 transition-colors rounded"
      >
        <div class="font-medium sm:inline hidden pointer-events-none">S</div>
        <span class="font-extralight pointer-events-none">Spawn</span>
      </button>
      <button
        on:click={handleClear}
        class="flex items-center gap-1 border border-white/20 sm:px-2 px-1 sm:py-1rounded hover:bg-white/10 transition-colors rounded"
      >
        <div class="font-medium sm:inline hidden pointer-events-none">C</div>
        <span class="font-light sm:font-extralight pointer-events-none"
          >Clear</span
        >
      </button>

      <AnimatedBorderButton onClick={handleHideUI}>
        <div class="relative z-10">
          <div class="font-medium sm:inline hidden pointer-events-none">B</div>
          <span class="font-extralight pointer-events-none">Boid Mode</span>
        </div>
      </AnimatedBorderButton>
    </div>
  {/if}

  <!-- Github Link-->
  <a
    href="https://github.com/jaxernst/je-portfolio"
    target="_blank"
    rel="noopener noreferrer"
    class="text-[10px] text-neutral-400 flex items-center gap-1 absolute bottom-2 left-2"
  >
    <Github class="w-4 h-4 fill-neutral-400" />
    View source code
  </a>

  <!--Landing Page-->
  {#if !started && startScreenActive}
    <div
      out:slide={{ easing: cubicInOut, duration: 250 }}
      class="centered-button flex flex-col gap-20 items-center pb-[180px]"
    >
      {#if startScreenPlaying}
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
