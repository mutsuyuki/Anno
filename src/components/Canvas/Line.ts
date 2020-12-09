import {Graphic} from "@/components/Canvas/Graphic";
import {Point} from "@/common/interface/Point";
import {Color, ColorUtil} from "@/common/interface/Color";
import DeepCloner from "@/common/utils/DeepCloner";

export default class Line implements Graphic {

  public zIndex: number = 0;

  protected _start: Point;
  protected _end: Point;
  protected _width: number;
  protected _color: Color;

  constructor(start: Point, end: Point, width: number, color: Color) {
    this._start = DeepCloner.copy(start);
    this._end = DeepCloner.copy(end);
    this._width = width;
    this._color = DeepCloner.copy(color);
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
