import * as d3 from 'd3'
import {ScaleLinear} from "d3-scale";
import GraphValue from "./GraphValue";
import {XAxisType} from "./Types";

export default class ScaleFactory {

  public static newScaleLinearX(dataset: GraphValue<number>[], left: number, right: number): ScaleLinear<number, number, never> {
    const xMin: number = d3.min(dataset, (d: GraphValue<number>) => d.xValue) || 0;
    const xMax: number = d3.max(dataset, (d: GraphValue<number>) => d.xValue) || 1;

    return d3.scaleLinear()
      .domain([xMin, xMax])
      .range([left, right]);
  }

  public static makeScaleDateX(dataset: GraphValue<Date>[], left: number, right: number) {
    const xMin: Date = d3.min(dataset, (d: GraphValue<Date>) => d.xValue as Date) || new Date();
    const xMax: Date = d3.max(dataset, (d: GraphValue<Date>) => d.xValue as Date) || new Date();

    return d3.scaleTime()
      .domain([xMin, xMax])
      .range([left, right]);
  }

  public static makeScaleBandX(dataset: GraphValue<string>[], left: number, right: number, paddingInner: number = 0.1, paddingOuter: number = 0.1): d3.ScaleBand<string> {
    return d3.scaleBand()
      .domain(dataset.map((d: GraphValue<string>) => d.xValue))
      .range([left, right])
      .paddingInner(paddingInner)
      .paddingOuter(paddingOuter)
      .align(0.5);
  }

  public static newScaleLinearY(dataset: GraphValue<XAxisType>[], top: number, bottom: number): ScaleLinear<number, number, never> {
    const yMin: number = d3.min(dataset, (d: GraphValue<XAxisType>) => d3.min(d.yValues)) || 0;
    const yMax: number = d3.max(dataset, (d: GraphValue<XAxisType>) => d3.max(d.yValues)) || 1;

    return d3.scaleLinear()
      .domain([yMin, yMax])
      .range([bottom, top]);
  }

  public static newFixedScaleLinearY(yMin: number, yMax: number, top: number, bottom: number): ScaleLinear<number, number, never> {
    return d3.scaleLinear()
      .domain([yMin, yMax])
      .range([bottom, top]);
  }
}
