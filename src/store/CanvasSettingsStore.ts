import {Mutation, Action, VuexModule, getModule, Module} from "vuex-module-decorators";
import store from "@/store";
import ListManager from "@/common/utils/ListManager";


@Module({
    name: "CanvasSettingsStore",
    dynamic: true,
    store: store,
    namespaced: true
})

class CanvasSettingsStore extends VuexModule {

    // states
    private _opacity: number = 1;

    // getters
    get opacity(): number {
        return this._opacity;
    }

    @Mutation
    public setOpacity(opacity: number) {
        this._opacity = opacity;
    }
}

export default getModule(CanvasSettingsStore);
