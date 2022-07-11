import Vue from 'vue'
import {Mutation, Action, VuexModule, getModule, Module} from "vuex-module-decorators";
import store from "@/store";


@Module({
  name: "ClassListStore_" + Math.random().toString(),
  dynamic: true,
  store: store,
  namespaced: true
})

class ClassListStore extends VuexModule {

  // --- state ------------------------------
  private _classList: { [id: string]: string } = {
    "0": "piman",
    "1": "stem",
  };

  // getters
  get classList() {
    return this._classList;
  }

  get classesArray(): { id: string, text: string }[] {
    const classesArray = Object.entries(this._classList);
    return classesArray.map(v => {
      return {id: v[0], text: v[1]}
    });
  }

  @Mutation
  public setClassList(value: { [id: string]: string }) {
    this._classList = value;
  }

  @Mutation
  public addClass(value: { id: string, text: string }) {
    Vue.set(this._classList, value.id, value.text);
  }

  @Mutation
  public addClassByName(name: string) {
    const ids = Object.keys(this._classList).map(v => Number(v));
    const newestId = ids.length == 0 ? -1 : ids.reduce((a, b) => Math.max(a, b));
    const newId = newestId + 1;
    Vue.set(this._classList, newId.toString(), name);
  }

  @Mutation
  public deleteClass(id: string) {
    Vue.delete(this._classList, id);
  }
}


export default getModule(ClassListStore);
