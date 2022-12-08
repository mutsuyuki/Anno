import * as d3 from 'd3'
import {Axis} from "d3-axis";
import {AxisDirection} from "./AxisDirection";
import AxisLabel from "./AxisLabel";

export default class AxisRuler {

  public axisDirection: AxisDirection = AxisDirection.HORIZONTAL;

  public isDashed: boolean = false;
  public lineLength: number = 0;
  public width: number = 1;
  public color: string = "#888";
  public ticks: number = 8;
  public highlightTicks: number = null;  // 強調する線のticks （普通はラベルと同じにする）
  public showDuration:number = 700;
  public hideDuration:number = 300;
  public moveDuration:number = 800;

  private root: any;
  private rulerContainer: any;

  private scaler: any = d3.scaleLinear();

  constructor(__parent: any) {
    this.root = __parent.append('g');
    this.rulerContainer = this.root.append("g");
  }

  public init(__scaler: any): void {
    this.scaler = __scaler;

    this.rulerContainer.call(this.getAxisFunction());
    this.removeUseless();
    this.highlightLabelLines();

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

  private highlightLabelLines(): void {
    if (this.highlightTicks == null)
      return;

    // let labelPositions: number[] = this.labels.getTransforms();
    // this.rulerContainer.selectAll(".tick")
    //   .each((d, i, __elements) => {
    //     let transform: string = __elements[i].getAttribute("transform");
    //     let parsed: string[] = transform.match(/translate\([^)]+\)/)[0].match(/[0-9.-]+/g);
    //     let pos: number = this.axisDirection == AxisDirection.VERTICAL ? +parsed[0] : +parsed[1]
    //     console.log(i, labelPositions, pos);
    //     if (labelPositions.indexOf(pos) < 0) {
    //       d3.select(__elements[i]).select("line").attr("stroke-dasharray", "1,1")
    //     }else{
    //       d3.select(__elements[i]).select("line").attr("stroke-dasharray", "none")
    //     }
    //   });
  }

  protected prepareParts(): void {
    this.rulerContainer.selectAll(".tick").select("line")
      .attr("stroke-width", this.width)
      .attr("stroke", this.color);

    if(this.isDashed)
      this.rulerContainer.selectAll(".tick").select("line")
        .attr("stroke-dasharray", "1,1");
  }

  public show(): void {
    this.root.attr("display", "block");

    let direction: string = this.getDirection();

    this.rulerContainer.selectAll(".tick").select("line")
      .interrupt()
      .transition()
      .ease(d3.easeExpOut)
      .duration(this.showDuration)
      .attr(direction + "1", 0)
      .attr(direction + "2", this.lineLength)
    ;
  }

  public update(__scaler: any): void {
    this.scaler = __scaler;

    this.moveParts();
    this.highlightLabelLines();
    this.removeUseless();

    this.prepareParts();
    this.show();
  }


  private moveParts(): void {
    this.rulerContainer
      .transition()
      .duration(this.moveDuration)
      .ease(d3.easeExpOut)
      .call(this.getAxisFunction());
  }

  public resize(__scaler:any, __lineLength:number):void{
    this.scaler = __scaler;
    this.lineLength = __lineLength;

    let showTmpDuration = this.showDuration;
    let moveTmpDuration = this.moveDuration;
    this.showDuration = 0;
    this.moveDuration = 0;
    this.update(this.scaler);
    this.showDuration = showTmpDuration;
    this.moveDuration = moveTmpDuration;
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
