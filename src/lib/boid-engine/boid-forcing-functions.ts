import { drawPoint } from "./canvas-drawers";
import type { Boid, Vec2D } from "./types";
import {
  distance,
  dot,
  mul,
  norm,
  subtract,
  magnitude,
  distanceSquared,
  add,
  div,
  addScaled,
} from "./vector-math-mut";

// Forcing and boid perception functions
// Align, Separate, and Gravitate forces are applied in 'combinedBoidRules'

export function combinedBoidRules(
  boid: Boid,
  others: Boid[],
  ctx?: CanvasRenderingContext2D,
  refDist?: number
): Vec2D {
  const pSum: Vec2D = [0, 0];
  const vSum: Vec2D = [0, 0];
  let mSum = 0;
  const othersLength = others.length;

  for (let i = 0; i < othersLength; i++) {
    const other = others[i];
    mSum += other.mass;
    pSum[0] += other.vec.pos[0];
    pSum[1] += other.vec.pos[1];
    vSum[0] += other.vec.vel[0];
    vSum[1] += other.vec.vel[1];
  }

  const invOthersLength = 1 / othersLength;
  const mAvg = mSum * invOthersLength;
  const pAvg: Vec2D = [pSum[0] * invOthersLength, pSum[1] * invOthersLength];
  const vAvg: Vec2D = [vSum[0] * invOthersLength, vSum[1] * invOthersLength];

  const sepResult: Vec2D = [0, 0];
  const gravResult: Vec2D = [0, 0];
  const alignResult: Vec2D = [0, 0];
  const temp: Vec2D = [0, 0];

  const distSquared = distanceSquared(boid.vec.pos, pAvg);
  if (distSquared <= boid.separationDistance * boid.separationDistance) {
    subtract(temp, boid.vec.pos, pAvg);
    norm(sepResult, temp);
    mul(sepResult, sepResult, refDist / (Math.sqrt(distSquared) + 0.1));
  }

  subtract(temp, pAvg, boid.vec.pos);
  mul(gravResult, temp, mAvg / boid.mass);

  subtract(alignResult, vAvg, boid.vec.vel);

  const result: Vec2D = [0, 0];
  addScaled(result, result, gravResult, boid.gravitationFactor);
  addScaled(result, result, alignResult, boid.alignmentFactor);
  addScaled(result, result, sepResult, boid.separationFactor);

  return result;
}

// Run away from the point
export function detract(
  boid: Boid,
  point: Vec2D,
  strength: number,
  minDistance: number
): Vec2D {
  const result: Vec2D = [0, 0];
  const distSq = distanceSquared(boid.vec.pos, point);
  const minDistSq = minDistance * minDistance;

  // If the boid is further than minDistance, no force is applied
  if (distSq > minDistSq) return result;

  const dist = Math.sqrt(distSq);
  subtract(result, boid.vec.pos, point);

  // Calculate the force magnitude
  // This will approach infinity as dist approaches minDistance
  const forceMagnitude =
    strength * Math.exp(minDistance / (dist - minDistance));

  // Normalize the difference vector and scale it by the force magnitude
  const invMag = 1 / dist;
  result[0] *= invMag * forceMagnitude;
  result[1] *= invMag * forceMagnitude;

  return result;
}

// Optimized targetVelocityAdjustmentForce function
export function targetVelocityAdjustmentForce(
  boid: Boid,
  speedScalar: number = 1
): Vec2D {
  const currentV = boid.vec.vel;
  const targetSpeed = boid.targetV * speedScalar;
  const speed = magnitude(currentV);

  if (Math.abs(speed - targetSpeed) < 0.001) {
    // If the speed is very close to the target, return no force
    return [0, 0];
  }

  const result: Vec2D = [0, 0];
  const invSpeed = 1 / speed;
  const direction: Vec2D = [currentV[0] * invSpeed, currentV[1] * invSpeed];

  // Calculate target velocity
  const targetX = direction[0] * targetSpeed;
  const targetY = direction[1] * targetSpeed;

  // Calculate velocity difference
  const velocityDifference: Vec2D = [
    targetX - currentV[0],
    targetY - currentV[1],
  ];

  const brakingForceMagnitude = magnitude(velocityDifference);
  const forceDirection: Vec2D = [-direction[0], -direction[1]];

  if (speed <= targetSpeed) {
    forceDirection[0] = -forceDirection[0];
    forceDirection[1] = -forceDirection[1];
  }

  result[0] =
    forceDirection[0] * brakingForceMagnitude * boid.targetVCorrectionFactor;
  result[1] =
    forceDirection[1] * brakingForceMagnitude * boid.targetVCorrectionFactor;

  return result;
}
