import {Point} from "@/common/interface/Point";

export interface PolygonModel {
  points: Point[];
}

export type PolygonByObjectId = { [objectId: string]: PolygonModel }
