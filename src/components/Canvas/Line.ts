import {Graphic} from "@/components/Canvas/Graphic";
import {Point} from "@/common/interface/Point";
import {Color, ColorUtil} from "@/common/interface/Color";
import DeepCloner from "@/common/utils/DeepCloner";

export default class Line implements Graphic {

    public zIndex: number = 0;

    private _start: Point;
    private _end: Point;
    private _width: number;
    private _color: Color;

    constructor(start: Point, end: Point, width: number, color: Color) {
        this._start = DeepCloner.copy(start);
        this._end = DeepCloner.copy(end);
        this._width = width;
        this._color = DeepCloner.copy(color);
    }

    get start(): Point {
        return DeepCloner.copy(this._start);
    }

    set start(value: Point) {
        this._start = DeepCloner.copy(value);
    }

    get end(): Point {
        return DeepCloner.copy(this._end);
    }

    set end(value: Point) {
        this._end = DeepCloner.copy(value);
    }

    get width(): number {
        return DeepCloner.copy(this._width);
    }

    set width(value: number) {
        this._width = DeepCloner.copy(value);
    }

    get color(): Color {
        return DeepCloner.copy(this._color);
    }

    set color(value: Color) {
        this._color = DeepCloner.copy(value);
    }

    public draw(context: CanvasRenderingContext2D) {
        const scale = {x: context.canvas.clientWidth, y: context.canvas.clientHeight};

        context.beginPath();
        context.strokeStyle = ColorUtil.rgba(this._color);
        context.lineWidth = this._width;
        context.moveTo(
            this._start.x * scale.x,
            this._start.y * scale.y
        );
        context.lineTo(
            this._end.x * scale.x,
            this._end.y * scale.y
        );
        context.stroke();
        context.closePath();
    };
}
