import {Mutation, Action, VuexModule, getModule, Module} from "vuex-module-decorators";
import store from "@/store";
import AnnotationContainer from "@/common/model/AnnotationContainer";
import {cloneDeep} from 'lodash'


@Module({
    name: "AnnotationHistoryStore",
    dynamic: true,
    store: store,
    namespaced: true
})

class AnnotationHistoryStore extends VuexModule {

    // states
    private _history: { [key: string]: AnnotationContainer<any> }[] = [];
    private _index: number = 0;

    // getters
    get current() {
        return cloneDeep(this._history[this._index]);
    }

    get enableUndo() {
        return this._index > 0;
    }

    get enableRedo() {
        return this._index < this._history.length - 1;
    }

    @Mutation
    public init(annotations: { [key: string]: AnnotationContainer<any> }) {
        this._history = [cloneDeep(annotations)];
        this._index = 0;
    }

    @Mutation
    public addHistory(annotations: { [key: string]: AnnotationContainer<any> }) {
        this._history = this._history.filter((v, i) => i <= this._index);
        this._history.push(cloneDeep(annotations));
        this._index = this._history.length - 1;
    }

    @Mutation
    public updateCurrent(annotations: { [key: string]: AnnotationContainer<any> }) {
        this._history = this._history.map((v, i) => i == this._index ? cloneDeep(annotations) : v);
    }

    @Mutation
    public undo() {
        this._index -= 1;
        this._index = Math.max(this._index, 0);
    }

    @Mutation
    public redo() {
        this._index += 1;
        this._index = Math.min(this._index, this._history.length - 1);
    }

    @Mutation
    public clear() {
        this._history = [];
        this._index = 0;
    }
}

export default getModule(AnnotationHistoryStore);
