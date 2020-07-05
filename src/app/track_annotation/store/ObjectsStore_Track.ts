import {Mutation, Action, VuexModule, getModule, Module} from "vuex-module-decorators";
import store from "@/store";


@Module({
    name: "ObjectsStore_Track",
    dynamic: true,
    store: store,
    namespaced: true
})

class ObjectsStore_Track extends VuexModule {

    // states
    private time:number = 0;
    private selectingObjectId:number = -1;
    private hoveringObjectId:number = -1;
    private selectingPoint:number = -1;
    private hoveringPoint:number = -1;
    private annotationMode:number = 0;    // 0:Bounding  1:Bone

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

export default getModule(ObjectsStore_Track);
