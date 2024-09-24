import type { BoidAttrs } from "./boid-engine/types";

export type Species = Partial<BoidAttrs> & { name: string };

export const Default = {
  mass: 0.28,
  targetV: 110,
  maxV: 500,
  targetVCorrectionFactor: 1,
  sightRadius: 200,
  sightPeripheralDeg: 200,
  separationDistance: 50,
  separationFactor: 0.81,
  gravitationFactor: 1.1,
  alignmentFactor: 0.1,
  forceSmoothing: 7,
  color: "hsl(0, 100%, 50%)",
};

export const BlueTab = {
  mass: 0.09,
  targetV: 44.9,
  targetVCorrectionFactor: 0.55,
  sightRadius: 193,
  sightPeripheralDeg: 226.9,
  separationDistance: 76.5,
  separationFactor: 1.18,
  gravitationFactor: 0.698,
  alignmentFactor: 0.06,
  forceSmoothing: 5,
  color: "hsl(186, 100%, 50%)",
};

export const YellowTab = {
  mass: 0.12,
  targetV: 231.15880089106227,
  targetVCorrectionFactor: 0.19689021075000974,
  sightRadius: 194.2936519463015,
  sightPeripheralDeg: 230.98374277602662,
  separationDistance: 114.00033520853967,
  separationFactor: 0.5,
  gravitationFactor: 0.1,
  alignmentFactor: 0.20899640225715527,
  forceSmoothing: 13.012096064627173,
  color: "hsl(290, 100%, 50%)",
};

export const OrangeTab = {
  name: "SlowArrows",
  mass: 0.7,
  targetV: 5,
  targetVCorrectionFactor: 1.4,
  sightRadius: 80,
  sightPeripheralDeg: 300,
  separationDistance: 200,
  separationFactor: 0.1,
  gravitationFactor: 1.5,
  alignmentFactor: 0.6,
  forceSmoothing: 5,
  color: "hsl(64, 100%, 50%)",
};

/**
 * Slow moving, high gravitation boids that carry much intertia
 */
export const GrouperSpecies1 = {
  name: "GrouperSpecies1",
  mass: 0.08,
  targetV: 5,
  targetVCorrectionFactor: 0.01,
  sightRadius: 50,
  sightPeripheralDeg: 360,
  separationDistance: 10,
  separationFactor: 0.1,
  gravitationFactor: 2,
  alignmentFactor: 0.05,
  forceSmoothing: 20,
  color: "hsl(127.53137947896208, 100%, 50%)",
};

export const LilBuggers = {
  name: "LilBuggers",
  mass: 0.08,
  targetV: 5,
  targetVCorrectionFactor: 5,
  sightRadius: 85.74437378731018,
  sightPeripheralDeg: 130,
  separationDistance: 200,
  separationFactor: 2,
  gravitationFactor: 0.1,
  alignmentFactor: 0.5,
  forceSmoothing: 20,
  color: "hsl(85.1684347148621, 100%, 50%)",
};

export const BlueAngels = {
  name: "BlueAngels",
  mass: 0.08,
  targetV: 300,
  targetVCorrectionFactor: 0.01,
  sightRadius: 50,
  sightPeripheralDeg: 130,
  separationDistance: 10,
  separationFactor: 0.1,
  gravitationFactor: 0.1,
  alignmentFactor: 0.5,
  forceSmoothing: 20,
  color: "hsl(208, 100%, 50%)",
};

export const Juggernauts = {
  name: "Juggernauts",
  mass: 0.8336308612212452,
  targetV: 248.12441492222493,
  targetVCorrectionFactor: 0.39702938154480266,
  sightRadius: 181.04091375795372,
  sightPeripheralDeg: 143.64686510292444,
  separationDistance: 86.3372226830577,
  separationFactor: 0.4061173962322797,
  gravitationFactor: 0.46736636981965757,
  alignmentFactor: 0.18187617700290507,
  forceSmoothing: 31.14850873946981,
  color: "hsl(30.151485712160751, 100%, 50%)",
};

export const AtomBoid = {
  name: "AtomBoid",
  mass: 0.08,
  targetV: 5,
  targetVCorrectionFactor: 0.3476252575658127,
  sightRadius: 196.6367335331217,
  sightPeripheralDeg: 218.38755725985425,
  separationDistance: 67.8248306069898,
  separationFactor: 1.442214435613763,
  gravitationFactor: 0.79,
  alignmentFactor: 0.5,
  forceSmoothing: 0,
  color: "hsl(109.55667502775175, 100%, 50%)",
};

export const Cell1 = {
  mass: 0.08,
  targetV: 18.430047350664253,
  targetVCorrectionFactor: 0.4671881345547293,
  sightRadius: 219.9640427583061,
  sightPeripheralDeg: 280.0816273540343,
  separationDistance: 53.8068676524656,
  separationFactor: 1.086031446291552,
  gravitationFactor: 0.6015766108917963,
  alignmentFactor: 0.43369545896153483,
  forceSmoothing: 8.694142930253356,
  color: "hsl(240.00988689961622, 100%, 50%)",
};

export const BoidSpecies: Species[] = [
  Juggernauts,
  BlueAngels,
  LilBuggers,
  GrouperSpecies1,
  AtomBoid,
];
