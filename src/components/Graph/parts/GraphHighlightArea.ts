import {Selection} from "d3-selection";
import {GraphBounds, NumberRange, ScaleLinearX} from "@/components/Graph/core/Types";
import * as d3 from "d3";


export default class GraphHighlightArea {

  public color: string = "#888";
  public moveDuration: number = 600;

  private root: Selection<SVGElement, string, null, undefined>;
  private areas: Selection<any, unknown, SVGElement, string>;

  private xScaler: ScaleLinearX = d3.scaleLinear();
  private bounds: GraphBounds | null = null;

  constructor(__parent: Selection<SVGElement, string, null, undefined>) {
    this.root = __parent.append('g');
    this.root.attr("parts-name", this.constructor.name);
    this.areas = this.root.selectAll("rect");
  }

  public init(xScaler: ScaleLinearX, bounds: GraphBounds): void {
    this.xScaler = xScaler;
    this.bounds = bounds;

    this.areas.remove();
    this.areas = this.root.selectAll("rect");
    this.fitPartsCount([], bounds);
  }

  private fitPartsCount(ranges: NumberRange[], bounds: GraphBounds): void {
    const update: any = this.areas.data(ranges);
    const enter: any = update.enter().append("rect");
    this.initParts(enter, bounds);
    update.exit().remove();
    this.areas = update.merge(enter);
  }

  private initParts(newAreas: any, bounds: GraphBounds): void {
    newAreas
      .attr("fill", this.color)
      .attr("x", (d: NumberRange) => this.xScaler(d.start))
      .attr("y", bounds.top)
      .attr("width", (d: NumberRange) => this.xScaler(d.end) - this.xScaler(d.start))
      .attr("height", 0);
  }

  public show(bounds: GraphBounds): void {
    this.root.attr("display", "block");
    this.moveParts(bounds);
  }

  private moveParts(bounds: GraphBounds): void {
    this.areas
      .interrupt()
      .transition()
      .duration(this.moveDuration)
      .attr("x", (d: NumberRange) => this.xScaler(d.start))
      .attr("y", bounds.top)
      .attr("width", (d: NumberRange) => this.xScaler(d.end) - this.xScaler(d.start))
      .attr("height", bounds.height);
  }

  public update(ranges: NumberRange[], xScaler: ScaleLinearX, bounds: GraphBounds): void {
    this.xScaler = xScaler;
    this.bounds = bounds;

    this.fitPartsCount(ranges, bounds);
    this.moveParts(bounds);
  }

  public hide(): void {
    if (!this.bounds)
      return;

    const bounds = this.bounds;
    this.areas
      .interrupt()
      .transition()
      .duration(300)
      .attr("y", bounds.top)
      .attr("height", 0)
      .on("end", () => {
        this.root.attr("display", "none");
      })
  }
};
