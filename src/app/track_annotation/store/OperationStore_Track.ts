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
    private _frame: string = "";
    private _selectingObjectId: string = "";
    private _hoveringObjectId: string = "";
    private _selectingJointName: string = "";
    private _hoveringJointName: string = "";
    private _annotationMode: number = 0;    // 0:Bounding  1:Bone
    private _isDeleteMode: boolean = false;

    // // getters
    get frame(): string {
        return this._frame;
    }

    get selectingObjectId(): string {
        return this._selectingObjectId;
    }

    get hoveringObjectId(): string {
        return this._hoveringObjectId;
    }

    get selectingJointName(): string {
        return this._selectingJointName;
    }

    get hoveringJointName(): string {
        return this._hoveringJointName;
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
    public setHoveringObjectId(value: string) {
        this._hoveringObjectId = value;
    }

    @Mutation
    public setSelectingJointName(value: string) {
        this._selectingJointName = value;
    }

    @Mutation
    public setHoveringJointName(value: string) {
        this._hoveringJointName = value;
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
