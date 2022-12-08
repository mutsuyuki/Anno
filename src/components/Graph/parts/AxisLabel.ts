import * as d3 from 'd3'
import {Axis} from "d3-axis";
import {AxisDirection} from "./AxisDirection";

export default class AxisLabel {

  public axisDirection: AxisDirection = AxisDirection.HORIZONTAL;

  public color: string = "#888";
  public fontSize: number = 12;
  public ticks: number = 10;
  public timeFormat: string = "";
  public showDuration:number = 600;
  public hideDuration:number = 300;
  public moveDuration:number = 800;

  private root: any;
  private labelContainer: any;

  private scaler: any = d3.scaleLinear();

  constructor(__parent: any) {
    this.root = __parent.append('g');
    this.labelContainer = this.root.append("g");
  }

  public init(__scaler: any): void {
    this.scaler = __scaler;

    this.labelContainer.call(this.getAxisFunction());
    this.removeUseless();

    this.prepareParts();
    this.labelContainer.selectAll(".tick").select("text").attr("opacity", 0);
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
    if(this.timeFormat)
      axis.tickFormat(d3.timeFormat(this.timeFormat));

    return axis;
  }

  public setPosition(__x, __y): void {
    this.root.attr("transform", "translate(" + __x + "," + __y + ")");
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

    this.labelContainer.selectAll(".tick").select("text")
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

  public getTransforms(): number[] {
    let transforms: number[] = [];
    this.root.selectAll(".tick")
      .each((d, i, __elements) => {
        let transform: string = __elements[i].getAttribute("transform");
        let parsed: string[] = transform.match(/translate\([^)]+\)/)[0].match(/[0-9.-]+/g);
        transforms.push(this.axisDirection == AxisDirection.VERTICAL ? +parsed[0] : +parsed[1])
      });

    return transforms;
  }

  public resize(__scaler: any):void{
    this.scaler = __scaler;

    let tmpDuration = this.moveDuration;
    this.moveDuration = 0;
    this.update(this.scaler)
    this.moveDuration = tmpDuration;
  }

  public hide(): void {
    this.labelContainer.selectAll(".tick").select("text")
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
