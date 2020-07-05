import {Graphic} from "@/components/Canvas/Graphic";
import {Point} from "@/common/interface/Point";
import {Color} from "@/common/interface/Color";
import Line from "@/components/Canvas/Line";

export default class MultiLines implements Graphic {

    public zIndex: number = 0;

    private lines: Line[] = [];

    constructor(positions: { start: Point, end: Point }[], width: number, color: Color) {
        for (let i = 0; i < positions.length; i++) {
            const line = new Line(
                positions[i].start,
                positions[i].end,
                width,
                color
            );
            this.lines.push(line)
        }
    }

    public draw(context: CanvasRenderingContext2D) {
        this.lines.forEach(v => v.draw(context));
    };
}
