import * as d3 from 'd3'
import {ScaleBand} from "d3-scale";
import {GraphValue} from "./GraphValue";

export default class BottomLabel {

  public color: string = "#888";
  public fontSize: number = 12;
  public rotate: number = 0;
  public showDuration:number = 300;
  public hideDuration:number = 300;
  public moveDuration:number = 800;

  protected root: any;
  protected labels: any;

  protected labelData: string[] = [];
  protected xScaler: ScaleBand<string> = d3.scaleBand();

  constructor(__parent: any) {
    this.root = __parent.append('g');
    this.labels = this.root.selectAll("g");
  }

  public init(__dataset: GraphValue[], __xScaler: ScaleBand<string>): void {
    this.labelData = __dataset.map(d => (<any>d).xValue);
    this.xScaler = __xScaler;

    this.labels.remove();
    this.labels = this.root.selectAll("g");
    this.fitPartsCount();
  }

  public setPosition(__x, __y): void {
    this.root.attr("transform", "translate(" + __x + "," + __y + ")");
  }

  private fitPartsCount(): void {
    var update: any = this.labels.data(this.labelData);
    update.select("text").text((d: string) => d);

    var enter: any = update.enter().append("g");
    enter.append("text");
    this.initParts(enter);

    update.exit().remove();

    this.labels = update.merge(enter);
  }

  private initParts(__labels: any): void {
    __labels
      .attr("transform", (d: string) => "translate(" + (this.xScaler(d) + this.xScaler.bandwidth() / 2) + ",0)")

    __labels.select("text")
      .attr("opacity", 0)
      .attr("text-anchor", "start")
      .attr("transform", "rotate(" + this.rotate + ")")
      .attr("text-anchor", this.rotate == 0 ? "middle" : "start")
      .attr("font-size", this.fontSize)
      .attr("fill", this.color)
      .style("pointer-events", "none")
      .text((d: string) => d);
  }

  public show(): void {
    this.root.attr("display", "block");

    this.labels.select("text")
      .interrupt()
      .transition()
      .duration(this.showDuration)
      .attr("opacity", 1)
  }

  public update(__dataset: GraphValue[], __xScaler: ScaleBand<string>): void {
    this.labelData = __dataset.map((d) => (<any>d).xValue);
    this.xScaler = __xScaler;

    this.fitPartsCount();
    this.moveParts();
  }

  private moveParts(): void {
    this.labels
      .interrupt()
      .transition()
      .duration(this.moveDuration)
      .ease(d3.easeExpOut)
      .attr("transform", (d: string) => "translate(" + (this.xScaler(d) + this.xScaler.bandwidth() / 2) + ",0)")

    this.labels.select("text")
      .interrupt()
      .transition()
      .duration(this.showDuration)
      .attr("opacity", 1)
  }

  public resize(__xScaler: ScaleBand<string>):void{
    this.xScaler = __xScaler;

    let tmpDuration = this.moveDuration;
    this.moveDuration = 0;
    this.moveParts();
    this.moveDuration = tmpDuration;
  }

  public hide(): void {
    this.labels.select("text")
      .interrupt()
      .transition()
      .duration(this.hideDuration)
      .attr("opacity", 0)
      .on("end", () => {
        this.root.attr("display", "none");
      })
  }

};
