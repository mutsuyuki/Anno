import {Mutation, Action, VuexModule, getModule, Module} from "vuex-module-decorators";
import store from "@/store";
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
  get current(): any {
    return DeepCloner.copy(this._history[this._index]) || {};
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
    this._history.length = this._index + 1;
    if (this._history.length >= 10) {
      this._history.shift();
    }
    const clonedRecord = DeepCloner.copy(record);
    Object.freeze(clonedRecord);
    this._history.push(clonedRecord);
    this._index = this._history.length - 1;
  }

  @Mutation
  public undo() {
    this._index = Math.max(this._index - 1, 0);
  }

  @Mutation
  public redo() {
    this._index = Math.min(this._index + 1, this._history.length - 1);
  }

  @Mutation
  public clear() {
    this._history = [];
    this._index = 0;
  }
}

export default getModule(HistoryStore);
