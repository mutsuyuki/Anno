import {Selection} from "d3-selection";
import {GraphBounds, ScaleLinearX} from "@/components/Graph/core/Types";
import * as d3 from "d3";

export type LabelRange = {
  start: number,
  end: number,
  label: string
}

export default class GraphHighlightLabel {

  public color: string = "#888";
  public showDuration: number = 300;
  public moveDuration: number = 600;
  public offsetX:number = 0;
  public offsetY:number = -16;

  private root: Selection<HTMLElement, string, null, undefined>;
  private labels: Selection<any, unknown, HTMLElement, string>;
  private labelHTML: string = "";

  private xScaler: ScaleLinearX = d3.scaleLinear();
  private bounds: GraphBounds | null = null;

  constructor(__parent: Selection<HTMLElement, string, null, undefined>) {
    this.root = __parent.append('div');
    this.root.attr("parts-name", this.constructor.name);
    this.labels = this.root.selectAll("div");

    this.labelHTML = `
      <div style="
             display:flex; 
             justify-content: center; 
             align-items: center; 
             overflow: hidden
           " 
      >
        <div style="width: 1px; height:5px; background: darkgray"></div>
        <div style="height: 1px; flex:1; background: darkgray"></div>
        <p style="font-size:10px; padding:0 5px; color:darkgray; white-space: nowrap;">text</p>
        <div style="height: 1px; flex:1; background: darkgray"></div>
        <div style="width: 1px; height:5px; background: darkgray"></div>
      </div>
    `;
  }

  public init(xScaler: ScaleLinearX, bounds: GraphBounds): void {
    this.xScaler = xScaler;
    this.bounds = bounds;
    this.labels.remove();
    this.labels = this.root.selectAll("div");
    this.fitPartsCount([], bounds);
  }

  private fitPartsCount(ranges: LabelRange[], bounds: GraphBounds): void {
    const update: any = this.labels.data(ranges);
    const enter: any = update.enter().append("div");
    this.initParts(enter, bounds);
    update.exit().remove();
    this.labels = update.merge(enter);
  }

  private initParts(newLabels: any, bounds: GraphBounds): void {
    newLabels
      .style("position", "absolute")
      .style("left", (d: LabelRange) => (this.xScaler(d.start) + this.offsetX) + "px")
      .style("top", (bounds.top + this.offsetY) + "px")
      .style("width", (d: LabelRange) => (this.xScaler(d.end) - this.xScaler(d.start)) + "px")
      .each((d: LabelRange, i: number, nodes: any) => {
        const node = nodes[i];
        node.innerHTML = this.labelHTML;
        node.querySelector("p").innerText = d.label;
      })
  }

  public show(): void {
    this.root.attr("display", "block");
    this.root
      .interrupt()
      .transition()
      .duration(this.showDuration)
      .style("opacity", 1)
  }

  private moveParts(bounds: GraphBounds): void {
    this.labels
      .interrupt()
      .transition()
      .duration(this.moveDuration)
      .style("left", (d: LabelRange) => (this.xScaler(d.start) + this.offsetX) + "px")
      .style("top", (bounds.top + this.offsetY) + "px")
      .style("width", (d: LabelRange) => (this.xScaler(d.end) - this.xScaler(d.start)) + "px")
      .each((d: LabelRange, i: number, nodes: any) => {
        const node = nodes[i];
        node.querySelector("p").innerText = d.label;
      })
  }

  public update(ranges: LabelRange[], xScaler: ScaleLinearX, bounds: GraphBounds): void {
    this.xScaler = xScaler;
    this.bounds = bounds;
    this.fitPartsCount(ranges, bounds);
    this.moveParts(bounds);
  }

  public hide(): void {
    this.root
      .interrupt()
      .transition()
      .duration(300)
      .style("opacity", 0)
      .on("end", () => {
        this.root.attr("display", "none");
      })
  }
};
