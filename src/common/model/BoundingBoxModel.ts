export interface BoundingBoxModel {
  left: number,
  top: number
  width: number,
  height: number
}

export type BoundingBoxByObjectId = { [objectId: string]: BoundingBoxModel }
