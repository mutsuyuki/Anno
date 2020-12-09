export interface Point {
  x: number;
  y: number;
}

export interface PointAndScale extends Point {
  scale: number;
}

export interface MovingPoint {
  x: number;
  y: number;
  startX: number;
  startY: number;
  deltaX: number;
  deltaY: number;
}

export module PointUtil {
  export function normalize(point: Point) {
    const length = PointUtil.length(point);
    return {
      x: point.x / length,
      y: point.y / length,
    }
  }

  export function length(point: Point) {
    return Math.sqrt(point.x ** 2 + point.y ** 2);
  }

  export function add(point1: Point, point2: Point) {
    return {
      x: point1.x + point2.x,
      y: point1.y + point2.y
    }
  }

  export function minus(point1: Point, point2: Point) {
    return {
      x: point1.x - point2.x,
      y: point1.y - point2.y
    }
  }

  export function multiply(point: Point, scale: number) {
    return {
      x: point.x * scale,
      y: point.y * scale
    }
  }

  export function distance(point1: Point, point2: Point) {
    return ((point2.x - point1.x) ** 2 + (point2.y - point1.y) ** 2) ** 0.5;
  }


}

