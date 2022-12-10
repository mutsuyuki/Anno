import * as d3 from 'd3'
import {Selection} from "d3-selection";
import {CurveFactory,  Line} from "d3-shape";
import {ScaleLinear} from "d3-scale";
import GraphValue from "../core/GraphValue";
import {XAxisType} from "../core/Types";

export default class GraphLine {

  public dataIndex: number = 0;    // datasetのyValuesのうち、どのデータを使うか
  public color: string = "#888";
  public width: number = 1;
  public curveType: CurveFactory = d3.curveLinear;
  public showDuration:number = 600;
  public hideDuration:number = 500;
  public moveDuration:number = 800;

  private root: Selection<SVGElement, string, null, undefined>;

  private line: any;

  private zeroData: GraphValue<XAxisType>[] = [new GraphValue("_", [0])];
  private dataset: GraphValue<XAxisType>[] = [new GraphValue("_", [0])];

  private lineFunction: Line<any> = d3.line();
  private xScaler: any = d3.scaleLinear();
  private yScaler: ScaleLinear<any, any> = d3.scaleLinear();
  private isLineMoving: boolean = false;

  constructor(__parent: Selection<SVGElement, string, null, undefined>) {
    this.root = __parent.append('g');
    this.root.attr("parts-name", this.constructor.name);
    this.line = this.root.append("path");
  }

  public init(dataset: GraphValue<XAxisType>[], xScaler: ScaleLinear<any, any>, yScaler: ScaleLinear<any, any>): void {
    this.dataset = dataset;
    this.xScaler = xScaler;
    this.yScaler = yScaler;

    this.makeLineFunction();
    this.makeZeroData();
    this.initParts();
  }

  public destroy(): void {
    this.root.remove();
  }

  private makeLineFunction(): void {
    let offsetX: number = this.xScaler.hasOwnProperty("bandwidth") ? this.xScaler.bandwidth() / 2 : 0;
    this.lineFunction = d3.line()
      .curve(this.curveType)
      .x((_, i) => this.xScaler(+this.dataset[i].xValue) + offsetX)
      .y((d: any) => this.yScaler(d));
  }

  private makeZeroData(): void {
    this.zeroData = [];

    for (let i = 0; i < this.dataset.length; i++) {
      let record = new GraphValue(
        this.dataset[i].xValue,
        this.dataset[i].yValues.map((d) => 0)
      );

      this.zeroData.push(record);
    }
  }

  private initParts(): void {
    let yValues: number[] = this.zeroData.map((d: GraphValue<XAxisType>) => d.yValues[this.dataIndex]);

    this.line
      .attr('stroke', this.color)
      .attr('stroke-width', this.width)
      .attr('fill-opacity', 0)
      .attr('d', this.lineFunction(yValues));
  }

  public show(): void {
    this.root.attr("display", "block");
    this.moveLine(this.showDuration);
  }

  private moveLine(__duration:number): void {
    let yValues: number[] = this.dataset.map((d: GraphValue<XAxisType>) => d.yValues[this.dataIndex]);

    this.isLineMoving = true;
    this.line
      .interrupt()
      .transition()
      .duration(__duration)
      .ease(d3.easeExpOut)
      .attr('stroke', this.color)
      .attr('stroke-width', this.width)
      .attr('fill-opacity', 0)
      .attr('d', this.lineFunction(yValues))
      .on("end", () => this.isLineMoving = false)
    ;
  }

  public update(dataset: GraphValue<XAxisType>[], xScaler: any, yScaler: ScaleLinear<any, any>): void {
    this.dataset = dataset;
    this.xScaler = xScaler;
    this.yScaler = yScaler;

    this.makeLineFunction();
    this.moveLine(this.moveDuration);
  }

  public focus(__parent: any): void {
    __parent.node().appendChild(this.root.node());
    this.setFocus(1, this.width * 3);
  }

  public setFocus(__opacity: number, __width: number): void {
    if (this.line.attr("opacity") == __opacity && this.line.attr("stroke-width") == __width)
      return;

    if (this.isLineMoving) {
      this.line
        .attr("opacity", __opacity)
        .attr("stroke-width", __width);
    } else {
      this.line
        .transition()
        .duration(600)
        .ease(d3.easeExpOut)
        .attr("opacity", __opacity)
        .attr("stroke-width", __width);
    }
  }

  public unFocus(): void {
    this.setFocus(0.65, this.width);
  }

  public resetFocus(): void {
    this.setFocus(1, this.width);
  }

  public hide(): void {
    var yValues: number[] = this.zeroData.map((d: GraphValue<XAxisType>) => d.yValues[this.dataIndex]);

    this.line
      .interrupt()
      .transition()
      .duration(this.hideDuration)
      .attr('d', this.lineFunction(yValues));
  }
};
