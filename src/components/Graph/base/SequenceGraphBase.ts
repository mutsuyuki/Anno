import * as d3 from 'd3'
import {ScaleBand, ScaleLinear} from "d3-scale";
import {GraphValue} from "../parts/GraphValue";
import GraphBase from "./GraphBase";
import SingleGraphBase from "./SingleGraphBase";

export default class SequenceGraphBase extends SingleGraphBase {

  public minimumMinX: number = 10;    // データが大きい値ばかりのときこの値をスケールの最小とする
  public minimumMaxX: number = 3;    // データが小さい値ばかりのときこの値をスケールの最大とする

  private xMin: number = 0;
  private xMax: number = 3;

  protected xScaler: ScaleLinear<any, any> = d3.scaleLinear();

  protected makeXScaler(): void {
    this.xMin = Math.min(this.minimumMinX, d3.min(this.dataset, (d: GraphValue) => +d.xValue));
    this.xMax = Math.max(this.minimumMaxX, d3.max(this.dataset, (d: GraphValue) => +d.xValue));
    this.xScaler = d3.scaleLinear()
      .domain([this.xMin, this.xMax])
      .range([this.marginLeft, this.svgWidth  - this.marginRight]);
  }

}
