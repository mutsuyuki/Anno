import {Mutation, Action, VuexModule, getModule, Module} from "vuex-module-decorators";
import store from "@/store";
import ListManager from "@/common/utils/ListManager";


@Module({
    name: "ImageFilesStore",
    dynamic: true,
    store: store,
    namespaced: true
})

class ImageFilesStore extends VuexModule {

    // states
    private _items: ListManager<File> = new ListManager<File>([]);

    // getters
    get items(): File[] {
        return this._items.items;
    }

    get currentIndex(): number {
        return this._items.currentIndex;
    }

    get currentItem(): File {
        return this._items.currentItem;
    }

    get numberOfItems(): number {
        return this._items.numberOfItems;
    }

    @Mutation
    public setFiles(files: File[]) {
        this._items = new ListManager<File>(files);
    }

    @Mutation
    public async setIndex(value: number) {
        this._items.setIndex(value);
    }

    @Mutation
    public first(): void {
        this._items.first();
    }

    @Mutation
    public last(): void {
        this._items.last();
    }

    @Mutation
    public next(): void {
        this._items.next();
    }

    @Mutation
    public prev(): void {
        this._items.prev();
    }

    @Mutation
    public clear() {
        this._items = new ListManager<File>([]);
    }
}

export default getModule(ImageFilesStore);
