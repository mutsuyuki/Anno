import * as d3 from 'd3'
import {GraphValue} from "../parts/GraphValue";
import GraphBase from "./GraphBase";

export default class SingleGraphBase extends GraphBase{

  protected dataset: GraphValue[] = [];

  public draw(__dataset: GraphValue[]): void {
    super.draw(__dataset);
  }

  protected init(__dataset: GraphValue[] ): void {
    super.init(__dataset);
  }

  protected update(__dataset: GraphValue[]): void {
    super.update(__dataset);
  }

  protected makeYScaler(): void {
    var dataMax: number = d3.max(this.dataset, (d: GraphValue) => d3.max(d.yValues));
    var regulateMax: number = Math.max(dataMax, this.minimumMaxY);
    this.yMax = regulateMax + (regulateMax * this.axisBuffer);

    var dataMin: number = d3.min(this.dataset, (d: GraphValue) => d3.min(d.yValues));
    var regulateMin: number = Math.min(dataMin, this.minimumMinY);
    this.yMin = (regulateMin == 0) ? 0 : dataMin - (regulateMin * this.axisBuffer);

    this.yScaler = d3.scaleLinear()
      // .domain([this.yMin, this.yMax])
      .domain([-1, 1])
      .range([this.svgHeight - this.marginBottom, this.marginTop]);
  }
}
