import {Mutation, Action, VuexModule, getModule, Module} from "vuex-module-decorators";
import store from "@/store";

export interface Operation {
  frame: string;  // 動画の場合は時刻、画像の場合は画像index
  selectingObjectId: string;
  selectingEdge: { top: boolean, right: boolean, bottom: boolean, left: boolean };
  hoveringObjectId: string;
}

function getInitialState(): Operation {
  return {
    frame: "0",
    selectingObjectId: "",
    selectingEdge: {top: false, right: false, bottom: false, left: false},
    hoveringObjectId: "",
  }
}

@Module({
  name: "OperationStore_" + Math.random().toString(),
  dynamic: true,
  store: store,
  namespaced: true
})

class OperationStore extends VuexModule {

  // states
  private _operation: Operation = getInitialState();

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

  get selectingEdge(): { top: boolean; right: boolean; bottom: boolean; left: boolean } {
    return this._operation.selectingEdge;
  }

  get hoveringObjectId(): string {
    return this._operation.hoveringObjectId;
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

  @Mutation
  public setSelectingEdge(value: { top: boolean; right: boolean; bottom: boolean; left: boolean }) {
    this._operation.selectingEdge = value;
  }

  @Mutation
  public setHoveringObjectId(value: string) {
    this._operation.hoveringObjectId = value;
  }

  @Mutation
  public clear(){
    this._operation = getInitialState();
  }
}

export default getModule(OperationStore);
