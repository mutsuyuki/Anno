import {Point} from "@/common/interface/Point";

export interface BoundingBoxModel {
  left: number,
  top: number
  width: number,
  height: number
}

export type BoundingBoxByObjectId = { [objectId: string]: BoundingBoxModel }


export module BoundingBoxUtil {
  export function right(bounding: BoundingBoxModel): number {
    return bounding.left + bounding.width;
  }

  export function bottom(bounding: BoundingBoxModel): number {
    return bounding.top + bounding.height;
  }

  export function center(bounding: BoundingBoxModel): Point {
    return {
      x: bounding.left + bounding.width / 2,
      y: bounding.top + bounding.height / 2
    }
  }

  export function lerpX(bounding: BoundingBoxModel, rate: number): number {
    return bounding.left + bounding.width * rate;
  }

  export function lerpY(bounding: BoundingBoxModel, rate: number): number {
    return bounding.top + bounding.height * rate;
  }
}

