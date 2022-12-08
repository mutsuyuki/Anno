import * as d3 from 'd3'
import {GraphValue} from "./GraphValue";
import {Area, CurveFactory} from "d3-shape";
import {ScaleLinear} from "d3-scale";

export default class GraphLineArea {

  public dataIndex: number = 0;    // datasetのyValuesのうち、どのデータを使うか
  public color: string = "#888"; // "url(#some-pattern)" などと指定するとsvgのパターンを適用可能
  public opacity: number = 0.3;
  public curveType: CurveFactory = d3.curveLinear;
  public showDuration: number = 600;
  public hideDuration: number = 500;
  public moveDuration: number = 800;


  private root: any;
  private fill: any;

  private zeroData: GraphValue[] = [new GraphValue("_", [0])];
  private dataset: GraphValue[] = [new GraphValue("_", [0])];

  private areaFunction: Area<any> = d3.area();
  private xScaler: any = d3.scaleLinear();
  private yScaler: ScaleLinear<any, any> = d3.scaleLinear();

  constructor(__parent: any) {
    this.root = __parent.append('g');
    this.fill = this.root.append("path");
  }

  public init(__dataset: GraphValue[], __xScaler: any, __yScaler: ScaleLinear<any, any>): void {
    this.dataset = __dataset;
    this.xScaler = __xScaler;
    this.yScaler = __yScaler;

    this.makeAreaFunction();
    this.makeZeroData();
    this.initParts();
  }

  public destroy(): void {
    this.root.remove();
  }

  private makeAreaFunction(): void {
    let offsetX: number = this.xScaler.hasOwnProperty("bandwidth") ? this.xScaler.bandwidth() / 2 : 0;
    this.areaFunction = d3.area()
      .curve(this.curveType)
      .x((_, i) => this.xScaler(this.dataset[i].xValue) + offsetX)
      .y0((d: any) => this.yScaler(0))
      .y1((d: any) => this.yScaler(d));
  }

  private makeZeroData(): void {
    this.zeroData = [];

    for (var i = 0; i < this.dataset.length; i++) {
      var record: GraphValue = new GraphValue(
        this.dataset[i].xValue,
        this.dataset[i].yValues.map((d) => 0)
      );

      this.zeroData.push(record);
    }
  }

  private initParts(): void {
    let yValues: number[] = this.zeroData.map((d: GraphValue) => d.yValues[this.dataIndex]);

    this.fill
      .style("fill", this.color)
      .attr('fill-opacity', this.opacity)
      .attr('d', this.areaFunction(yValues));
  }

  public show(): void {
    this.root.attr("display", "block");
    this.moveArea(this.showDuration);
  }

  private moveArea(__duration: number): void {
    var yValues: number[] = this.dataset.map((d: GraphValue) => d.yValues[this.dataIndex]);

    this.fill
      .interrupt()
      .transition()
      .duration(__duration)
      .ease(d3.easeExpOut)
      .style("fill", this.color)
      .attr('fill-opacity', this.opacity)
      .attr('d', this.areaFunction(yValues));
  }

  public update(__dataset: GraphValue[], __xScaler: any, __yScaler: ScaleLinear<any, any>): void {
    this.dataset = __dataset;
    this.xScaler = __xScaler;
    this.yScaler = __yScaler;

    this.makeAreaFunction();
    this.moveArea(this.moveDuration);
  }


  public resize(__xScaler: any, __yScaler: ScaleLinear<any, any>):void{
    this.xScaler = __xScaler;
    this.yScaler = __yScaler;

    let tempDuration:number = this.moveDuration;
    this.moveDuration = 0;
    this.update(this.dataset,this.xScaler,this.yScaler);
    this.moveDuration = tempDuration;
  }


  public hide(): void {
    var yValues: number[] = this.zeroData.map((d: GraphValue) => d.yValues[this.dataIndex]);

    this.fill
      .interrupt()
      .transition()
      .duration(this.hideDuration)
      .attr('d', this.areaFunction(yValues));
  }

};
