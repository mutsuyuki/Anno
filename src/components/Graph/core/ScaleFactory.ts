import * as d3 from 'd3'
import {ScaleLinear} from "d3-scale";
import GraphValue from "./GraphValue";
import {BandX, LinearX, ScaleBandX, ScaleLinearX, ScaleY} from "./Types";

export default class ScaleFactory {

  public static newScaleLinearX(dataset: GraphValue<LinearX>[], left: number, right: number): ScaleLinearX {
    const xMin: LinearX = d3.min(dataset, (d: GraphValue<LinearX>) => d.xValue) || 0;
    const xMax: LinearX = d3.max(dataset, (d: GraphValue<LinearX>) => d.xValue) || 1;

    return d3.scaleLinear()
      .domain([xMin, xMax])
      .range([left, right]);
  }

  public static newScaleBandX(dataset: GraphValue<BandX>[], left: number, right: number, paddingInner: number = 0.1, paddingOuter: number = 0.1): ScaleBandX {
    return d3.scaleBand()
      .domain(dataset.map((d: GraphValue<BandX>) => d.xValue))
      .range([left, right])
      .paddingInner(paddingInner)
      .paddingOuter(paddingOuter)
      .align(0.5);
  }

  public static newScaleLinearY(dataset: GraphValue<LinearX>[], bottom: number, top: number): ScaleY {
    const yMin: number = d3.min(dataset, (d: GraphValue<LinearX>) => d3.min(d.yValues)) || 0;
    const yMax: number = d3.max(dataset, (d: GraphValue<LinearX>) => d3.max(d.yValues)) || 1;

    return d3.scaleLinear()
      .domain([yMin, yMax])
      .range([bottom, top]);
  }

  public static newFixedScaleLinearY(yMin: number, yMax: number, bottom: number, top: number): ScaleY {
    return d3.scaleLinear()
      .domain([yMin, yMax])
      .range([bottom, top]);
  }
}
