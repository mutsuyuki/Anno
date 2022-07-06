import {Mutation, Action, VuexModule, getModule, Module} from "vuex-module-decorators";
import store from "@/store";

export interface Operation {
  frame: string;
  selectingObjectId: string;
}

@Module({
  name: "OperationStore_" + Math.random().toString(),
  dynamic: true,
  store: store,
  namespaced: true
})

class OperationStore extends VuexModule {

  // states
  private _operation: Operation = {
    frame: "0",
    selectingObjectId: "",
  };

  // getters
  get operation(): Operation {
    return this._operation;
  }

  get frame(): string {
    return this._operation.frame;
  }

  get selectingObjectId(): string {
    return this._operation.selectingObjectId;
  }

  @Mutation
  public setOperation(value: Operation) {
    this._operation = value;
  }

  @Mutation
  public setFrame(value: string) {
    this._operation.frame = value;
  }

  @Mutation
  public setSelectingObjectId(value: string) {
    this._operation.selectingObjectId = value;
  }
}

export default getModule(OperationStore);
