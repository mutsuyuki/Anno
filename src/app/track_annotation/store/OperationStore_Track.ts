import {Mutation, Action, VuexModule, getModule, Module} from "vuex-module-decorators";
import store from "@/store";

export interface Operation_Track {
    frame: string;
    selectingObjectId: string;
    selectingEdge: { top: boolean, right: boolean, bottom: boolean, left: boolean };
    selectingJointName: string;
    hoveringObjectId: string;
    hoveringJointName: string;
    annotationMode: number;
}

@Module({
    name: "OperationStore_Track",
    dynamic: true,
    store: store,
    namespaced: true
})

class OperationStore_Track extends VuexModule {

    // states
    private _operation: Operation_Track = {
        frame: "0",
        selectingObjectId: "",
        selectingEdge: {top: false, right: false, bottom: false, left: false},
        selectingJointName: "",
        hoveringObjectId: "",
        hoveringJointName: "",
        annotationMode: 0,    // 0:Bounding  1:Bone
    };

    // getters
    get operation(): Operation_Track {
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
        return this._operation.annotationMode == 0;
    }

    get isBoneMode(): boolean {
        return this._operation.annotationMode == 1;
    }

    get annotationMode(): number {
        return this._operation.annotationMode;
    }


    @Mutation
    public setOperation(value: Operation_Track) {
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
        this._operation.annotationMode = 0;
    }

    @Mutation
    public setModeToBone() {
        this._operation.annotationMode = 1;
    }

}

export default getModule(OperationStore_Track);
