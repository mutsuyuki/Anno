import * as d3 from 'd3'
import {Axis} from "d3-axis";
import {Selection} from "d3-selection";
import {AxisDirection} from "./AxisDirection";

export default class AxisRuler {

  public axisDirection: AxisDirection = AxisDirection.HORIZONTAL;

  public isDashed: boolean = true;
  public strokeWidth: number = 1;
  public color: string = "#666";
  public ticks: number = 8;
  public showDuration:number = 700;
  public hideDuration:number = 300;
  public moveDuration:number = 800;

  private root: Selection<SVGElement, string, null, undefined>;

  private rulerContainer: any;

  private scaler: any = d3.scaleLinear();

  constructor(__parent: Selection<SVGElement, string, null, undefined>) {
    this.root = __parent.append('g');
    this.root.attr("parts-name", this.constructor.name);
    this.rulerContainer = this.root.append("g");
  }

  public init(__scaler: any): void {
    this.scaler = __scaler;

    this.rulerContainer.call(this.getAxisFunction());
    this.removeUseless();

    this.prepareParts();
    let direction: string = this.getDirection();
    this.rulerContainer.selectAll(".tick").select("line")
      .attr(direction + "1", 0)
      .attr(direction + "2", 0);
  }

  private getDirection():string{
    return (this.axisDirection == AxisDirection.HORIZONTAL) ? "x" : "y";
  }

  private getAxisFunction(): Axis<any> {
    let axis: Axis<any>;

    switch (this.axisDirection) {
      case AxisDirection.HORIZONTAL:
        axis = d3.axisLeft(this.scaler);
        break;
      case AxisDirection.VERTICAL:
        axis = d3.axisBottom(this.scaler);
        break;
      default:
        axis = d3.axisLeft(this.scaler);
    }

    axis.ticks(this.ticks);
    return axis;
  }

  public setPosition(__x, __y): void {
    this.root.attr("transform", "translate(" + __x + "," + __y + ")");
  }

  private removeUseless(): void {
    this.rulerContainer.select(".domain").remove();
    this.rulerContainer.selectAll(".tick").select("text").remove();
  }

  protected prepareParts(): void {
    this.rulerContainer.selectAll(".tick").select("line")
      .attr("stroke-width", this.strokeWidth)
      .attr("stroke", this.color);

    if(this.isDashed)
      this.rulerContainer.selectAll(".tick").select("line")
        .attr("stroke-dasharray", "1,1");
  }

  public show(lineLength:number): void {
    this.root.attr("display", "block");

    let direction: string = this.getDirection();

    this.rulerContainer.selectAll(".tick").select("line")
      .interrupt()
      .transition()
      .ease(d3.easeExpOut)
      .duration(this.showDuration)
      .attr(direction + "1", 0)
      .attr(direction + "2", lineLength);
  }

  public update(scaler: any, lineLength:number): void {
    this.scaler = scaler;

    this.moveParts();
    this.removeUseless();
    this.prepareParts();
    this.show(lineLength);
  }


  private moveParts(): void {
    this.rulerContainer
      .transition()
      .duration(this.moveDuration)
      .ease(d3.easeExpOut)
      .call(this.getAxisFunction());
  }

  public hide(): void {
    let direction: string = this.getDirection();

    this.rulerContainer.selectAll(".tick").select("line")
      .interrupt()
      .transition()
      .ease(d3.easeExpOut)
      .duration(this.hideDuration)
      .attr(direction + "1", 0)
      .attr(direction + "2", 0)
  }

};
