import Vue from 'vue'
import {Mutation, VuexModule, getModule, Module} from "vuex-module-decorators";
import store from "@/store/index";

// ----- interfaces -------------------------------
export interface EditSequence {
  isDirty: boolean
  isUseAnnotationFile: boolean;
  isDownloaded: boolean;
}

@Module({
  name: "EditSequenceStore",
  dynamic: true,
  store: store,
  namespaced: true
})

class EditSequenceStore extends VuexModule {

  // states
  private _sequences: { [frame: string]: EditSequence } = {};

  // getters
  get sequences(): { [frame: string]: EditSequence } {
    return this._sequences;
  }

  @Mutation
  public createIfNothing(frame: string) {
    if (this._sequences[frame])
      return;

    Vue.set(
      this._sequences,
      frame,
      {
        isDirty: false,
        isUseAnnotationFile: false,
        isDownloaded: false,
      }
    );
  }

  @Mutation
  public setSequences(value: { [frame: string]: EditSequence }) {
    this._sequences = value;
  }

  @Mutation
  public setIsDirty(value: { frame: string, isDirty: boolean }) {
    if (!this._sequences[value.frame])
      Vue.set(this._sequences, value.frame, {});

    Vue.set(this._sequences[value.frame], "isDirty", value.isDirty)
  }

  @Mutation
  public setIsUseAnnotationFile(value: { frame: string, isUseAnnotationFile: boolean }) {
    if (!this._sequences[value.frame])
      Vue.set(this._sequences, value.frame, {});

    Vue.set(this._sequences[value.frame], "isUseAnnotationFile", value.isUseAnnotationFile);
  }

  @Mutation
  public setIsDownloaded(value: { frame: string, isDownloaded: boolean }) {
    if (!this._sequences[value.frame])
      Vue.set(this._sequences, value.frame, {});

    Vue.set(this._sequences[value.frame], "isDownloaded", value.isDownloaded);
  }
}

export default getModule(EditSequenceStore);
