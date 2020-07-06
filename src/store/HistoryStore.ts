import {Mutation, Action, VuexModule, getModule, Module} from "vuex-module-decorators";
import store from "@/store";
import {cloneDeep} from 'lodash'
import DeepCloner from "@/common/utils/DeepCloner";

export class HistoryRecord<T> {
    public value: T;

    constructor(value: T) {
        this.value = DeepCloner.copy(value);
    }
}


@Module({
    name: "HistoryStore",
    dynamic: true,
    store: store,
    namespaced: true
})

class HistoryStore extends VuexModule {

    // states
    private _history: HistoryRecord<any>[] = [];
    private _index: number = 0;

    // getters
    get current() {
        return cloneDeep(this._history[this._index]) || {};
    }

    get index(): number {
        return this._index;
    }

    get enableUndo() {
        return this._index > 0;
    }

    get enableRedo() {
        return this._index < this._history.length - 1;
    }

    @Mutation
    public init(record: HistoryRecord<any>) {
        this._history = [record];
        this._index = 0;
    }

    @Mutation
    public addHistory(record: HistoryRecord<any>) {
        this._history = this._history.filter((v, i) => i <= this._index);
        this._history.push(record);
        this._index = this._history.length - 1;
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

export default getModule(HistoryStore);
