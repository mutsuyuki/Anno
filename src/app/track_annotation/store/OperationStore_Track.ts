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
    private _time: number = 0;
    private _selectingObjectId: number = -1;
    private _hoveringObjectId: number = -1;
    private _selectingPoint: number = -1;
    private _hoveringPoint: number = -1;
    private _annotationMode: number = 0;    // 0:Bounding  1:Bone

    // // getters
    get time(): number {
        return this._time;
    }

    get selectingObjectId(): number {
        return this._selectingObjectId;
    }

    get hoveringObjectId(): number {
        return this._hoveringObjectId;
    }

    get selectingPoint(): number {
        return this._selectingPoint;
    }

    get hoveringPoint(): number {
        return this._hoveringPoint;
    }

    get annotationMode(): number {
        return this._annotationMode;
    }

    @Mutation
    public setTime(value: number) {
        this._time = value;
    }

    @Mutation
    public setSelectingObjectId(value: number) {
        this._selectingObjectId = value;
    }

    @Mutation
    public setHoveringObjectId(value: number) {
        this._hoveringObjectId = value;
    }

    @Mutation
    public setSelectingPoint(value: number) {
        this._selectingPoint = value;
    }

    @Mutation
    public setHoveringPoint(value: number) {
        this._hoveringPoint = value;
    }

    @Mutation
    public setAnnotationMode(value: number) {
        this._annotationMode = value;
    }

}

export default getModule(OperationStore_Track);
