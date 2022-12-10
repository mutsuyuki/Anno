import * as d3 from 'd3'
import {Selection} from "d3-selection";
import GraphValue from "../core/GraphValue";
import {LinearX, ScaleLinearX, ScaleY} from "../core/Types";

export default class GraphLinePoint {

  public dataIndex: number = 0;    // datasetのyValuesのうち、どのデータを使うか
  public color: string = "#888";
  public radius: number = 3;

  private root: Selection<SVGElement, string, null, undefined>;
  private points: any;

  private dataset: GraphValue<LinearX>[] = [];

  private xScaler: ScaleLinearX = d3.scaleLinear();
  private yScaler: ScaleY = d3.scaleLinear();

  constructor(__parent: Selection<SVGElement, string, null, undefined>) {
    this.root = __parent.append('g');
    this.root.attr("parts-name", "graphline");
    this.points = this.root.selectAll("circle");
  }

  public init(dataset: GraphValue<LinearX>[], xScaler: ScaleLinearX, yScaler: ScaleY): void {
    this.dataset = dataset;
    this.xScaler = xScaler;
    this.yScaler = yScaler;

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
    __bars
      .attr("stroke", this.color)
      .attr("stroke-width", 2)
      .attr("fill", "#000")
      .attr("cx", (d: GraphValue<LinearX>) => this.xScaler(d.xValue))
      .attr("cy", this.yScaler(0))
      .attr("r", 0);
  }

  public show(): void {
    this.root.attr("display", "block");
    this.moveParts();
  }

  private moveParts(): void {
    this.points
      .interrupt()
      .transition()
      .duration(800)
      .ease(d3.easeExpOut)
      .attr("cx", (d: GraphValue<LinearX>) => this.xScaler(d.xValue))
      .attr("cy", (d: GraphValue<LinearX>) => this.yScaler(d.yValues[this.dataIndex]))
      .attr("r", this.radius);
  }

  public update(dataset: GraphValue<LinearX>[], xScaler: ScaleLinearX, yScaler: ScaleY): void {
    this.dataset = dataset;
    this.xScaler = xScaler;
    this.yScaler = yScaler;

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
