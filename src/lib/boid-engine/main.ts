import {
  combinedBoidRules,
  detract,
  targetVelocityAdjustmentForce,
} from "./boid-forcing-functions";
import type { Boid, BoidAttrs, BoidVec, Detractor, Vec2D } from "./types";
import { findBoidsInSight, limitSpeed, makeMovingAverage } from "./sim-utils";
import { add, magnitude, mul, norm } from "./vectorMath";
import { writable } from "svelte/store";
import { SpatialHashGrid } from "./spatial-hashing";

export const numActiveBoids = writable(0);

const boidVec: BoidVec = {
  pos: [0, 0],
  vel: [0, 0],
  accel: [0, 0],
};

export const defaultAttrs: BoidAttrs = {
  mass: 0.28,
  targetV: 110,
  maxV: 500,
  targetVCorrectionFactor: 1,
  sightRadius: 200,
  sightPeripheralDeg: 200,
  separationDistance: 100,
  separationFactor: 1.5,
  gravitationFactor: 1.1,
  alignmentFactor: 0.1,
  forceSmoothing: 7,
  randomImpulses: [],
  color: "hsl(0, 100%, 50%)",
};

const defaultBoid = {
  vec: boidVec,
  ...defaultAttrs,
};

const maxGlobalSpeed = 1500;
let defaultDetractorDistance = 100;
let defaultDetractorStrength = 40000;
let speedScalar = 1;
let spatialGrid: SpatialHashGrid;

// Main simulation loop updater
function updateFrame(
  boids: Boid[],
  dt: number,
  board: { h: number; w: number },
  detractors: Detractor[] = [],
  ctx
) {
  // Initialize or clear the spatial grid
  if (!spatialGrid) {
    spatialGrid = new SpatialHashGrid(Math.max(board.w, board.h) / 10); // Adjust cell size as needed
  } else {
    spatialGrid.clear();
  }

  // Insert all boids into the spatial grid
  for (const boid of boids) {
    spatialGrid.insert(boid);
  }

  for (let i = 0; i < boids.length; i++) {
    const boid = boids[i];
    let vec = boid.vec;

    const nearbyBoids = spatialGrid.query(
      boid.vec.pos[0],
      boid.vec.pos[1],
      boid.sightRadius
    );

    const others = findBoidsInSight(boid, nearbyBoids);

    let force = [0, 0] as Vec2D;
    if (others.length > 0) {
      force = combinedBoidRules(boid, others, ctx, board.w);
    }

    if (boid.randomImpulses.length > 0) {
      boid.randomImpulses.forEach((impulse) => (force = add(force, impulse())));
    }

    force = add(force, targetVelocityAdjustmentForce(boid, speedScalar));

    if (boid.forceSmoothing > 0 && boid.forceMovingAverage) {
      force = boid.forceMovingAverage(force);
    }

    detractors.forEach((detractor) => {
      force = add(
        force,
        detract(
          boid,
          [detractor.x, detractor.y],
          detractor.strength ? detractor.strength : defaultDetractorStrength,
          detractor.distance ? detractor.distance : defaultDetractorDistance
        )
      );
    });

    // Update velocity
    vec.vel[0] += (force[0] * dt) / (boid.mass + 0.000001);
    vec.vel[1] += (force[1] * dt) / (boid.mass + 0.000001);

    vec.vel = limitSpeed(boid, Math.min(maxGlobalSpeed, boid.maxV), 40);

    // Update position using the updated velocity
    vec.pos[0] += vec.vel[0] * dt;
    vec.pos[1] += vec.vel[1] * dt;

    // Enforce boundaries
    if (vec.pos[0] > board.w) vec.pos[0] = 0;
    if (vec.pos[0] < 0) vec.pos[0] = board.w;
    if (vec.pos[1] > board.h) vec.pos[1] = 0;
    if (vec.pos[1] < 0) vec.pos[1] = board.h;

    boid.vec = vec;
  }

  return boids;
}

export function createBoidSimulation({
  numBoids,
  startPos,
  startVel,
  boardSize,
  initialBoidPreset,
}: {
  numBoids: number;
  startPos: [() => number, () => number];
  startVel: [() => number, () => number];
  boardSize: {
    h: number;
    w: number;
  };
  initialBoidPreset?: Partial<BoidAttrs>;
}) {
  let board = boardSize;

  if (boardSize.w < 700) {
    defaultDetractorDistance = 75;
    speedScalar = 0.8;
  }

  // Build initial boid array with the initial boid preset (if provided)
  // Pos and vel generator are applied for each boid individually
  let boids = [...Array(numBoids)].map(() => ({
    ...defaultBoid,
    ...initialBoidPreset,
    vec: {
      ...boidVec,
      pos: [startPos[0](), startPos[1]()],
      vel: [startVel[0](), startVel[1]()],
    },
  })) as Boid[];

  boids = boids.map((boid) => {
    // Currently not using because the generator significantly impacts performance
    // boid.randomImpulses = [RandomForceGenerator(0.00005, 20000, 1000)];
    boid.forceMovingAverage = makeMovingAverage(
      [0, 0],
      (initialBoidPreset ?? defaultBoid).forceSmoothing
    );
    return boid;
  });

  // Add new boids to the sim
  let addBoidQueue: (() => Boid)[] = [];

  // Update existing boids in the sim
  let updateBoidQueue: ((
    attrs: Partial<BoidAttrs>,
    atIndex: number
  ) => Boid)[] = [];

  let detractors: Detractor[] = [];

  numActiveBoids.set(numBoids);

  return {
    reset: () => {
      boids = [];
      detractors = [];
      numActiveBoids.set(0);
    },
    update: (
      dt: number,
      ctx: {
        htmlContext?: CanvasRenderingContext2D;
        visibleBoard?: { w: number; h: number };
      },
      frameDetractors?: Detractor[]
    ) => {
      // Add boids from the queue
      for (let addBoid of addBoidQueue) {
        numActiveBoids.update((x) => x + 1);
        boids = [...boids, addBoid()];
      }

      addBoidQueue = [];

      // Apply behavoir and attribute updates
      for (let updateBoid of updateBoidQueue) {
        boids = boids.map((boid, i) => updateBoid(boid, i));
      }

      // make boids go brr
      boids = updateFrame(
        boids,
        dt,
        ctx.visibleBoard ?? board,
        [...detractors, ...frameDetractors],
        ctx.htmlContext
      );

      return boids;
    },
    resizeBoard: (newBoard: { h: number; w: number }) => {
      board = newBoard;
    },
    addBoid: (
      startPos: { x: number; y: number },
      startVel: { x: number; y: number },
      boidType?: Partial<BoidAttrs>
    ) => {
      const i = boids.length;

      addBoidQueue.push(() => ({
        ...defaultAttrs,
        ...boidType,
        vec: {
          ...boidVec,
          pos: [startPos.x, startPos.y],
          vel: [startVel.x, startVel.y],
        },
      }));
      return i;
    },
    addDetractor: (detractor: Detractor) => {
      detractors.push(detractor);
    },
    updateBoids: (newAttrs: Partial<BoidAttrs>, atIndices?: number[]) => {
      if (!atIndices) {
        atIndices = Array.from({ length: boids.length }, (_, i) => i);
      }

      updateBoidQueue.push((boid: Boid, boidIndex: number) => {
        if (atIndices.includes(boidIndex)) {
          return { ...boid, ...newAttrs };
        }
        return boid;
      });
    },

    get boids() {
      return boids;
    },

    get detractors() {
      return detractors;
    },
  };
}
