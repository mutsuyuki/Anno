import * as d3 from 'd3'
import {ScaleLinear} from "d3-scale";
import {GraphValue} from "./GraphValue";

export default class GraphPoint {

  public dataIndex: number = 0;    // datasetのyValuesのうち、どのデータを使うか
  public color: string = "#888";
  public radius: number = 3;

  private root: any;
  private points: any;

  private dataset: GraphValue[] = [new GraphValue("_", [0])];

  private xScaler: any = d3.scaleLinear();
  private yScaler: ScaleLinear<any, any> = d3.scaleLinear();

  constructor(__parent: any) {
    this.root = __parent.append('g');
    this.points = this.root.selectAll("circle");
  }

  public init(__dataset: GraphValue[], __xScaler: any, __yScaler: ScaleLinear<any, any>): void {
    this.dataset = __dataset;
    this.xScaler = __xScaler;
    this.yScaler = __yScaler;

    this.points.remove();
    this.points = this.root.selectAll("circle");
    this.fitPartsCount();
  }

  private fitPartsCount(): void {
    var update: any = this.points.data(this.dataset);
    var enter: any = update.enter().append("circle");
    this.initParts(enter);

    update.exit().remove();

    this.points = update.merge(enter);
  }

  private initParts(__bars: any): void {
    let offsetX:number = this.xScaler.hasOwnProperty("bandwidth") ? this.xScaler.bandwidth() / 2 : 0;
    __bars
      .attr("stroke", this.color)
      .attr("stroke-width", 2)
      .attr("fill", "#000")
      .attr("cx", (d: GraphValue) => this.xScaler(d.xValue) + offsetX)
      .attr("cy", this.yScaler(0))
      .attr("r", 0);
  }

  public show(): void {
    this.root.attr("display", "block");
    this.moveParts();
  }

  private moveParts(): void {
    let offsetX:number = this.xScaler.hasOwnProperty("bandwidth") ? this.xScaler.bandwidth() / 2 : 0;
    this.points
      .interrupt()
      .transition()
      .duration(800)
      .ease(d3.easeExpOut)
      .attr("cx", (d: GraphValue) => this.xScaler(d.xValue) + offsetX)
      .attr("cy", (d: GraphValue) => this.yScaler(d.yValues[this.dataIndex]))
      .attr("r", this.radius);
  }

  public update(__dataset: GraphValue[], __xScaler: any, __yScaler: ScaleLinear<any, any>): void {
    this.dataset = __dataset;
    this.xScaler = __xScaler;
    this.yScaler = __yScaler;

    this.fitPartsCount();
    this.moveParts();
  }

  public hide(): void {
    this.points
      .interrupt()
      .transition()
      .duration(300)
      .attr("r", 0)
      .on("end", () => {
        this.root.attr("display", "none");
      })
  }

};
