import Vue from 'vue'
import {Mutation, VuexModule, getModule, Module} from "vuex-module-decorators";
import store from "@/store/index";

// ----- interfaces -------------------------------
export interface EditState {
  isDirty: boolean
  isUseAnnotationFile: boolean;
  isDownloaded: boolean;
}

@Module({
  name: "EditStateStore",
  dynamic: true,
  store: store,
  namespaced: true
})

class EditStateStore extends VuexModule {

  // states
  private _states: { [frame: string]: EditState } = {};

  // getters
  get states(): { [frame: string]: EditState } {
    return this._states;
  }

  @Mutation
  public createIfNothing(frame: string) {
    if (this._states[frame])
      return;

    Vue.set(
      this._states,
      frame,
      {
        isDirty: false,
        isUseAnnotationFile: false,
        isDownloaded: false,
      }
    );
  }

  @Mutation
  public setSequences(value: { [frame: string]: EditState }) {
    this._states = value;
  }

  @Mutation
  public setIsDirty(value: { frame: string, isDirty: boolean }) {
    if (!this._states[value.frame])
      Vue.set(this._states, value.frame, {});

    Vue.set(this._states[value.frame], "isDirty", value.isDirty)
  }

  @Mutation
  public setIsUseAnnotationFile(value: { frame: string, isUseAnnotationFile: boolean }) {
    if (!this._states[value.frame])
      Vue.set(this._states, value.frame, {});

    Vue.set(this._states[value.frame], "isUseAnnotationFile", value.isUseAnnotationFile);
  }

  @Mutation
  public setIsDownloaded(value: { frame: string, isDownloaded: boolean }) {
    if (!this._states[value.frame])
      Vue.set(this._states, value.frame, {});

    Vue.set(this._states[value.frame], "isDownloaded", value.isDownloaded);
  }
}

export default getModule(EditStateStore);
