import { type Boid } from "./types";

export class SpatialHashGrid {
  private cellSize: number;
  private grid: Map<string, Boid[]>;

  constructor(cellSize: number) {
    this.cellSize = cellSize;
    this.grid = new Map();
  }

  private getKey(x: number, y: number): string {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    return `${cellX},${cellY}`;
  }

  insert(boid: Boid): void {
    const key = this.getKey(boid.vec.pos[0], boid.vec.pos[1]);
    if (!this.grid.has(key)) {
      this.grid.set(key, []);
    }
    this.grid.get(key)!.push(boid);
  }

  query(x: number, y: number, radius: number): Boid[] {
    const minX = Math.floor((x - radius) / this.cellSize);
    const maxX = Math.floor((x + radius) / this.cellSize);
    const minY = Math.floor((y - radius) / this.cellSize);
    const maxY = Math.floor((y + radius) / this.cellSize);

    const result: Boid[] = [];
    for (let cellX = minX; cellX <= maxX; cellX++) {
      for (let cellY = minY; cellY <= maxY; cellY++) {
        const key = `${cellX},${cellY}`;
        const cell = this.grid.get(key);
        if (cell) {
          result.push(...cell);
        }
      }
    }
    return result;
  }

  clear(): void {
    this.grid.clear();
  }
}
