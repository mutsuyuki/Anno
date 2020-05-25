export default class ListManager<T> {

    private readonly _items: T[] = [];
    private _currentIndex: number = 0;

    constructor(value: T[]) {
        this._items = value;
    }

    get items(): T[] {
        return this._items;
    }

    get currentIndex(): number {
        return this._currentIndex;
    }

    get currentItem(): T {
        return this._items[this.currentIndex];
    }

    get numberOfItems(): number {
        return this._items.length;
    }

    public setIndex(value: number) {
        if (isNaN(value))
            return;

        if (value == this._currentIndex)
            return;

        let newIndex: number = Math.min(Math.max(value, 0), this.numberOfItems - 1);
        this._currentIndex = newIndex;
    }

    public first(): void {
        this.setIndex(0);
    }

    public last(): void {
        this.setIndex(this.numberOfItems - 1);
    }

    public next(): void {
        this.setIndex(this._currentIndex + 1);
    }

    public prev(): void {
        this.setIndex(this._currentIndex - 1);
    }


}
