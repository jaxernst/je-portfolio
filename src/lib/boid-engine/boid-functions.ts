import { canvasArrow, drawPoint } from "./canvas-drawers";
import type { Boid } from "./main";
import type { Vec2D } from "./types";
import { distance, dot, mul, norm, subtract, magnitude } from "./vectorMath";

/** Forcing / boid perception functions */

// Make the boid align with the flock
export function align(
  boid: Boid,
  others: Boid[],
  ctx: CanvasRenderingContext2D
) {
  let vSum = [0, 0];
  for (let other of others) {
    vSum[0] += other.vec.vel[0];
    vSum[1] += other.vec.vel[1];
  }

  // Average velocity of other boids
  const vAvg = [vSum[0] / others.length, vSum[1] / others.length] as Vec2D;

  return subtract(vAvg, boid.vec.vel);
}

// Gravitate toward the center (average position) of other boids
export function gravitate(boid: Boid, others: Boid[], ctx) {
  const pSum = [0, 0];
  for (let other of others) {
    pSum[0] += other.vec.pos[0];
    pSum[1] += other.vec.pos[1];
  }
  const pAvg = [pSum[0] / others.length, pSum[1] / others.length] as Vec2D;

  // Draw cg
  drawPoint(...pAvg, ctx);

  return subtract(pAvg, boid.vec.pos);
}

// Separate away from others after getting too close (closer than the separationDistance)
export function separate(
  boid: Boid,
  others: Boid[],
  refDist: number,
  ctx?: CanvasRenderingContext2D
): Vec2D {
  const pSum = [0, 0];
  for (let other of others) {
    pSum[0] += other.vec.pos[0];
    pSum[1] += other.vec.pos[1];
  }
  const pAvg = [pSum[0] / others.length, pSum[1] / others.length] as Vec2D;
  const dist = distance(boid.vec.pos, pAvg);
  if (dist > boid.separationDistance) return [0, 0];

  const vAway = norm(subtract(boid.vec.pos, pAvg));
  return mul(vAway, refDist / (dist + 0.1));
}

// Run away from the point
export function detract(
  boid: Boid,
  point: [number, number],
  strength: number,
  minDistance: number
): Vec2D {
  if (distance(boid.vec.pos, point) > minDistance) return [0, 0];

  const diff = subtract(boid.vec.pos, point);
  return mul(diff, strength / (magnitude(diff) ** 2 + 1));
}
