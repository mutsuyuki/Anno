import * as d3 from 'd3'
import {ScaleTime} from "d3-scale";
import {GraphValue} from "../parts/GraphValue";
import MultiGraphBase from "./MultiGraphBase";

export default class MultiTimeGraphBase extends MultiGraphBase {

  public minimumMaxX: Date;    // データが小さい値ばかりのときこの値をスケールの最大とする
  public minimumMinX: Date;    // データが大きい値ばかりのときこの値をスケールの最小とする

  protected xMin: Date = new Date();
  protected xMax: Date = new Date();

  protected xScaler: ScaleTime<any, any> = d3.scaleTime();

  protected makeXScaler(): void {
    let dataMax: Date = new Date(1970, 1, 1);
    let dataMin: Date = new Date(9999, 12, 31);
    for (let recordId in this.dataset) {
      dataMax = d3.max([dataMax, d3.max(this.dataset[recordId], (d: GraphValue) => d.xValue)]);
      dataMin = d3.min([dataMin, d3.min(this.dataset[recordId], (d: GraphValue) => d.xValue)]);
    }

    this.xMax = this.minimumMaxX ? d3.min([this.minimumMaxX, dataMax]) : dataMax;
    this.xMin = this.minimumMinX ? d3.min([this.minimumMinX, dataMin]) : dataMin;

    this.xScaler = d3.scaleTime()
      .domain([this.xMin, this.xMax])
      .range([this.marginLeft, this.svgWidth - this.marginRight]);
  }

}
