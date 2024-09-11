// Optimized Vector Math Module
type Vec2D = [number, number];

export const add = (out: Vec2D, v1: Vec2D, v2: Vec2D): Vec2D => {
  out[0] = v1[0] + v2[0];
  out[1] = v1[1] + v2[1];
  return out;
};

export const addScaled = (
  out: Vec2D,
  v1: Vec2D,
  v2: Vec2D,
  scale: number
): Vec2D => {
  out[0] = v1[0] + v2[0] * scale;
  out[1] = v1[1] + v2[1] * scale;
  return out;
};

export const subtract = (out: Vec2D, v1: Vec2D, v2: Vec2D): Vec2D => {
  out[0] = v1[0] - v2[0];
  out[1] = v1[1] - v2[1];
  return out;
};

export const mul = (out: Vec2D, v: Vec2D, s: number): Vec2D => {
  out[0] = v[0] * s;
  out[1] = v[1] * s;
  return out;
};

export const div = (out: Vec2D, v: Vec2D, s: number): Vec2D => {
  const invS = 1 / s;
  out[0] = v[0] * invS;
  out[1] = v[1] * invS;
  return out;
};

export const norm = (out: Vec2D, v: Vec2D): Vec2D => {
  const magSq = v[0] * v[0] + v[1] * v[1];
  if (magSq > 1e-10) {
    const invMag = 1 / Math.sqrt(magSq);
    out[0] = v[0] * invMag;
    out[1] = v[1] * invMag;
  } else {
    out[0] = 0;
    out[1] = 0;
  }
  return out;
};

export const magnitudeSquared = (v: Vec2D): number => {
  return v[0] * v[0] + v[1] * v[1];
};

export const magnitude = (v: Vec2D): number => {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
};

export const distanceSquared = (v1: Vec2D, v2: Vec2D): number => {
  const dx = v1[0] - v2[0];
  const dy = v1[1] - v2[1];
  return dx * dx + dy * dy;
};

export const distance = (v1: Vec2D, v2: Vec2D): number => {
  return Math.sqrt(distanceSquared(v1, v2));
};

export const dot = (v1: Vec2D, v2: Vec2D): number => {
  return v1[0] * v2[0] + v1[1] * v2[1];
};
