import {Mutation, Action, VuexModule, getModule, Module} from "vuex-module-decorators";
import store from "@/store";

export interface Operation_ObjectDetection {
  frame: string;
  selectingObjectId: string;
  selectingEdge: { top: boolean, right: boolean, bottom: boolean, left: boolean };
  hoveringObjectId: string;
}

@Module({
  name: "OperationStore_ObjectDetection",
  dynamic: true,
  store: store,
  namespaced: true
})

class OperationStore_ObjectDetection extends VuexModule {

  // states
  private _operation: Operation_ObjectDetection = {
    frame: "0",
    selectingObjectId: "",
    selectingEdge: {top: false, right: false, bottom: false, left: false},
    hoveringObjectId: "",
  };

  // getters
  get operation(): Operation_ObjectDetection {
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
  public setOperation(value: Operation_ObjectDetection) {
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

}

export default getModule(OperationStore_ObjectDetection);
