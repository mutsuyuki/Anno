import * as d3 from 'd3'
import {ScaleLinear} from "d3-scale";
import {GraphValue} from "../parts/GraphValue";
import GraphBase from "./GraphBase";

export default class MultiGraphBase extends GraphBase {

  protected dataset: { [recordId: string]: GraphValue[] } = {};

  public draw(__dataset: { [recordId: string]: GraphValue[] }): void {
    super.draw(__dataset);
  }

  protected init(__dataset: { [recordId: string]: GraphValue[] }): void {
    super.init(__dataset);
  }

  protected update(__dataset: { [recordId: string]: GraphValue[] }): void {
    super.update(__dataset);
  }

  protected makeYScaler(): void {
    let dataMax: number = -Number.MAX_VALUE;
    let dataMin: number = Number.MAX_VALUE;
    for (let recordId in this.dataset) {
      dataMax = d3.max([dataMax, d3.max(this.dataset[recordId], (d: GraphValue) => d3.max(d.yValues))]);
      dataMin = d3.min([dataMin, d3.min(this.dataset[recordId], (d: GraphValue) => d3.min(d.yValues))]);
    }

    let regulateMax: number = Math.max(dataMax, this.minimumMaxY);
    let regulateMin: number = Math.min(dataMin, this.minimumMinY);

    this.yMax = regulateMax + (regulateMax * this.axisBuffer);
    this.yMin = (regulateMin == 0) ? 0 : dataMin - (regulateMin * this.axisBuffer);

    this.yScaler = d3.scaleLinear()
      .domain([this.yMin, this.yMax])
      .range([this.svgHeight - this.marginBottom, this.marginTop]);
  }

}
