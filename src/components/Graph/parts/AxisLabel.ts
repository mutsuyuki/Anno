import * as d3 from 'd3'
import {Axis} from "d3-axis";
import {Selection} from "d3-selection";
import {AxisDirection} from "./AxisDirection";

export default class AxisLabel {

  public axisDirection: AxisDirection = AxisDirection.HORIZONTAL;

  public color: string = "#888";
  public fontSize: number = 12;
  public ticks: number = 10;
  public timeFormat: string = "";
  public showDuration: number = 600;
  public hideDuration: number = 300;
  public moveDuration: number = 800;

  private root: Selection<SVGElement, string, null, undefined>;
  private labelContainer: any;

  private scaler: any = d3.scaleLinear();

  constructor(__parent: Selection<SVGElement, string, null, undefined>) {
    this.root = __parent.append('g');
    this.root.attr("parts-name", this.constructor.name);
    this.labelContainer = this.root.append("g");
  }

  public init(__scaler: any, x:number, y:number): void {
    this.scaler = __scaler;

    this.labelContainer.call(this.getAxisFunction());
    this.removeUseless();

    this.prepareParts();
    this.root
      .attr("opacity", 0)
      .attr("transform", "translate(" + x + "," + y + ")");
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
    if (this.timeFormat)
      axis.tickFormat(d3.timeFormat(this.timeFormat));

    return axis;
  }

  private removeUseless(): void {
    this.labelContainer.select(".domain").remove();
    this.labelContainer.selectAll(".tick").select("line").remove();
    this.labelContainer.selectAll(".tick").select("path").remove();
  }

  protected prepareParts(): void {
    this.labelContainer.selectAll(".tick").select("text")
      .attr("font-size", this.fontSize)
      .attr("fill", this.color);
  }

  public show(): void {
    this.root.attr("display", "block");

    this.root
      .interrupt()
      .transition()
      .ease(d3.easeSinOut)
      .duration(this.showDuration)
      .attr("opacity", 1);
  }

  public update(__scaler: any): void {
    this.scaler = __scaler;

    this.moveParts();
    this.prepareParts();
    this.removeUseless();
  }

  private moveParts(): void {
    this.labelContainer
      .transition()
      .duration(this.moveDuration)
      .ease(d3.easeExpOut)
      .call(this.getAxisFunction());
  }

  public hide(): void {
    this.root
      .interrupt()
      .transition()
      .ease(d3.easeSinOut)
      .duration(this.hideDuration)
      .attr("opacity", 0)
      .on("end", () => {
        this.root.attr("display", "none");
      })
  }

};
