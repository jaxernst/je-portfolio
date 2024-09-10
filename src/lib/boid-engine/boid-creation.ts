import { debug } from "svelte/internal";
import type { BoidAttrs } from "./types";

export type AttributeRange = {
  min: number;
  max: number;
  mean?: number;
  stdev?: number;
  skew?: number;
};

type AttributeProbabilityDistribution<T> = {
  [K in keyof T]: AttributeRange;
};

const attributeRanges: AttributeProbabilityDistribution<Partial<BoidAttrs>> = {
  mass: { min: 0.05, max: 0.2, mean: 0.1, stdev: 0.05, skew: 0 },
  targetV: { min: 5, max: 200, mean: 50, stdev: 20, skew: 0 },
  targetVCorrectionFactor: {
    min: 0.06,
    max: 3,
    mean: 1.2,
    stdev: 0.3,
    skew: 0,
  },
  sightRadius: { min: 50, max: 600, mean: 300, stdev: 100, skew: 0 },
  sightPeripheralDeg: { min: 130, max: 300, mean: 180, stdev: 30, skew: 0 },
  separationDistance: { min: 5, max: 200, mean: 100, stdev: 50, skew: 0 },
  separationFactor: { min: 0.5, max: 3, mean: 1, stdev: 0.2, skew: 0 },
  gravitationFactor: { min: 0.1, max: 2, mean: 0.8, stdev: 0.5, skew: 0 },
  alignmentFactor: { min: 0.05, max: 0.5, mean: 0.1, stdev: 0.4, skew: 0 },
  forceSmoothing: { min: 0, max: 20, mean: 0, stdev: 0.05, skew: 0 },
};

export const randomizeBoidType = (deviationFactor: number = 1) => {
  const randomizedValues: Partial<BoidAttrs> = {};

  for (const key in attributeRanges) {
    const range = attributeRanges[key];
    const stdev = (range.stdev || 1) * deviationFactor;
    const randomValue = boxMullerRandom(range.mean, stdev, range.skew);

    // Clamp the value within the range
    const clampedRandomValue = Math.min(
      range.max,
      Math.max(range.min, randomValue)
    );

    randomizedValues[key] = clampedRandomValue;
  }

  console.log(randomizedValues);
  return {
    ...randomizedValues,
    color: `hsl(${Math.random() * 360}, 100%, 50%)`,
  };
};

function boxMullerRandom(mean = 0, stdev = 1, skew = 0) {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random(); // Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

  // Apply the skew
  if (skew !== 0) {
    num = Math.pow(num, skew);
  }

  // Scale and shift by mean and stdev
  num = num * stdev + mean;

  return num;
}
