import * as d3 from 'd3'
import {ScaleBand, ScaleLinear} from "d3-scale";

export default class DotAxis {

  protected root: any;
  protected dots: any;

  protected labelData: string[] = [];

  protected yScaler: ScaleLinear<any, any> = d3.scaleLinear();
  protected xScaler: any = d3.scaleLinear();

  constructor(__parent: any) {
    this.root = __parent.append('g');
    this.dots = this.root.selectAll("circle");
  }

  public init(__labels: string[], __xScaler: any, __yScaler: ScaleLinear<any, any>): void {
    this.labelData = __labels;
    this.xScaler = __xScaler;
    this.yScaler = __yScaler;

    this.dots.remove();
    this.dots = this.root.selectAll("circle");
    this.fitPartsCount();
  }

  protected fitPartsCount(): void {
    var update: any = this.dots.data(this.labelData);

    var enter: any = update.enter().append("circle");
    this.initParts(enter);

    update.exit().remove();

    this.dots = update.merge(enter);
  }

  private initParts(__dots: any): void {
    let offsetX:number = this.xScaler.hasOwnProperty("bandwidth") ? this.xScaler.bandwidth() / 2 : 0;
    __dots
      .attr("r", 0)
      .attr("cx", (d: string) => this.xScaler(d) + offsetX)
      .attr("cy", this.yScaler(0))
      .attr("fill", "#989898")
  }

  public show(): void {
    this.root.attr("display", "block");

    this.dots
      .transition()
      .duration(300)
      .attr("r", 3);

  }

  private moveParts(): void {
    let offsetX:number = this.xScaler.hasOwnProperty("bandwidth") ? this.xScaler.bandwidth() / 2 : 0;
    this.dots
      .transition()
      .duration(800)
      .ease(d3.easeExpOut)
      .attr("r", 3)
      .attr("cx", (d: string) => this.xScaler(d) + offsetX)
      .attr("cy", this.yScaler(0))
  }

  public update(__labels: string[], __xScaler: any, __yScaler: ScaleLinear<any, any>): void {
    this.labelData = __labels;
    this.xScaler = __xScaler;
    this.yScaler = __yScaler;

    this.fitPartsCount();
    this.moveParts();
  }

  public hide(): void {
    this.dots
      .interrupt()
      .transition()
      .duration(300)
      .attr("r", 0)
      .on("end", () => {
        this.root.attr("display", "none");
      })
  }

};
