import {Mutation, Action, VuexModule, getModule, Module} from "vuex-module-decorators";
import store from "@/store";


@Module({
  name: "HelpStore",
  dynamic: true,
  store: store,
  namespaced: true
})

class HelpStore extends VuexModule {

  // states
  private _isShow: boolean = false;

  // getters
  get isShow(): boolean {
    return this._isShow;
  }

  @Mutation
  public show() {
    this._isShow = true;
  }

  @Mutation
  public hide() {
    this._isShow = false;
  }

  @Mutation
  public toggle() {
    this._isShow = !this._isShow;
  }
}


export default getModule(HelpStore);
