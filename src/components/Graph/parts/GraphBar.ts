import * as d3 from 'd3'
import {Selection} from "d3-selection";
import {ScaleBand, ScaleLinear} from "d3-scale";
import GraphValue from "../core/GraphValue";

export default class GraphBar {

  public dataIndex: number = 0;     // datasetのyValuesのうち、どのデータを使うか
  public floatY: number = 0;        // x軸から浮かせる量
  public edgeRadius: number = 2;    // 角丸の量
  public color: string = "#888";
  public maxWidth: number = Infinity;
  public showDuration: number = 600;

  //１項目あたりに複数のバーを建てる場合の設定
  public barsPerLabel: number = 1;  // バーの数

  private root: Selection<SVGElement, string, null, undefined>;
  private bars: any;

  private dataset: GraphValue<string>[] = [new GraphValue("_", [0])];

  private xScaler: ScaleBand<string> = d3.scaleBand();
  private yScaler: ScaleLinear<any, any> = d3.scaleLinear();

  constructor(__parent: Selection<SVGElement, string, null, undefined>) {
    this.root = __parent.append('g');
    this.root.attr("parts-name", this.constructor.name);
    this.bars = this.root.selectAll("rect");
  }

  public init(dataset: GraphValue<string>[], xScaler: ScaleBand<string>, yScaler: ScaleLinear<any, any>): void {
    this.dataset = dataset;
    this.xScaler = xScaler;
    this.yScaler = yScaler;

    this.bars.remove();
    this.bars = this.root.selectAll("rect");
    this.fitPartsCount();
  }

  private fitPartsCount(): void {
    var update: any = this.bars.data(this.dataset);

    var enter: any = update.enter().append("rect");
    this.initParts(enter);

    update.exit().remove();

    this.bars = update.merge(enter);
  }

  private initParts(__bars: any): void {
    __bars
      .attr("rx", this.edgeRadius)
      .attr("ry", this.edgeRadius)
      .attr("fill", this.color)
      .attr("x", (d: GraphValue<string>) => this.getX(d))
      .attr("width", this.getWidth())
      .attr("y", this.yScaler(0))
      .attr("height", 0);
  }

  public show(): void {
    this.root.attr("display", "block");
    this.moveParts();
  }

  private moveParts(): void {
    this.bars
      .interrupt()
      .transition()
      .duration(this.showDuration)
      .attr("x", (d: GraphValue<string>) => this.getX(d))
      .attr("width", this.getWidth())
      .attr("y", (d: GraphValue<string>) => this.getY(d))
      .attr("height", (d: GraphValue<string>) => this.getHeight(d));
  }

  private getX(d: GraphValue<string>): number {
    const offset: number = (this.xScaler.bandwidth() - this.getWidth()) / 2;
    const baseX = this.xScaler(d.xValue) || 0;

    if (this.barsPerLabel <= 1) {
      return baseX + offset;
    } else {
      const unitWidth: number = this.getWidth();

      return baseX + offset
        + this.getWidth() / 2
        + unitWidth * this.dataIndex
        - unitWidth * (this.barsPerLabel / 2);
    }
  }

  private getWidth(): number {
    return Math.min(this.xScaler.bandwidth() / this.barsPerLabel, this.maxWidth);
  }

  private getY(d: GraphValue<string>): number {
    var distance: number = Math.abs(this.yScaler(d.yValues[this.dataIndex]) - this.yScaler(0));
    if (distance <= this.floatY) {
      return this.yScaler(0);
    } else {
      if (d.yValues[this.dataIndex] < 0) {
        return this.yScaler(0) + this.floatY;
      } else {
        return this.yScaler(d.yValues[this.dataIndex]);
      }
    }
  }

  private getHeight(d: GraphValue<string>): number {
    var distance: number = Math.abs(this.yScaler(d.yValues[this.dataIndex]) - this.yScaler(0));
    if (distance <= this.floatY) {
      return 0;
    } else {
      return Math.abs(this.yScaler(d.yValues[this.dataIndex]) - this.yScaler(0)) - this.floatY;
    }
  }

  public update(dataset: GraphValue<string>[], xScaler: ScaleBand<string>, yScaler: ScaleLinear<any, any>): void {
    this.dataset = dataset;
    this.xScaler = xScaler;
    this.yScaler = yScaler;

    this.fitPartsCount();
    this.moveParts();
  }

  public hide(): void {
    this.bars
      .interrupt()
      .transition()
      .duration(300)
      .attr("y", this.yScaler(0))
      .attr("height", 0)
      .on("end", () => {
        this.root.attr("display", "none");
      })
  }

};
