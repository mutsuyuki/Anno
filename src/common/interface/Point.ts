// --- Point ------------------------------

export interface Point {
  x: number;
  y: number;
}

export module PointUtil {
  export function normalize(point: Point): Point {
    const length = PointUtil.length(point);
    return {
      x: point.x / length,
      y: point.y / length,
    }
  }

  export function length(point: Point): number {
    return Math.sqrt(point.x ** 2 + point.y ** 2);
  }

  export function add(point1: Point, point2: Point): Point {
    return {
      x: point1.x + point2.x,
      y: point1.y + point2.y
    }
  }

  export function minus(point1: Point, point2: Point): Point {
    return {
      x: point1.x - point2.x,
      y: point1.y - point2.y
    }
  }

  export function multiply(point: Point, scale: number): Point {
    return {
      x: point.x * scale,
      y: point.y * scale
    }
  }

  export function distance(point1: Point, point2: Point): number {
    return ((point2.x - point1.x) ** 2 + (point2.y - point1.y) ** 2) ** 0.5;
  }


  export function zero(): Point {
    return {x: 0, y: 0}
  }
}


// --- MovingPoint ------------------------------

export interface MovingPoint extends Point {
  startX: number;
  startY: number;
  deltaX: number;
  deltaY: number;
}

export module MovingPointUtil {
  export function zero(): MovingPoint {
    return {x: 0, y: 0, startX: 0, startY: 0, deltaX: 0, deltaY: 0}
  }
}

export interface PointAndScale extends Point {
  scale: number;
}