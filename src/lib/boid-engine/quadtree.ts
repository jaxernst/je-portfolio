import { type Boid } from "./types";

export class QuadTree {
  boundary: { x: number; y: number; width: number; height: number };
  capacity: number;
  boids: Boid[];
  divided: boolean;
  northwest?: QuadTree;
  northeast?: QuadTree;
  southwest?: QuadTree;
  southeast?: QuadTree;

  constructor(
    boundary: { x: number; y: number; width: number; height: number },
    capacity: number
  ) {
    this.boundary = boundary;
    this.capacity = capacity;
    this.boids = [];
    this.divided = false;
  }

  subdivide() {
    const x = this.boundary.x;
    const y = this.boundary.y;
    const w = this.boundary.width / 2;
    const h = this.boundary.height / 2;

    this.northwest = new QuadTree(
      { x: x, y: y, width: w, height: h },
      this.capacity
    );
    this.northeast = new QuadTree(
      { x: x + w, y: y, width: w, height: h },
      this.capacity
    );
    this.southwest = new QuadTree(
      { x: x, y: y + h, width: w, height: h },
      this.capacity
    );
    this.southeast = new QuadTree(
      { x: x + w, y: y + h, width: w, height: h },
      this.capacity
    );

    this.divided = true;
  }

  insert(boid: Boid): boolean {
    if (!this.contains(boid)) {
      return false;
    }

    if (this.boids.length < this.capacity) {
      this.boids.push(boid);
      return true;
    }

    if (!this.divided) {
      this.subdivide();
    }

    return (
      this.northwest!.insert(boid) ||
      this.northeast!.insert(boid) ||
      this.southwest!.insert(boid) ||
      this.southeast!.insert(boid)
    );
  }

  query(
    range: { x: number; y: number; width: number; height: number },
    found: Boid[] = []
  ): Boid[] {
    if (!this.intersects(range)) {
      return found;
    }

    for (const boid of this.boids) {
      if (this.contains(boid, range)) {
        found.push(boid);
      }
    }

    if (this.divided) {
      this.northwest!.query(range, found);
      this.northeast!.query(range, found);
      this.southwest!.query(range, found);
      this.southeast!.query(range, found);
    }

    return found;
  }

  contains(boid: Boid, range = this.boundary): boolean {
    return (
      boid.vec.pos[0] >= range.x &&
      boid.vec.pos[0] < range.x + range.width &&
      boid.vec.pos[1] >= range.y &&
      boid.vec.pos[1] < range.y + range.height
    );
  }

  intersects(range: {
    x: number;
    y: number;
    width: number;
    height: number;
  }): boolean {
    return !(
      range.x > this.boundary.x + this.boundary.width ||
      range.x + range.width < this.boundary.x ||
      range.y > this.boundary.y + this.boundary.height ||
      range.y + range.height < this.boundary.y
    );
  }

  clear() {
    this.boids = [];
    if (this.divided) {
      this.northwest = undefined;
      this.northeast = undefined;
      this.southwest = undefined;
      this.southeast = undefined;
      this.divided = false;
    }
  }

  update(boids: Boid[]) {
    this.clear();
    for (const boid of boids) {
      this.insert(boid);
    }
  }
}
