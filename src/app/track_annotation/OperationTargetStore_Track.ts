import {Mutation, Action, VuexModule, getModule, Module} from "vuex-module-decorators";
import store from "@/store";


@Module({
    name: "OperationTargetStore_Track",
    dynamic: true,
    store: store,
    namespaced: true
})

class OperationTargetStore_Track extends VuexModule {

    // states
    private _id: number = -1;
    private _operatingTarget: string = "";

    // getters
    get id() {
        return this._id;
    }

    get operatingTarget() {
        return this._operatingTarget;
    }

    @Mutation
    public setId(id: number) {
        this._id = id;
    }

    @Mutation
    public setOperatingTarget(key: string) {
        this._operatingTarget = key;
    }
}

export default getModule(OperationTargetStore_Track);
