import {Graphic} from "@/components/Canvas/Graphic";
import {Point} from "@/common/interface/Point";
import {Color, ColorUtil} from "@/common/interface/Color";
import DeepCloner from "@/common/utils/DeepCloner";

export default class RectangleLine implements Graphic {

    public zIndex: number = 0;

    private _left: number;
    private _top: number;
    private _width: number;
    private _height: number;
    private _lineWidth: number;
    private _color: Color;

    constructor(left: number, top: number, width: number, height: number, lineWidth: number, color: Color) {
        this._left = left;
        this._top = top;
        this._width = width;
        this._height = height;
        this._lineWidth = lineWidth;
        this._color = DeepCloner.copy(color);
    }

    public draw(context: CanvasRenderingContext2D) {
        const scale = {x: context.canvas.clientWidth, y: context.canvas.clientHeight};

        context.beginPath();
        context.strokeStyle = ColorUtil.rgba(this._color);
        context.lineWidth = this._lineWidth;
        context.rect(
            this._left * scale.x,
            this._top * scale.y,
            this._width * scale.x,
            this._height * scale.y
        );
        context.stroke();
        context.closePath();
    };

}
