import * as d3 from 'd3'
import {Selection} from 'd3-selection'
import {BandX, GraphBounds, LinearX} from "./Types";

// グラフクラスの土台
export default class GraphBase<T extends LinearX | BandX> {

  public marginTop: number = 0;
  public marginBottom: number = 0;
  public marginLeft: number = 0;
  public marginRight: number = 0;

  protected parent: Selection<HTMLElement, string, null, undefined>;
  protected root: Selection<HTMLElement, string, null, undefined>;
  protected svg: Selection<SVGElement, string, null, undefined>;
  protected html: Selection<HTMLElement, string, null, undefined>;

  constructor(parent: HTMLElement) {
    this.parent = d3.select(parent);

    this.root = this.parent.append("div")
      .style("margin", 0)
      .style("padding", 0)
      .style("position", "relative")
      .style("width", "100%")
      .style("height", "100%");

    this.svg = this.root.append("svg")
      .style("margin", 0)
      .style("width", "100%")
      .style("height", "100%")
      .style("position", "absolute");

    this.html = this.root.append("div")
      .style("margin", 0)
      .style("padding", 0)
      .style("width", "100%")
      .style("height", "100%")
      .style("position", "absolute");

    //イベント登録
    new (window as any).ResizeObserver(() => this._resize()).observe(parent);
  }

  // please override
  protected _resize(): void {
  }

  protected getGraphBounds(): GraphBounds {
    const svgNode = this.svg.node();
    if (svgNode) {
      return {
        top: this.marginTop,
        bottom: svgNode.clientHeight - this.marginBottom,
        left: this.marginLeft,
        right: svgNode.clientWidth - this.marginRight,
        width: svgNode.clientWidth - (this.marginLeft + this.marginRight),
        height: svgNode.clientHeight - (this.marginTop + this.marginBottom)
      };
    } else {
      return {top: 0, bottom: 0, left: 0, right: 0, height: 0, width: 0};
    }
  }
}
