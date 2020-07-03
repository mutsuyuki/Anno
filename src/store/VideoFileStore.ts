import {Mutation, Action, VuexModule, getModule, Module} from "vuex-module-decorators";
import store from "@/store";


@Module({
    name: "VideoFileStore",
    dynamic: true,
    store: store,
    namespaced: true
})

class VideoFileStore extends VuexModule {

    // states
    private file: File = new File([], "");

    // getters
    get isSelected() {
        return this.file.name != "";
    }

    get url(): string {
        return this.isSelected ? URL.createObjectURL(this.file) : "";
    }

    get name(): string {
        return this.isSelected ? this.file.name : "";
    }

    @Mutation
    public setFile(file: File) {
        this.file = file;
    }

    @Mutation
    public clear() {
        this.file = new File([], "");
    }
}

export default getModule(VideoFileStore);
