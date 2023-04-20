import {Graphic} from "@/components/Canvas/Renderer/Graphic";
import {Point} from "@/common/interface/Point";
import {Color, ColorUtil} from "@/common/interface/Color";
import DeepCloner from "@/common/utils/DeepCloner";

export default class Circle implements Graphic {

  public zIndex: number = 0;

  private _center: Point;
  private _radius: number;
  private _color: Color;
  private _filled: boolean;

  constructor(center: Point, radius: number, color: Color, filled: boolean = true) {
    this._center = DeepCloner.copy(center);
    this._radius = radius;
    this._color = DeepCloner.copy(color);
    this._filled = filled;
  }

  public draw(context: CanvasRenderingContext2D) {
    const scale = {x: context.canvas.clientWidth, y: context.canvas.clientHeight};

    context.beginPath();
    context.arc(
      this._center.x * scale.x,
      this._center.y * scale.y,
      this._radius,     // radius
      0,                // start angle
      Math.PI * 2,      // end angle
      false
    );
    if (this._filled) {
      context.fillStyle = ColorUtil.rgba(this._color);
      context.fill();
    } else {
      context.strokeStyle = ColorUtil.rgba(this._color);
      context.lineWidth = 1;
      context.stroke();
    }
    context.closePath();
  };

}
