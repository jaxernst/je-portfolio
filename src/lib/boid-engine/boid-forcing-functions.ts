import type { Boid, Vec2D } from "./types";
import {
  mul,
  norm,
  subtract,
  magnitude,
  distanceSquared,
  addScaled,
} from "./vector-math-mut";

// Forcing and boid perception functions
// Align, Separate, and Gravitate forces are applied in 'combinedBoidRules'
// Force functions use mut vector math functions to avoid extra allocations

export function combinedBoidRules(
  boid: Boid,
  others: Boid[],
  ctx?: CanvasRenderingContext2D,
  refDist?: number
): Vec2D {
  const othersLength = others.length;
  const invOthersLength = 1 / othersLength;

  // Allocate for vecto averages
  const avgPosition: Vec2D = [0, 0];
  const avgVelocity: Vec2D = [0, 0];
  let avgMass = 0;

  for (const other of others) {
    avgPosition[0] += other.vec.pos[0];
    avgPosition[1] += other.vec.pos[1];
    avgVelocity[0] += other.vec.vel[0];
    avgVelocity[1] += other.vec.vel[1];
    avgMass += other.mass;
  }

  mul(avgPosition, avgPosition, invOthersLength);
  mul(avgVelocity, avgVelocity, invOthersLength);
  avgMass *= invOthersLength;

  // Calculate separation force
  const separation: Vec2D = [0, 0];
  const distSquared = distanceSquared(boid.vec.pos, avgPosition);
  if (distSquared <= boid.separationDistance ** 2) {
    subtract(separation, boid.vec.pos, avgPosition);
    norm(separation, separation);
    mul(separation, separation, refDist / (distSquared + 0.1));
  }

  // Calculate gravitation force
  const gravitation: Vec2D = [0, 0];
  subtract(gravitation, avgPosition, boid.vec.pos);
  mul(gravitation, gravitation, avgMass / boid.mass);

  // Calculate alignment force
  const alignment: Vec2D = [0, 0];
  subtract(alignment, avgVelocity, boid.vec.vel);

  // Combine forces
  const result: Vec2D = [0, 0];
  addScaled(result, result, gravitation, boid.gravitationFactor);
  addScaled(result, result, alignment, boid.alignmentFactor);
  addScaled(result, result, separation, boid.separationFactor * 40);

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
  const invMag = 1 / (dist + 1);
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
