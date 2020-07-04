import {Mutation, Action, VuexModule, getModule, Module} from "vuex-module-decorators";
import store from "@/store";


@Module({
    name: "MenuStore_Track",
    dynamic: true,
    store: store,
    namespaced: true
})

class MenuStore_Track extends VuexModule {

    // states
    private _id: number = -1;
    private _operatingTarget: string = "";

    private _makeNewDataCue: boolean = false;
    private _copyFromSelectCue: boolean = false;
    private _copyFromPrevFrameCue: boolean = false;

    // getters
    get id() {
        return this._id;
    }

    get operatingTarget() {
        return this._operatingTarget;
    }

    get copyFromSelectCue(): boolean {
        return this._copyFromSelectCue;
    }

    get copyFromPrevFrameCue(): boolean {
        return this._copyFromPrevFrameCue;
    }

    get makeNewDataCue(): boolean {
        return this._makeNewDataCue;
    }

    @Mutation
    public setId(id: number) {
        this._id = id;
    }

    @Mutation
    public setOperatingTarget(key: string) {
        this._operatingTarget = key;
    }

    @Mutation
    public toggleMakeNewDataCue() {
        this._makeNewDataCue = !this._makeNewDataCue;
    }

    @Mutation
    public toggleCopyFromSelectCue() {
        this._copyFromSelectCue = !this._copyFromSelectCue;
    }

    @Mutation
    public toggleCopyFromPrevFrameCue() {
        this._copyFromPrevFrameCue = !this._copyFromPrevFrameCue;
    }

}

export default getModule(MenuStore_Track);
