import Vue from 'vue'
import {Mutation, Action, VuexModule, getModule, Module} from "vuex-module-decorators";
import store from "@/store/index";

export interface OperationOfFrame {
  isDirty: boolean
  isUseAnnotationFile: boolean;
  isDownloaded: boolean;
}


@Module({
  name: "OperationOfFramesStore",
  dynamic: true,
  store: store,
  namespaced: true
})

class OperationOfFramesStore extends VuexModule {

  // states
  private _operations: { [frame: string]: OperationOfFrame } = {};

  // getters
  get operations(): { [frame: string]: OperationOfFrame } {
    return this._operations;
  }

  @Mutation
  public createIfNothing(frame: string) {
    if (this._operations[frame])
      return;

    Vue.set(
      this._operations,
      frame,
      {
        isDirty: false,
        isUseAnnotationFile: false,
        isDownloaded: false,
      }
    );
  }

  @Mutation
  public setOperations(value: { [frame: string]: OperationOfFrame }) {
    this._operations = value;
  }

  @Mutation
  public setIsDirty(value: { frame: string, isDirty: boolean }) {
    if (!this._operations[value.frame])
      Vue.set(this._operations, value.frame, {});

    Vue.set(this._operations[value.frame], "isDirty", value.isDirty)
  }

  @Mutation
  public setIsUseAnnotationFile(value: { frame: string, isUseAnnotationFile: boolean }) {
    if (!this._operations[value.frame])
      Vue.set(this._operations, value.frame, {});

    Vue.set(this._operations[value.frame], "isUseAnnotationFile", value.isUseAnnotationFile);
  }

  @Mutation
  public setIsDownloaded(value: { frame: string, isDownloaded: boolean }) {
    if (!this._operations[value.frame])
      Vue.set(this._operations, value.frame, {});

    Vue.set(this._operations[value.frame], "isDownloaded", value.isDownloaded);
  }

}

export default getModule(OperationOfFramesStore);
