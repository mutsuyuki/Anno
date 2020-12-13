import {Graphic} from "@/components/Canvas/Renderer/Graphic";
import {Point} from "@/common/interface/Point";
import {Color, ColorUtil} from "@/common/interface/Color";
import DeepCloner from "@/common/utils/DeepCloner";

export default class Polygon implements Graphic {

  public zIndex: number = 0;

  protected points: Point[];
  protected strokeColor: Color;
  protected fillColor: Color;

  constructor(points: Point[], strokeColor: Color, fillColor: Color = {r: 255, g: 255, b: 255, a: 0.5}) {
    this.points = DeepCloner.copy(points);
    this.strokeColor = DeepCloner.copy(strokeColor);
    this.fillColor = DeepCloner.copy(fillColor);
  }

  public draw(context: CanvasRenderingContext2D) {
    const scale = {x: context.canvas.clientWidth, y: context.canvas.clientHeight};

    context.beginPath();
    // context.strokeStyle = ColorUtil.rgba(this._color);
    // context.lineWidth = this._width;
    context.moveTo(
      this.points[0].x * scale.x,
      this.points[0].y * scale.y
    );
    for (let i = 0; i < this.points.length; i++) {
      context.lineTo(
        this.points[i].x * scale.x,
        this.points[i].y * scale.y
      );
    }
    context.stroke();
    context.closePath();
  };
}
