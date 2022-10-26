import {MovingPoint, Point, PointUtil} from "@/common/interface/Point";
import DeepCloner from "@/common/utils/DeepCloner";
import {BoundingBoxByObjectId, BoundingBoxModel, BoundingBoxUtil} from "@/common/model/BoundingBoxModel";

export type SelectingEdge = { top: boolean, right: boolean, bottom: boolean, left: boolean, isResize: boolean }

export interface BoundingBoxSearchResult {
  objectId: string,
  selectingEdge: SelectingEdge,
  distance: number
}

export default class BoundingBoxInteraction {
  private dragTarget = this.getInitialSearchResult();

  private getInitialSearchResult(): BoundingBoxSearchResult {
    return {
      objectId: "",
      selectingEdge: this.getInitialSelectingEdge(),
      distance: Number.MAX_VALUE
    };
  }

  private getInitialSelectingEdge(): SelectingEdge {
    return {top: false, right: false, bottom: false, left: false, isResize: false};
  }

  public dragStart(position: MovingPoint, boundingBoxModels: BoundingBoxByObjectId): BoundingBoxSearchResult {
    const searchResult = this.searchNearest(position, boundingBoxModels);
    this.dragTarget = DeepCloner.copy(searchResult);
    return searchResult;
  }

  public drag(position: MovingPoint, boundingBoxModels: BoundingBoxByObjectId): [BoundingBoxSearchResult, BoundingBoxModel] {
    if (!boundingBoxModels[this.dragTarget.objectId]) {
      return [this.getInitialSearchResult(), {} as BoundingBoxModel];
    }

    let editedBoundingBox = DeepCloner.copy(boundingBoxModels[this.dragTarget.objectId]);

    if (this.dragTarget.selectingEdge.isResize) {
      // 端のドラッグは矩形の拡大縮小
      if (this.dragTarget.selectingEdge.left) {
        editedBoundingBox.left += position.deltaX;
        editedBoundingBox.width -= position.deltaX;
      }
      if (this.dragTarget.selectingEdge.right) {
        editedBoundingBox.width += position.deltaX;
      }
      if (this.dragTarget.selectingEdge.top) {
        editedBoundingBox.top += position.deltaY;
        editedBoundingBox.height -= position.deltaY;
      }
      if (this.dragTarget.selectingEdge.bottom) {
        editedBoundingBox.height += position.deltaY;
      }
    } else {
      // 中心部ドラッグは移動
      editedBoundingBox.top += position.deltaY;
      editedBoundingBox.left += position.deltaX;
    }
    return [DeepCloner.copy(this.dragTarget), editedBoundingBox]
  }

  public dragEnd() {
    const dragTarget = DeepCloner.copy(this.dragTarget);
    this.cancel();
    return dragTarget;
  }

  public cancel() {
    this.dragTarget = this.getInitialSearchResult();
  }

  public searchNearest(position: Point, boundingBoxModels: BoundingBoxByObjectId): BoundingBoxSearchResult {
    let nearestObjectId: string = "";
    let nearestDistance = Number.MAX_VALUE;
    let selectingEdge = this.getInitialSelectingEdge()
    const thresh = 0.02;

    for (const objectId in boundingBoxModels) {
      const bounding = boundingBoxModels[objectId];
      const x = position.x;
      const y = position.y;

      const insideHorizontal = (bounding.left - thresh < x) && (x < BoundingBoxUtil.right(bounding) + thresh);
      const insideVertical = (bounding.top - thresh < y) && (y < BoundingBoxUtil.bottom(bounding) + thresh);
      const isInside = insideHorizontal && insideVertical;

      if (!isInside) {
        continue;
      }

      const distanceToTop = Math.abs(y - bounding.top);
      const distanceToRight = Math.abs(x - BoundingBoxUtil.right(bounding));
      const distanceToBottom = Math.abs(y - BoundingBoxUtil.bottom(bounding));
      const distanceToLeft = Math.abs(x - bounding.left);
      const distanceToCenter = PointUtil.distance(position, BoundingBoxUtil.center(bounding));
      const distance = Math.min(distanceToTop, distanceToRight, distanceToBottom, distanceToLeft, distanceToCenter);

      if (distance > nearestDistance) {
        continue;
      }

      nearestObjectId = objectId;
      nearestDistance = distance;

      if (distanceToCenter == distance) {
        selectingEdge.isResize = false;
      } else {
        selectingEdge.isResize = true;
        if (Math.abs(distanceToTop - distance) < thresh)
          selectingEdge.top = true;
        if (Math.abs(distanceToRight - distance) < thresh)
          selectingEdge.right = true;
        if (Math.abs(distanceToBottom - distance) < thresh)
          selectingEdge.bottom = true;
        if (Math.abs(distanceToLeft - distance) < thresh)
          selectingEdge.left = true;
      }
    }

    return {
      objectId: nearestObjectId,
      selectingEdge: selectingEdge,
      distance: nearestDistance
    };
  }

}

