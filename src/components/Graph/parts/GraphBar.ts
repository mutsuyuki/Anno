import * as d3 from 'd3'
import {Selection} from "d3-selection";
import {ScaleBand, ScaleLinear} from "d3-scale";
import GraphValue from "../core/GraphValue";

export default class GraphBar {

  public dataIndex: number = 0;     // datasetのyValuesのうち、どのデータを使うか
  public floatY: number = 0;        // x軸から浮かせる量
  public edgeRadius: number = 0;    // 角丸の量
  public color: string = "#888";
  public maxWidth: number = Infinity;
  public showDuration: number = 600;

  //１項目あたりに複数のバーを建てる場合の設定
  public barsPerLabel: number = 1;  // バーの数
  public barPadding: number = 0;   // バー間の距離


  private root: Selection<SVGElement, string, null, undefined>;

  private bars: any;

  private dataset: GraphValue[] = [new GraphValue("_", [0])];

  private xScaler: ScaleBand<string> = d3.scaleBand();
  private yScaler: ScaleLinear<any, any> = d3.scaleLinear();

  constructor(__parent: Selection<SVGElement, string, null, undefined>) {
    this.root = __parent.append('g');
    this.bars = this.root.selectAll("rect");
  }

  public init(__dataset: GraphValue[], __xScaler: ScaleBand<string>, __yScaler: ScaleLinear<any, any>): void {
    this.dataset = __dataset;
    this.xScaler = __xScaler;
    this.yScaler = __yScaler;

    this.bars.remove();
    this.bars = this.root.selectAll("rect");
    this.fitPartsCount();
  }

  public resize(__xScaler: ScaleBand<string>, __yScaler: ScaleLinear<any, any>): void {
    this.yScaler = __yScaler;
    this.xScaler = __xScaler;

    this.initParts(this.bars);
    let saveDuration = this.showDuration;
    this.showDuration = 0;
    this.moveParts();
    this.showDuration = saveDuration;
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
      .attr("x", (d: GraphValue) => this.getX(d))
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
      .attr("x", (d: GraphValue) => this.getX(d))
      .attr("width", this.getWidth())
      .attr("y", (d: GraphValue) => this.getY(d))
      .attr("height", (d: GraphValue) => this.getHeight(d));
  }

  private getX(d: GraphValue): number {
    var offset: number = (this.xScaler.bandwidth() - this.getWidth()) / 2;
    if (this.barsPerLabel <= 1) {
      return this.xScaler(d.xValue) + offset;
    } else {
      var unitWidth: number = this.getWidth() + this.barPadding;

      return this.xScaler(d.xValue) + offset
        + this.getWidth() / 2
        + unitWidth * this.dataIndex
        - unitWidth * (this.barsPerLabel / 2)
        + this.barPadding / 2;
    }
  }

  private getWidth(): number {
    return Math.min(this.xScaler.bandwidth(), this.maxWidth);
  }

  private getY(d: GraphValue): number {
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

  private getHeight(d: GraphValue): number {
    var distance: number = Math.abs(this.yScaler(d.yValues[this.dataIndex]) - this.yScaler(0));
    if (distance <= this.floatY) {
      return 0;
    } else {
      return Math.abs(this.yScaler(d.yValues[this.dataIndex]) - this.yScaler(0)) - this.floatY;
    }
  }

  public update(__dataset: GraphValue[], __xScaler: ScaleBand<string>, __yScaler: ScaleLinear<any, any>): void {
    this.dataset = __dataset;
    this.xScaler = __xScaler;
    this.yScaler = __yScaler;

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
