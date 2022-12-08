export class GraphValue {
  public xValue: string | number | Date = 0; // string , number , date
  public yValues: number[] = [];

  constructor(__xValue: any, __yValues: number[]) {
    this.xValue = __xValue;
    this.yValues = __yValues;
  }
}

