import * as d3 from 'd3'
import {Selection} from "d3-selection";
import {GraphBounds} from "@/components/Graph/core/Types";

export default class GraphFrame {
  public isTop: boolean = true;
  public isBottom: boolean = true;
  public isLeft: boolean = true;
  public isRight: boolean = true;
  public isDashed: boolean = false;
  public lineWidth = 2;
  public color: string = "#ccc";
  public showDuration: number = 700;
  public hideDuration: number = 800;

  private root: Selection<SVGElement, string, null, undefined>;

  private topLine: Selection<SVGPathElement, string, null, undefined> | null;
  private bottomLine: Selection<SVGPathElement, string, null, undefined> | null;
  private leftLine: Selection<SVGPathElement, string, null, undefined> | null;
  private rightLine: Selection<SVGPathElement, string, null, undefined> | null;

  private bounds: GraphBounds | null;

  constructor(__parent: Selection<SVGElement, string, null, undefined>) {
    this.root = __parent.append('g');
    this.root.attr("parts-name", this.constructor.name);
  }

  public init(bounds: GraphBounds): void {
    this.topLine = this.prepareLine(this.isTop, bounds.left, bounds.top);
    this.bottomLine = this.prepareLine(this.isBottom, bounds.left, bounds.bottom);
    this.leftLine = this.prepareLine(this.isLeft, bounds.left, bounds.top);
    this.rightLine = this.prepareLine(this.isRight, bounds.right, bounds.top);
  }

  public show(bounds: GraphBounds): void {
    this.root.attr("display", "block");
    this.update(bounds);
  }

  public update(bounds: GraphBounds): void {
    this.bounds = bounds;

    this.expandLine(this.topLine, bounds.left, bounds.top, bounds.right, bounds.top, this.showDuration);
    this.expandLine(this.bottomLine, bounds.left, bounds.bottom, bounds.right, bounds.bottom, this.showDuration);
    this.expandLine(this.leftLine, bounds.left, bounds.top, bounds.left, bounds.bottom, this.showDuration);
    this.expandLine(this.rightLine, bounds.right, bounds.top, bounds.right, bounds.bottom, this.showDuration);
  }

  public hide(): void {
    if (!this.bounds)
      return;

    const bounds = this.bounds;
    this.expandLine(this.topLine, bounds.right, bounds.top, bounds.left, bounds.top, this.hideDuration);
    this.expandLine(this.bottomLine, bounds.right, bounds.bottom, bounds.left, bounds.bottom, this.hideDuration);
    this.expandLine(this.leftLine, bounds.left, bounds.bottom, bounds.left, bounds.top, this.hideDuration);
    this.expandLine(this.rightLine, bounds.right, bounds.bottom, bounds.right, bounds.top, this.hideDuration);
  }

  private prepareLine(__isNeed: boolean, __fromX: number, __fromY: number): any {
    if (__isNeed) {
      let path = this.root.append("path");

      path
        .attr("stroke-width", this.lineWidth)
        .attr("stroke", this.color)
        .attr("d", "M " + __fromX + " " + __fromY + " L " + __fromX + " " + __fromY)
      if (this.isDashed)
        path.attr("stroke-dasharray", "1,1")
      return path;
    } else {
      return null;
    }
  }

  private expandLine(__line: any, __fromX: number, __fromY: number, __toX: number, __toY: number, __duration: number): void {
    if (!__line)
      return;

    __line
      .transition()
      .duration(__duration)
      .ease(d3.easeExpOut)
      .attr("d", "M " + __fromX + " " + __fromY + " L " + __toX + " " + __toY)
  }

};
