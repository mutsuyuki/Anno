import * as d3 from 'd3'
import {ScaleBand, ScaleLinear} from "d3-scale";
import {GraphValue} from "./GraphValue";

/**
 * Created by muttuwo on 2017/04/18.
 */
export default class GraphTooltip {

  public dataIndex: number = 0;     // datasetのyValuesのうち、どのデータを使うか
  public offsetY: number = -10;      // ツールチップのoffset位置
  public showDuration: number = 300;
  public showDelay: number = 0;
  public hideDuration: number = 300;
  public hideDelay: number = 0;
  public showOpaciy: number = 1;
  public hideOpaciy: number = 0;
  public easing: Function = d3.easeSinOut;
  public isPlusmark: boolean = false;  // ツールチップの値が数値のとき、正の値に+マーク付与
  public decimalDigit: number = 1;

  private tooltip: any;

  private xScaler: any = d3.scaleLinear();
  private yScaler: ScaleLinear<any, any> = d3.scaleLinear();

  constructor(__tooltipDiv: any) {
    this.tooltip = __tooltipDiv;
  }

  public init( __xScaler: ScaleBand<string>, __yScaler: ScaleLinear<any, any>): void {
    this.xScaler = __xScaler;
    this.yScaler = __yScaler;
  }

  public setContent(__content: string): void {
    let text: string = "";
    if(isNaN(<any>__content)){
      text = __content;
    }else{
      let value: string = (+__content ).toFixed(this.decimalDigit);
      text = (+value > 0 && this.isPlusmark) ? "+" + value : value;
    }
    this.tooltip.select('div').text(text);
  }

  public show(__d: GraphValue, __xScaler: any , __yScaler: ScaleLinear<any, any> ): void {
    this.xScaler = __xScaler;
    this.yScaler = __yScaler;
    this.move(__d);

    // this.fadeTo(this.showOpaciy, this.showDuration, this.showDelay);
    this.tooltip.attr("class", "tooltip is-show");
  }

  public resize(__xScaler: any ,__yScaler: ScaleLinear<any, any> ){
    this.init(__xScaler, __yScaler);
  }

  public hide(): void {
    // this.fadeTo(this.hideOpaciy, this.hideDuration, this.hideDelay);
    this.tooltip.attr("class", "tooltip");
  }

  // public fadeTo(__end: number, __duration: number = 500, __delay: number = 0): void {
  //   this.tooltip
  //     .transition()
  //     .ease(this.easing)
  //     .duration(__duration)
  //     .delay(__delay)
  //     .style("opacity", __end)
  // }

  private move(__d: GraphValue): void {
    let offsetX:number = this.xScaler.hasOwnProperty("bandwidth") ? this.xScaler.bandwidth() / 2 : 0;
    let x: number = this.xScaler(__d.xValue) + offsetX;
    let y: number = __d.yValues[this.dataIndex] > 0
      ? this.yScaler(__d.yValues[this.dataIndex]) + this.offsetY
      : this.yScaler(0) + this.offsetY;

    this.tooltip
      .style("left", x + "px")
      .style("top", y + "px");
  }

}
