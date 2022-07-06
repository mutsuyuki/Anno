import Vue from 'vue'
import {Mutation, Action, VuexModule, getModule, Module} from "vuex-module-decorators";
import store from "@/store";
import {Point, PointUtil} from "@/common/interface/Point";
import DeepCloner from "@/common/utils/DeepCloner";
import {AnimalBoneModel} from "@/common/model/AnimalBoneModel";
import {BoundingBoxModel} from "@/common/model/BoundingBoxModel";

// ----- interfaces -------------------------------
export interface Annotation {
  frame: string;
  objectId: string;
  behaviour_class: string;
  bounding: BoundingBoxModel;
  bone: AnimalBoneModel;
  neck_mark_bounding: BoundingBoxModel;
  neck_mark_class: string;
}


// ----- common function -------------------------------
function makeDefaultAnnotation(frame: string, objectId: string): Annotation {
  return {
    frame: frame,
    objectId: objectId,
    behaviour_class: "0",
    bounding: {
      left: 0.38,
      top: 0.38,
      width: 0.24,
      height: 0.24
    },
    bone: {
      mouse: {x: 0.4, y: 0.4},
      head: {x: 0.45, y: 0.4},
      cervical_spine: {x: 0.5, y: 0.4},
      left_shoulder: {x: 0.5, y: 0.45},
      left_elbow: {x: 0.5, y: 0.5},
      left_wrist: {x: 0.5, y: 0.55},
      left_finger: {x: 0.5, y: 0.6},
      right_shoulder: {x: 0.475, y: 0.45 * 0.95},
      right_elbow: {x: 0.475, y: 0.5 * 0.95},
      right_wrist: {x: 0.475, y: 0.55 * 0.95},
      right_finger: {x: 0.475, y: 0.6 * 0.95},
      pelvis: {x: 0.6, y: 0.4},
      left_waist: {x: 0.6, y: 0.45},
      left_knee: {x: 0.6, y: 0.5},
      left_heel: {x: 0.6, y: 0.55},
      left_toe: {x: 0.6, y: 0.6},
      right_waist: {x: 0.575, y: 0.45 * 0.95},
      right_knee: {x: 0.575, y: 0.5 * 0.95},
      right_heel: {x: 0.575, y: 0.55 * 0.95},
      right_toe: {x: 0.575, y: 0.6 * 0.95},
    },
    neck_mark_bounding: {
      left: -9999,
      top: -9999,
      width: 0.015 * 2,
      height: 0.015 * 2
    },
    neck_mark_class: ""
  }
}

function getNewestObjectId(annotations: { [frame: string]: { [objectId: string]: Annotation } }): string {
  const objectIds = Object.values(annotations).map(v => Object.keys(v)).flat();
  const objectIdsAsNumber = objectIds.map(v => Number(v));   // keyはnumber型なので本来いらないはずだけど、string型とみなされるので一応数値配列化
  const newestIdAsNumber = objectIdsAsNumber.length == 0 ? -1 : objectIdsAsNumber.reduce((a, b) => Math.max(a, b));

  return newestIdAsNumber.toString();
}


@Module({
  name: "AnnotationsStore_Track",
  dynamic: true,
  store: store,
  namespaced: true
})

class AnnotationsStore extends VuexModule {

  // states
  private _annotations: { [frame: string]: { [objectId: string]: Annotation } } = {};

  // getters
  get annotations() {
    return this._annotations;
  }

  get newestObjectId() {
    return getNewestObjectId(this._annotations);
  }


  @Mutation
  public setAnnotation(value: { [frame: string]: { [objectId: string]: Annotation } }) {
    this._annotations = value;
  }

  @Mutation
  public setAnnotationsOfFrame(value: { frame: string, data: { [objectId: string]: Annotation } }) {
    if (!this._annotations[value.frame])
      Vue.set(this._annotations, value.frame, {});

    Vue.set(
      this._annotations,
      value.frame,
      value.data
    );
  }

  @Mutation
  public create(frame: string) {
    if (!this._annotations[frame])
      Vue.set(this._annotations, frame, {});

    const newObjectId = (Number(getNewestObjectId(this._annotations)) + 1).toString();

    Vue.set(
      this._annotations[frame],
      newObjectId,
      makeDefaultAnnotation(frame, newObjectId)
    );
  }

  @Mutation
  public copyObject(value: { frame: string, objectId: string }) {
    if (!this._annotations[value.frame]) {
      alert("現在のフレームにはアノテーションがありません");
      return;
    }
    if (!this._annotations[value.frame][value.objectId]) {
      alert("アノテーションが選択されていません。");
      return;
    }

    const newObjectId = (Number(getNewestObjectId(this._annotations)) + 1).toString();
    let copiedAnnotation = DeepCloner.copy(this._annotations[value.frame][value.objectId]);
    copiedAnnotation.objectId = newObjectId;
    copiedAnnotation.bounding.left += 0.005;
    copiedAnnotation.bounding.top += 0.01;
    copiedAnnotation.bounding.width -= 0.0001;   // 小さいものが優先して選ばれるため、コピーしたやつを選ばれやすくする
    for (const jointName in copiedAnnotation.bone) {
      if ((<any>copiedAnnotation.bone)[jointName].x != -9999) {
        (<any>copiedAnnotation.bone)[jointName].x += 0.005;
        (<any>copiedAnnotation.bone)[jointName].y += 0.01;
      }
    }
    if (copiedAnnotation.neck_mark_bounding.left != -9999) {
      copiedAnnotation.neck_mark_bounding.left += 0.005;
      copiedAnnotation.neck_mark_bounding.top += 0.01;
    }

    Vue.set(
      this._annotations[value.frame],
      newObjectId,
      copiedAnnotation
    );
  }

  @Mutation
  public rebirthJoint(value: { frame: string, objectId: string }) {
    if (!this._annotations[value.frame]) {
      alert("現在のフレームにはアノテーションがありません");
      return;
    }
    if (!this._annotations[value.frame][value.objectId]) {
      alert("アノテーションが選択されていません。");
      return;
    }

    let targetAnnotation = this._annotations[value.frame][value.objectId];
    const targetBone = targetAnnotation.bone as any;
    const defaultBone = makeDefaultAnnotation("", "").bone as any;
    for (const jointName in targetAnnotation.bone) {
      const joint = targetBone[jointName];
      if (joint.x == -9999) {
        const mousePosition = targetAnnotation.bone["mouse"];
        const boundingPosition = {x: targetAnnotation.bounding.left, y: targetAnnotation.bounding.top};
        const basePosition = mousePosition.x != -9999 ? mousePosition : boundingPosition;
        const offsetFromMouse = PointUtil.minus(defaultBone[jointName], defaultBone["mouse"])
        const position = PointUtil.add(basePosition, offsetFromMouse);
        targetBone[jointName] = position;
      }
    }

    Vue.set(
      this._annotations[value.frame],
      value.objectId,
      targetAnnotation
    );
  }

  @Mutation
  public flipJoint(value: { frame: string, objectId: string }) {
    if (!this._annotations[value.frame]) {
      alert("現在のフレームにはアノテーションがありません");
      return;
    }
    if (!this._annotations[value.frame][value.objectId]) {
      alert("アノテーションが選択されていません。");
      return;
    }

    const targetAnnotation = this._annotations[value.frame][value.objectId];
    const targetBone = targetAnnotation.bone as any;
    let minX = Number.MAX_VALUE;
    let maxX = -Number.MAX_VALUE;
    for (const jointName in targetBone) {
      const joint = targetBone[jointName];
      if (joint.x != -9999) {
        minX = Math.min(minX, joint.x);
        maxX = Math.max(maxX, joint.x);
      }
    }

    for (const jointName in targetBone) {
      const beforeX = targetBone[jointName].x;
      const flippedX = minX + (maxX - beforeX);
      targetBone[jointName].x = flippedX;
    }

    Vue.set(
      this._annotations[value.frame],
      value.objectId,
      targetAnnotation
    );
  }


  @Mutation
  public createNeckMark(value: { frame: string, objectId: string }) {
    if (!this._annotations[value.frame]) {
      alert("現在のフレームにはアノテーションがありません");
      return;
    }

    let targetAnnotation = this._annotations[value.frame][value.objectId];
    if (!targetAnnotation) {
      alert("アノテーションが選択されていません。");
      return;
    }
    if (targetAnnotation.neck_mark_bounding && targetAnnotation.neck_mark_bounding.left != -9999) {
      alert("首装置のアノテーションは削除されていません");
      return;
    }

    if (targetAnnotation.bone.cervical_spine.x != -9999) {
      targetAnnotation.neck_mark_bounding = {
        left: targetAnnotation.bone.cervical_spine.x - 0.015,
        top: targetAnnotation.bone.cervical_spine.y - 0.015,
        width: 0.015 * 2,
        height: 0.015 * 2
      }
    } else {
      targetAnnotation.neck_mark_bounding = DeepCloner.copy(targetAnnotation.bounding);
      targetAnnotation.neck_mark_bounding.width = 0.015 * 2;
      targetAnnotation.neck_mark_bounding.height = 0.015 * 2;
    }
    targetAnnotation.neck_mark_class = "0";

    Vue.set(
      this._annotations[value.frame],
      value.objectId,
      targetAnnotation
    );
  }


  @Mutation
  public copyPrevFrameObjects(currentFrame: string) {
    const currentFrameAsNumber = Number(currentFrame);
    const allFrames = Object.keys(this._annotations);
    const prevFrames = allFrames.filter(v => {
      const frameAsNumber = Number(v)
      const objectNumInFrame = Object.keys(this._annotations[v]).length;
      return frameAsNumber < currentFrameAsNumber && objectNumInFrame > 0;
    });
    if (prevFrames.length <= 0) {
      alert("現在フレームより前にアノテーションがありません。");
      return;
    }

    prevFrames.sort((a, b) => {
      const aa = Number(a);
      const bb = Number(b);
      if (aa > bb) return 1;
      if (aa < bb) return -1;
      return 0;
    });

    const prevFrame = prevFrames[prevFrames.length - 1];
    if (!this._annotations[currentFrame])
      Vue.set(this._annotations, currentFrame, {});

    for (const objectId in this._annotations[prevFrame]) {
      let copiedAnnotation = DeepCloner.copy(this._annotations[prevFrame][objectId]);
      copiedAnnotation.frame = currentFrame;
      Vue.set(
        this._annotations[currentFrame],
        objectId,
        copiedAnnotation
      );
    }
  }

  @Mutation
  public setBehaviour(value: { frame: string, objectId: string, behaviour_class: string }) {
    Vue.set(
      this._annotations[value.frame][value.objectId],
      "behaviour_class",
      value.behaviour_class
    );
  }

  @Mutation
  public setBounding(value: { frame: string, objectId: string, bounding: BoundingBoxModel }) {
    Vue.set(
      this._annotations[value.frame][value.objectId],
      "bounding",
      DeepCloner.copy(value.bounding)
    );
  }

  @Mutation
  public setJointPosition(value: { frame: string, objectId: string, jointName: string, position: Point }) {
    const currentPosition = (<any>this._annotations[value.frame][value.objectId].bone)[value.jointName];
    if (currentPosition.x == -9999) {
      return;
    }

    Vue.set(
      this._annotations[value.frame][value.objectId].bone,
      value.jointName,
      DeepCloner.copy(value.position)
    );
  }

  @Mutation
  public moveJointPositions(value: { frame: string, objectId: string, moveAmount: Point }) {

    const movedBone = DeepCloner.copy(this._annotations[value.frame][value.objectId].bone) as any;
    for (const jointName in movedBone) {
      if (movedBone[jointName].x == -9999) {
        continue;
      }
      movedBone[jointName].x += value.moveAmount.x;
      movedBone[jointName].y += value.moveAmount.y;
    }

    Vue.set(
      this._annotations[value.frame][value.objectId],
      "bone",
      movedBone
    );
  }

  @Mutation
  public setNeckMarkBounding(value: { frame: string, objectId: string, neck_mark_bounding: BoundingBoxModel }) {
    Vue.set(
      this._annotations[value.frame][value.objectId],
      "neck_mark_bounding",
      DeepCloner.copy(value.neck_mark_bounding)
    );
  }

  @Mutation
  public moveNeckMarkBounding(value: { frame: string, objectId: string, moveAmount: Point }) {
    if (this._annotations[value.frame][value.objectId].neck_mark_bounding.left == -9999)
      return

    this._annotations[value.frame][value.objectId].neck_mark_bounding.left += value.moveAmount.x;
    this._annotations[value.frame][value.objectId].neck_mark_bounding.top += value.moveAmount.y;
  }

  @Mutation
  public setNeckMarkClass(value: { frame: string, objectId: string, neck_mark_class: string }) {
    Vue.set(
      this._annotations[value.frame][value.objectId],
      "neck_mark_class",
      value.neck_mark_class
    );
  }

  @Mutation
  public deleteObject(value: { frame: string, objectId: string }) {
    Vue.delete(
      this._annotations[value.frame],
      value.objectId
    );

    if (Object.keys(this._annotations[value.frame]).length <= 0) {
      Vue.delete(
        this._annotations,
        value.frame
      );
    }
  }


  @Mutation
  public deleteJoint(value: { frame: string, objectId: string, jointName: string }) {
    Vue.set(
      this._annotations[value.frame][value.objectId].bone,
      value.jointName,
      {x: -9999, y: -9999}
    );
  }


  @Mutation
  public deleteNeckMark(value: { frame: string, objectId: string }) {
    Vue.set(
      this._annotations[value.frame][value.objectId],
      "neck_mark_bounding",
      {left: -9999, top: -9999, width: 0.015 * 2, height: 0.015 * 2}
    );
  }

  @Mutation
  public clear() {
    this._annotations = {};
  }
}

export default getModule(AnnotationsStore);
