import * as d3 from 'd3'
import {ScaleBand, ScaleLinear, ScaleTime} from "d3-scale";
import {GraphValue} from "../parts/GraphValue";
import GraphBase from "./GraphBase";
import SingleGraphBase from "./SingleGraphBase";

export default class TimeGraphBase extends SingleGraphBase {

  public minimumMinX: Date;    // データが大きい値ばかりのときこの値をスケールの最小とする
  public minimumMaxX: Date;    // データが小さい値ばかりのときこの値をスケールの最大とする

  protected xMin: Date = new Date();
  protected xMax: Date = new Date();

  protected xScaler: ScaleTime<any, any> = d3.scaleTime();


  protected makeXScaler(): void {
    this.xMin = d3.min(this.dataset, (d: GraphValue) => d.xValue);
    if(this.minimumMinX)
      this.xMin = d3.min([this.minimumMinX, this.xMin]);

    this.xMax = d3.max(this.dataset, (d: GraphValue) => d.xValue);
    if(this.minimumMaxX)
      this.xMax = d3.min([this.minimumMaxX, this.xMax]);

    this.xScaler = d3.scaleTime()
      .domain([this.xMin, this.xMax])
      .range([this.marginLeft, this.svgWidth  - this.marginRight]);

  }


}
