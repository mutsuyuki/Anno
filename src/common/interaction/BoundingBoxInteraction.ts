import {MovingPoint, Point, PointUtil} from "@/common/interface/Point";
import DeepCloner from "@/common/utils/DeepCloner";
import {BoundingBoxByObjectId, BoundingBoxModel} from "@/common/model/BoundingBoxModel";

export default class BoundingBoxInteraction {
  private selectingObjectId: string = "";
  private selectingEdge = {top: false, right: false, bottom: false, left: false, isResize: false};


  public dragStart(position: MovingPoint, boundingBoxModels: { [objectId: string]: BoundingBoxModel }): string {
    const clickedBounding = this.searchBounding(position, boundingBoxModels);
    this.selectingObjectId = clickedBounding.objectId;
    this.selectingEdge = clickedBounding.selectingEdge;

    return this.selectingObjectId;
  }

  public drag(position: MovingPoint, boundingBoxModels: BoundingBoxByObjectId): [string, BoundingBoxModel] {
    if (!boundingBoxModels[this.selectingObjectId]) {
      return ["", {} as BoundingBoxModel];
    }

    let editedBoundingBox = DeepCloner.copy(boundingBoxModels[this.selectingObjectId]);

    if (this.selectingEdge.isResize) {
      // 端のドラッグは矩形の拡大縮小
      if (this.selectingEdge.left) {
        editedBoundingBox.left += position.deltaX;
        editedBoundingBox.width -= position.deltaX;
      }
      if (this.selectingEdge.right) {
        editedBoundingBox.width += position.deltaX;
      }
      if (this.selectingEdge.top) {
        editedBoundingBox.top += position.deltaY;
        editedBoundingBox.height -= position.deltaY;
      }
      if (this.selectingEdge.bottom) {
        editedBoundingBox.height += position.deltaY;
      }
    } else {
      // 中心部ドラッグは移動
      editedBoundingBox.top += position.deltaY;
      editedBoundingBox.left += position.deltaX;
    }
    return [this.selectingObjectId, editedBoundingBox]
  }

  public dragEnd() {
    this.clear();
  }

  public hover(position: Point, boundingBoxModels: { [objectId: string]: BoundingBoxModel }) {
    // todo 選択中の線の強調
  }

  public delete(position: MovingPoint, boundingBoxModels: { [objectId: string]: BoundingBoxModel }): string {
    const clickedBounding = this.searchBounding(position, boundingBoxModels);
    const objectId = clickedBounding.objectId;
    return objectId;
  }

  public clear() {
    this.selectingObjectId = "";
    this.selectingEdge = {top: false, right: false, bottom: false, left: false, isResize: false};
  }

  private searchBounding(position: Point, boundingBoxModels: { [objectId: string]: BoundingBoxModel }) {
    let smallestArea = Number.MAX_VALUE;
    let smallestObjectId: string = "";
    let selectingEdge = {top: false, right: false, bottom: false, left: false, isResize: false};
    const edgeWidth = 0.02;

    for (const objectId in boundingBoxModels) {
      const boundingBoxModel = boundingBoxModels[objectId];
      const x = position.x;
      const y = position.y;
      const insideHorizontal = (boundingBoxModel.left - edgeWidth < x) && (x < boundingBoxModel.left + boundingBoxModel.width + edgeWidth);
      const insideVertical = (boundingBoxModel.top - edgeWidth < y) && (y < boundingBoxModel.top + boundingBoxModel.height + edgeWidth);
      const area = boundingBoxModel.width * boundingBoxModel.height;
      if (insideHorizontal && insideVertical && area < smallestArea) {
        smallestObjectId = objectId;

        if (Math.abs(boundingBoxModel.left - x) <= edgeWidth) {
          selectingEdge.left = true;
          selectingEdge.isResize = true;
        }
        if (Math.abs(boundingBoxModel.left + boundingBoxModel.width - x) <= edgeWidth) {
          selectingEdge.right = true;
          selectingEdge.isResize = true;
        }
        if (Math.abs(boundingBoxModel.top - y) <= edgeWidth) {
          selectingEdge.top = true;
          selectingEdge.isResize = true;
        }
        if (Math.abs(boundingBoxModel.top + boundingBoxModel.height - y) <= edgeWidth) {
          selectingEdge.bottom = true;
          selectingEdge.isResize = true;
        }
      }
    }

    return {objectId: smallestObjectId, selectingEdge: selectingEdge};
  }

}

