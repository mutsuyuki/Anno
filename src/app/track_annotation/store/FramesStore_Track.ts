import {Mutation, Action, VuexModule, getModule, Module} from "vuex-module-decorators";
import store from "@/store";

export interface Frame_Track {
    isDirty:boolean
    isUseAnnotationFile: boolean;
    isDownloaded: boolean;
}


@Module({
    name: "FramesStore_Track",
    dynamic: true,
    store: store,
    namespaced: true
})

class FramesStore_Track extends VuexModule {

    // states
    private frames:{[frameId:string] : Frame_Track} = {};
   
    // // getters
    // get id() {
    //     return this._id;
    // }
    //
    // get operatingTarget() {
    //     return this._operatingTarget;
    // }
    //
    //
    // @Mutation
    // public setId(id: number) {
    //     this._id = id;
    // }
    //
    // @Mutation
    // public setOperatingTarget(key: string) {
    //     this._operatingTarget = key;
    // }

}

export default getModule(FramesStore_Track);
