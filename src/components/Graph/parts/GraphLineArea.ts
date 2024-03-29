import * as d3 from 'd3'
import {Selection} from "d3-selection";
import {Area, CurveFactory} from "d3-shape";
import GraphValue from "../core/GraphValue";
import {LinearX, ScaleLinearX, ScaleY} from "../core/Types";

export default class GraphLineArea {

  public dataIndex: number = 0;    // datasetのyValuesのうち、どのデータを使うか
  public color: string = "#888"; // "url(#some-pattern)" などと指定するとsvgのパターンを適用可能
  public opacity: number = 0.3;
  public curveType: CurveFactory = d3.curveLinear;
  public showDuration: number = 600;
  public hideDuration: number = 500;
  public moveDuration: number = 800;


  private root: Selection<SVGElement, string, null, undefined>;

  private fill: any;

  private zeroData: GraphValue<LinearX>[] = [];
  private dataset: GraphValue<LinearX>[] = [];

  private areaFunction: Area<any> = d3.area();
  private xScaler: ScaleLinearX = d3.scaleLinear();
  private yScaler: ScaleY = d3.scaleLinear();

  constructor(__parent: Selection<SVGElement, string, null, undefined>) {
    this.root = __parent.append('g');
    this.fill = this.root.append("path");
  }

  public init(dataset: GraphValue<LinearX>[], xScaler: ScaleLinearX, yScaler: ScaleY): void {
    this.dataset = dataset;
    this.xScaler = xScaler;
    this.yScaler = yScaler;

    this.makeAreaFunction();
    this.makeZeroData();
    this.initParts();
  }

  public destroy(): void {
    this.root.remove();
  }

  private makeAreaFunction(): void {
    this.areaFunction = d3.area()
      .curve(this.curveType)
      .x((_, i) => this.xScaler(this.dataset[i].xValue))
      .y0((d: any) => this.yScaler(0))
      .y1((d: any) => this.yScaler(d));
  }

  private makeZeroData(): void {
    this.zeroData = [];

    for (var i = 0; i < this.dataset.length; i++) {
      var record = new GraphValue(
        this.dataset[i].xValue,
        this.dataset[i].yValues.map((d) => 0)
      );

      this.zeroData.push(record);
    }
  }

  private initParts(): void {
    let yValues: number[] = this.zeroData.map((d: GraphValue<LinearX>) => d.yValues[this.dataIndex]);

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
    var yValues: number[] = this.dataset.map((d: GraphValue<LinearX>) => d.yValues[this.dataIndex]);

    this.fill
      .interrupt()
      .transition()
      .duration(__duration)
      .ease(d3.easeExpOut)
      .style("fill", this.color)
      .attr('fill-opacity', this.opacity)
      .attr('d', this.areaFunction(yValues));
  }

  public update(dataset: GraphValue<LinearX>[], xScaler: ScaleLinearX, yScaler: ScaleY): void {
    this.dataset = dataset;
    this.xScaler = xScaler;
    this.yScaler = yScaler;

    this.makeAreaFunction();
    this.moveArea(this.moveDuration);
  }

  public hide(): void {
    var yValues: number[] = this.zeroData.map((d: GraphValue<LinearX>) => d.yValues[this.dataIndex]);

    this.fill
      .interrupt()
      .transition()
      .duration(this.hideDuration)
      .attr('d', this.areaFunction(yValues));
  }

};
