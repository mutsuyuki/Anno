import Vue from 'vue'
import {Mutation, Action, VuexModule, getModule, Module} from "vuex-module-decorators";
import store from "@/store";
import DeepCloner from "@/common/utils/DeepCloner";
import {Point} from "@/common/interface/Point";

export interface Annotation {
  start: Point;
  end: Point;
  width: number;
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
  public create(frame: string, annotation: Annotation) {
    if (!this._annotations[frame])
      Vue.set(this._annotations, frame, {});

    const newObjectId = (Number(getNewestObjectId(this._annotations)) + 1).toString();

    Vue.set(
      this._annotations[frame],
      newObjectId,
      annotation
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
    copiedAnnotation.start.x += 0.005;
    copiedAnnotation.end.x += 0.005;

    Vue.set(
      this._annotations[value.frame],
      newObjectId,
      copiedAnnotation
    );
  }

  @Mutation
  public setStart(value: { frame: string, objectId: string, start: Point }) {
    Vue.set(
      this._annotations[value.frame][value.objectId],
      "start",
      DeepCloner.copy(value.start)
    );
  }

  @Mutation
  public setEnd(value: { frame: string, objectId: string, end: Point }) {
    Vue.set(
      this._annotations[value.frame][value.objectId],
      "end",
      DeepCloner.copy(value.end)
    );
  }

  @Mutation
  public setWidth(value: { frame: string, objectId: string, width: number }) {
    Vue.set(
      this._annotations[value.frame][value.objectId],
      "width",
      value.width
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


function getNewestObjectId(annotations: { [frame: string]: { [objectId: string]: Annotation } }): string {
  const objectIds = Object.values(annotations).map(v => Object.keys(v)).flat();
  const objectIdsAsNumber = objectIds.map(v => Number(v));   // keyはnumber型なので本来いらないはずだけど、string型とみなされるので一応数値配列化
  const newestIdAsNumber = objectIdsAsNumber.length == 0 ? -1 : objectIdsAsNumber.reduce((a, b) => Math.max(a, b));
  return newestIdAsNumber.toString();
}
