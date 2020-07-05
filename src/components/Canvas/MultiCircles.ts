import {Graphic} from "@/components/Canvas/Graphic";
import {Point} from "@/common/interface/Point";
import {Color} from "@/common/interface/Color";
import Circle from "@/components/Canvas/Circle";

export default class MultiCircles implements Graphic {

    public zIndex: number = 0;

    private circles: Circle[] = [];

    constructor(centers: Point[], radius: number, color: Color) {
        for (let i = 0; i < centers.length; i++) {
            const circle = new Circle(
                centers[i],
                radius,
                color
            );
            this.circles.push(circle)
        }

    }

    public draw(context: CanvasRenderingContext2D) {
        this.circles.forEach(v => v.draw(context));
    };
}
