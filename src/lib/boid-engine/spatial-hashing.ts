import { type Boid } from "./types";

export class SpatialHashGrid {
  private cellSize: number;
  private invCellSize: number;
  private grid: Map<number, Boid[]>;

  constructor(cellSize: number) {
    this.cellSize = cellSize;
    this.invCellSize = 1 / cellSize;
    this.grid = new Map();
  }

  private getKey(x: number, y: number): number {
    const cellX = Math.floor(x * this.invCellSize);
    const cellY = Math.floor(y * this.invCellSize);
    return (cellX << 16) | (cellY & 0xffff);
  }

  insert(boid: Boid): void {
    const key = this.getKey(boid.vec.pos[0], boid.vec.pos[1]);
    let cell = this.grid.get(key);
    if (!cell) {
      cell = [];
      this.grid.set(key, cell);
    }
    cell.push(boid);
  }

  query(x: number, y: number, radius: number): Boid[] {
    const minX = Math.floor((x - radius) * this.invCellSize);
    const maxX = Math.floor((x + radius) * this.invCellSize);
    const minY = Math.floor((y - radius) * this.invCellSize);
    const maxY = Math.floor((y + radius) * this.invCellSize);
    const result: Boid[] = [];

    for (let cellX = minX; cellX <= maxX; cellX++) {
      for (let cellY = minY; cellY <= maxY; cellY++) {
        const key = (cellX << 16) | (cellY & 0xffff);
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
