import {BandX, LinearX} from "./Types";


// グラフデータ
export default class GraphValue<T extends LinearX | BandX> {
  public xValue: T;
  public yValues: number[];

  constructor(__xValue: T, __yValues: number[]) {
    this.xValue = __xValue;
    this.yValues = __yValues;
  }
}
