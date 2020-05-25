import {Graphic} from "@/components/Canvas/Graphic";
import {Point} from "@/common/interface/Point";
import {Color, ColorUtil} from "@/common/interface/Color";
import DeepCloner from "@/common/utils/DeepCloner";

export default class Circle implements Graphic {

    public zIndex: number = 0;

    private _position: Point;
    private _radius: number;
    private _color: Color;

    constructor(position: Point, radius: number, color: Color) {
        this._position = DeepCloner.copy(position);
        this._radius = radius;
        this._color = DeepCloner.copy(color);
    }

    get position(): Point {
        return DeepCloner.copy(this._position);
    }

    set position(value: Point) {
        this._position = DeepCloner.copy(value);
    }

    get radius(): number {
        return DeepCloner.copy(this._radius);
    }

    set radius(value: number) {
        this._radius = DeepCloner.copy(value);
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
        context.fillStyle = ColorUtil.rgba(this._color);
        context.arc(
            this._position.x * scale.x,
            this._position.y * scale.y,
            this._radius,     // radius
            0,                // start angle
            Math.PI * 2,      // end angle
            false
        );
        context.fill();
        context.closePath();
    };

}
