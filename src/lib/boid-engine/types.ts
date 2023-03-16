export type Vec2D = [number, number];

export type BoidVec = { pos: Vec2D; vel: Vec2D; accel: Vec2D };

export type Boid = {
  vec: BoidVec;
} & BoidAttrs;

export type BoidAttrs = {
  mass: number;
  maxV: number;
  minV: number;
  sightRadius: number;
  sightPeripheralDeg: number;
  separationDistance: number;
  separationFactor: number;
  gravitationFactor: number;
  alignmentFactor: number;
  frictionCoefficient: number;
  forceSmoothing: number;
} & _BoidAttrs;

// Additional functional attributes that can be injected to modify behavior
type _BoidAttrs = {
  forceMovingAverage?: (v: Vec2D) => Vec2D;
};

export type BoidCanvasDraw = (
  pos: Vec2D,
  vel: Vec2D,
  ctx: CanvasRenderingContext2D
) => {};
