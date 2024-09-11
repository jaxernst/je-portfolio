import type { Boid, Vec2D } from "./types";
import {
  distance,
  div,
  dot,
  magnitude,
  mul,
  norm,
  subtract,
} from "./vectorMath";

export function makeMovingAverage(
  initVal: Vec2D,
  period: number = 30
): (v: Vec2D) => Vec2D {
  let vals = [];

  // Takes in the current vector, updates the moving average, then returns the moving average
  return (v: Vec2D) => {
    vals.push(v);
    const sum = vals.slice(-period).reduce((acc: Vec2D, cur: Vec2D) => {
      return [acc[0] + cur[0], acc[1] + cur[1]];
    }, initVal);

    return [
      sum[0] / Math.min(vals.length, period),
      sum[1] / Math.min(vals.length, period),
    ] as Vec2D;
  };
}

export const RandomForceGenerator = (
  chance: number,
  strength: number,
  movingAveragePeriod = 100
) => {
  const applyMovingAverage = makeMovingAverage([0, 0], movingAveragePeriod);
  const generateRandom: () => Vec2D = () =>
    Math.random() < chance
      ? [randRange(-strength, strength), randRange(-strength, strength)]
      : [0, 0];

  return () => {
    return applyMovingAverage(generateRandom());
  };
};

export function limitSpeed(
  boid: Boid,
  speedLimit: number,
  speedFloor?: number
) {
  const speed = magnitude(boid.vec.vel);
  if (speed > speedLimit) {
    return mul(div(boid.vec.vel, speed), speedLimit);
  }
  if (speedFloor && speed < speedFloor) {
    return mul(div(boid.vec.vel, speed), speedFloor);
  }
  return boid.vec.vel;
}

function squaredDistance(pos1, pos2) {
  const dx = pos1[0] - pos2[0];
  const dy = pos1[1] - pos2[1];
  return dx * dx + dy * dy;
}

export function findBoidsInSight(targetBoid: Boid, boids: Boid[]): Boid[] {
  const bVec = targetBoid.vec;
  const directionNorm = norm(bVec.vel);
  const TOO_RAD = Math.PI / 360;
  const squaredSightRadius = targetBoid.sightRadius * targetBoid.sightRadius;
  const maxAngle = targetBoid.sightPeripheralDeg * TOO_RAD;
  const cosMaxAngle = Math.cos(maxAngle);

  const boidsInSight: Boid[] = [];
  const incVal = Math.floor(boids.length / 80) + 1;

  for (let i = 0; i < boids.length; i += incVal) {
    if (boids[i] === targetBoid) continue;

    const dx = boids[i].vec.pos[0] - bVec.pos[0];
    const dy = boids[i].vec.pos[1] - bVec.pos[1];
    const squaredDist = squaredDistance(boids[i].vec.pos, bVec.pos);

    if (squaredDist > squaredSightRadius) continue;

    const invDist = 1 / Math.sqrt(squaredDist);
    const toOtherNorm = [dx * invDist, dy * invDist];

    const cosAngle =
      directionNorm[0] * toOtherNorm[0] + directionNorm[1] * toOtherNorm[1];

    if (cosAngle > cosMaxAngle) {
      boidsInSight.push(boids[i]);
    }
  }

  return boidsInSight;
}

export function randRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
