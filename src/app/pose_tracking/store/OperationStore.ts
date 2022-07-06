import {Mutation, Action, VuexModule, getModule, Module} from "vuex-module-decorators";
import store from "@/store";

// ----- interfaces -------------------------------
export interface Operation {
  frame: string;
  selectingObjectId: string;
  selectingJointName: string;
  hoveringObjectId: string;
  hoveringJointName: string;
  annotationMode: string;
}

@Module({
  name: "OperationStore_Track",
  dynamic: true,
  store: store,
  namespaced: true
})

class OperationStore extends VuexModule {

  // states
  private _operation: Operation = {
    frame: "0",
    selectingObjectId: "",
    selectingJointName: "",
    hoveringObjectId: "",
    hoveringJointName: "",
    annotationMode: 'bounding',    // 0:Bounding  1:Bone
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

  get selectingJointName(): string {
    return this._operation.selectingJointName;
  }

  get hoveringObjectId(): string {
    return this._operation.hoveringObjectId;
  }

  get hoveringJointName(): string {
    return this._operation.hoveringJointName;
  }

  get isBoundingMode(): boolean {
    return this._operation.annotationMode == "bounding";
  }

  get isBoneMode(): boolean {
    return this._operation.annotationMode == "bone";
  }

  get isNeckMarkMode(): boolean {
    return this._operation.annotationMode == "neck_mark";
  }


  get annotationMode(): string {
    return this._operation.annotationMode;
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
  public setSelectingJointName(value: string) {
    this._operation.selectingJointName = value;
  }

  @Mutation
  public setHoveringObjectId(value: string) {
    this._operation.hoveringObjectId = value;
  }

  @Mutation
  public setHoveringJointName(value: string) {
    this._operation.hoveringJointName = value;
  }

  @Mutation
  public setModeToBounding() {
    this._operation.annotationMode = "bounding";
  }

  @Mutation
  public setModeToBone() {
    this._operation.annotationMode = "bone";
  }

  @Mutation
  public setModeToNeckMark() {
    this._operation.annotationMode = "neck_mark";
  }

}

export default getModule(OperationStore);
