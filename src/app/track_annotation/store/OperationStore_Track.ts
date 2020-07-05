import {Mutation, Action, VuexModule, getModule, Module} from "vuex-module-decorators";
import store from "@/store";


@Module({
    name: "OperationStore_Track",
    dynamic: true,
    store: store,
    namespaced: true
})

class OperationStore_Track extends VuexModule {


    // states
    private _frame: string = "0";
    private _selectingObjectId: string = "";
    private _selectingEdge = { top: false, right: false, bottom: false, left: false };
    private _selectingJointName: string = "";
    private _annotationMode: number = 0;    // 0:Bounding  1:Bone
    private _isDeleteMode: boolean = false;

    // // getters
    get frame(): string {
        return this._frame;
    }

    get selectingObjectId(): string {
        return this._selectingObjectId;
    }

    get selectingEdge(): { top: boolean; right: boolean; bottom: boolean; left: boolean } {
        return this._selectingEdge;
    }

    get selectingJointName(): string {
        return this._selectingJointName;
    }

    get isBoundingMode(): boolean {
        return this._annotationMode == 0;
    }

    get isBoneMode(): boolean {
        return this._annotationMode == 1;
    }

    get annotationMode(): number {
        return this._annotationMode;
    }

    get isDeleteMode(): boolean {
        return this._isDeleteMode;
    }


    @Mutation
    public setFrame(value: string) {
        this._frame = value;
    }

    @Mutation
    public setSelectingObjectId(value: string) {
        this._selectingObjectId = value;
    }

    @Mutation
    public setSelectingEdge(value: { top: boolean; right: boolean; bottom: boolean; left: boolean }) {
        this._selectingEdge = value;
    }

    @Mutation
    public setSelectingJointName(value: string) {
        this._selectingJointName = value;
    }

    @Mutation
    public setModeToBounding() {
        this._annotationMode = 0;
    }

    @Mutation
    public setModeToBone() {
        this._annotationMode = 1;
    }

    @Mutation
    public setIsDeleteMode(value: boolean) {
        this._isDeleteMode = value;
    }
}

export default getModule(OperationStore_Track);
