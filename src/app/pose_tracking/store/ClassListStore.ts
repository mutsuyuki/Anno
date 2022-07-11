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
  private _behaviours: { [id: string]: string } = {
    '0': '食',
    '1': '飲',
    '2': '歩',
    '3': '立_通常',
    '4': '立_反芻',
    '5': '休_通常',
    '6': '休_反芻'
  };

  private _neckMarks: { [id: string]: string } = {
    '0': '1',
    '1': '2',
    '2': '3',
    '3': '4',
    '4': '5',
    '5': '6',
    '6': '7',
    '7': '8',
    '8': '0',
    '9': 'A',
    '10': 'B',
    '11': 'C',
    '12': 'D',
    '13': 'F',
    '14': 'G',
    '15': 'K',
    '16': 'V'
  };

  // getters
  get behaviours() {
    return this._behaviours;
  }

  get neckMarks() {
    return this._neckMarks;
  }
}


export default getModule(ClassListStore);
