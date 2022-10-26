import {MovingPoint, Point, PointUtil} from "@/common/interface/Point";
import {PolygonByObjectId, PolygonModel} from "@/common/model/PolygonModel";
import DeepCloner from "@/common/utils/DeepCloner";

export interface PolygonSearchResult {
  objectId: string,
  pointIndex: number,
  distance: number
}

export default class PolygonInteraction {
  private dragTarget = this.getInitialSearchResult();

  private getInitialSearchResult(): PolygonSearchResult {
    return {
      objectId: "",
      pointIndex: -1,
      distance: Number.MAX_VALUE
    };
  }

  public dragStart(position: MovingPoint, polygonModels: PolygonByObjectId): PolygonSearchResult {
    // 点を探す
    const searchResult = this.searchNearest(position, polygonModels);
    this.dragTarget = DeepCloner.copy(searchResult);
    return searchResult;
  }

  public drag(position: MovingPoint, polygonModels: PolygonByObjectId, isDragEntire = false):[PolygonSearchResult, PolygonModel] {
    if (!this.isEnableDrag(polygonModels)) {
      return [this.getInitialSearchResult(), {} as PolygonModel];
    }

    let editedPolygon = DeepCloner.copy(polygonModels[this.dragTarget.objectId]);
    if (isDragEntire) {
      for (let i = 0; i < editedPolygon.points.length; i++) {
        editedPolygon.points[i].x += position.deltaX;
        editedPolygon.points[i].y += position.deltaY;
      }
    } else {
      editedPolygon.points[this.dragTarget.pointIndex].x += position.deltaX;
      editedPolygon.points[this.dragTarget.pointIndex].y += position.deltaY;
    }
    return [DeepCloner.copy(this.dragTarget), editedPolygon];
  }

  public dragEnd() {
    const dragTarget = DeepCloner.copy(this.dragTarget);
    this.cancel();
    return dragTarget;
  }

  public cancel() {
    this.dragTarget = this.getInitialSearchResult();
  }

  public searchNearest(searchPosition: Point, polygonModels: PolygonByObjectId): PolygonSearchResult {
    let nearestObjectId: string = "";
    let nearestPointIndex: number = -1;
    let nearestDistance = Number.MAX_VALUE;
    const thresh = 0.05;

    for (const objectId in polygonModels) {
      for (let i = 0; i < polygonModels[objectId].points.length; i++) {
        const point = polygonModels[objectId].points[i];
        const distance = PointUtil.distance(point, searchPosition);
        if (distance > thresh) {
          continue;
        }

        if (distance > nearestDistance) {
          continue;
        }

        nearestObjectId = objectId;
        nearestPointIndex = i;
        nearestDistance = distance;
      }
    }

    return {
      objectId: nearestObjectId,
      pointIndex: nearestPointIndex,
      distance: nearestDistance
    };
  }

  private isEnableDrag(polygonModels: PolygonByObjectId) {
    const selectingObject = polygonModels[this.dragTarget.objectId];
    if (!selectingObject)
      return false;

    const selectingPoint = selectingObject.points[this.dragTarget.pointIndex];
    if (!selectingPoint)
      return false;

    return true;
  }
}
