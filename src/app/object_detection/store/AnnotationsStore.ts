import Vue from 'vue'
import {Mutation, Action, VuexModule, getModule, Module} from "vuex-module-decorators";
import store from "@/store";
import DeepCloner from "@/common/utils/DeepCloner";

export interface Annotation {
  frame: string;
  objectId: string;
  class: string;
  bounding: Bounding;
}

export interface Bounding {
  left: number,
  top: number
  width: number,
  height: number
}

@Module({
  name: "AnnotationsStore_" + Math.random().toString(),
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
      makeAnnotationInstance(frame, newObjectId)
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
  public setClass(value: { frame: string, objectId: string, class: string }) {
    Vue.set(
      this._annotations[value.frame][value.objectId],
      "class",
      value.class
    );
  }

  @Mutation
  public setBounding(value: { frame: string, objectId: string, bounding: Bounding }) {
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


function makeAnnotationInstance(frame: string, objectId: string): Annotation {
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

function getNewestObjectId(annotations: { [frame: string]: { [objectId: string]: Annotation } }): string {
  const objectIds = Object.values(annotations).map(v => Object.keys(v)).flat();
  const objectIdsAsNumber = objectIds.map(v => Number(v));   // keyはnumber型なので本来いらないはずだけど、string型とみなされるので一応数値配列化
  const newestIdAsNumber = objectIdsAsNumber.length == 0 ? -1 : objectIdsAsNumber.reduce((a, b) => Math.max(a, b));
  return newestIdAsNumber.toString();
}