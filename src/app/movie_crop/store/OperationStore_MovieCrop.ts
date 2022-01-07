import {Mutation, Action, VuexModule, getModule, Module} from "vuex-module-decorators";
import store from "@/store";

export interface Operation_MovieCrop {
  frame: string;
  selectingObjectId: string;
  hoveringObjectId: string;
  scale: number;
}

@Module({
  name: "OperationStore_MovieCrop",
  dynamic: true,
  store: store,
  namespaced: true
})

class OperationStore_MovieCrop extends VuexModule {

  // states
  private _operation: Operation_MovieCrop = {
    frame: "0",
    selectingObjectId: "",
    hoveringObjectId: "",
    scale: 1
  };

  // getters
  get operation(): Operation_MovieCrop {
    return this._operation;
  }

  get frame(): string {
    return this._operation.frame;
  }

  get selectingObjectId(): string {
    return this._operation.selectingObjectId;
  }

  get hoveringObjectId(): string {
    return this._operation.hoveringObjectId;
  }

  get scale(): number {
    return this._operation.scale;
  }



  @Mutation
  public setOperation(value: Operation_MovieCrop) {
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
  public setHoveringObjectId(value: string) {
    this._operation.hoveringObjectId = value;
  }

  @Mutation
  public setScale(value: number) {
    this._operation.scale = value;
  }
}

export default getModule(OperationStore_MovieCrop);
