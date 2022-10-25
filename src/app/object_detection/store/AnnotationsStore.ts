import Vue from 'vue'
import {Mutation, Action, VuexModule, getModule, Module} from "vuex-module-decorators";
import store from "@/store";
import DeepCloner from "@/common/utils/DeepCloner";
import {BoundingBoxModel} from "@/common/model/BoundingBoxModel";

export interface Annotation {
  frame: string;
  objectId: string;
  class: string;
  bounding: BoundingBoxModel;
}
export type AnnotationByObjectId = { [objectId: string]: Annotation };
export type AnnotationsByFrameId = { [frameId: string]: AnnotationByObjectId };


function getAnnotationRecord(frame: string, objectId: string): Annotation {
  return {
    frame: frame,
    objectId: objectId,
    class: "0",
    bounding: {
      left: 0.38,
      top: 0.38,
      width: 0.24,
      height: 0.24
    }
  }
}

function getNewestObjectId(annotations: AnnotationsByFrameId): string {
  const objectIds = Object.values(annotations).map(v => Object.keys(v)).flat();
  const objectIdsAsNumber = objectIds.map(v => Number(v));   // keyはnumber型なので本来いらないはずだけど、string型とみなされるので一応数値配列化
  const newestIdAsNumber = objectIdsAsNumber.length == 0 ? -1 : objectIdsAsNumber.reduce((a, b) => Math.max(a, b));
  return newestIdAsNumber.toString();
}


@Module({
  name: "AnnotationsStore_" + Math.random().toString(),
  dynamic: true,
  store: store,
  namespaced: true
})

class AnnotationsStore extends VuexModule {

  // states
  private _annotations: AnnotationsByFrameId = {};

  // getters
  get annotations() {
    return this._annotations;
  }

  get newestObjectId() {
    return getNewestObjectId(this._annotations);
  }

  @Mutation
  public setAnnotation(value: AnnotationsByFrameId) {
    this._annotations = value;
  }

  @Mutation
  public setAnnotationsOfFrame(value: { frame: string, data: AnnotationByObjectId }) {
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
      getAnnotationRecord(frame, newObjectId)
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

    Vue.set(
      this._annotations[value.frame],
      newObjectId,
      copiedAnnotation
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
  public setClass(value: { frame: string, objectId: string, class: string }) {
    Vue.set(
      this._annotations[value.frame][value.objectId],
      "class",
      value.class
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
  public clear() {
    this._annotations = {};
  }
}

export default getModule(AnnotationsStore);

