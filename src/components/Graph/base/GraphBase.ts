import * as d3 from 'd3'
import {ScaleLinear} from "d3-scale";
import {GraphValue} from "../parts/GraphValue";

export default class GraphBase {

  public marginTop: number = 0;
  public marginBottom: number = 0;
  public marginLeft: number = 0;
  public marginRight: number = 0;
  public paddingIn: number = 0.33;
  public paddingOut: number = 0;

  public minimumMinY: number = 0;    // データが大きい値ばかりのときこの値をスケールの最小とする
  public minimumMaxY: number = 2;    // データが小さい値ばかりのときこの値をスケールの最大とする
  public axisBuffer: number = 0.2;   // グラフの目盛りの最大まで行かないためのバッファ

  protected dataset: GraphValue[] | { [recordId: string]: GraphValue[] } = [];

  protected root: any;
  protected svg: any;

  protected svgWidth: number = 0;
  protected svgHeight: number = 0;
  protected graphWidth: number = 0;
  protected graphHeight: number = 0;
  protected yScaler: ScaleLinear<any, any> = d3.scaleLinear();

  protected yMin: number = 0;
  protected yMax: number = 0;

  protected isInited: boolean = false;

  constructor(__rootDivD3: any) {
    this.root = __rootDivD3;

    this.svg = this.root.append("svg")
      .style("margin", 0)
      .style("width", "100%")
      .style("height", "100%");

    window.addEventListener("resize", ()=>{
      this.resize();
    }, false);

  }

  public draw(__dataset: GraphValue[] | { [recordId: string]: GraphValue[] }): void {
    if (!this.isInited) {
      this.init(__dataset);
      this.show();
    } else {
      this.update(__dataset);
    }
  }

  protected init(__dataset: GraphValue[] | { [recordId: string]: GraphValue[] }): void {
    this.isInited = true;

    this.dataset = __dataset;
    this.updateSize();
  }

  private updateSize(): void {
    this.svgWidth = parseInt(this.svg.node().clientWidth);
    this.svgHeight = parseInt(this.svg.node().clientHeight);
    this.graphWidth = this.svgWidth - this.marginLeft - this.marginRight;
    this.graphHeight = this.svgHeight - this.marginTop - this.marginBottom;

    this.makeYScaler();
    this.makeXScaler();
  }

  protected show(): void {
  }

  protected update(__dataset: GraphValue[] | { [recordId: string]: GraphValue[] }): void {
    this.dataset = __dataset;
    this.updateSize();
  }

  public resize(): void {
    this.updateSize();
  }

  public hide(): void {
  }

  protected makeYScaler(): void {
    // for override
  }

  protected makeXScaler(): void {
    // for override
  }

}
