import {Graphic} from "@/components/Canvas/Graphic";
import {Point} from "@/common/interface/Point";
import {Color, ColorUtil} from "@/common/interface/Color";
import DeepCloner from "@/common/utils/DeepCloner";
import Line from "@/components/Canvas/Line";

export default class ScaleLine extends Line {

    public draw(context: CanvasRenderingContext2D) {
        const scale = {x: context.canvas.clientWidth, y: context.canvas.clientHeight};

        context.beginPath();
        context.strokeStyle = ColorUtil.rgba(this._color);
        context.lineWidth = this._width * scale.x;  // 太さはキャンバスサイズの横幅を1としたサイズで指定している
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
