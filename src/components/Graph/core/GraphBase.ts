import * as d3 from 'd3'
import {Selection} from 'd3-selection'
import GraphValue from "./GraphValue";
import {GraphBounds, XAxisType} from "./Types";

// グラフクラスの土台
export default class GraphBase<T extends XAxisType> {

  public marginTop: number = 0;
  public marginBottom: number = 0;
  public marginLeft: number = 0;
  public marginRight: number = 0;

  protected root: Selection<HTMLElement, string, null, undefined>;
  protected svg: Selection<SVGElement, string, null, undefined>;

  private isInit: boolean = false;
  private isShow: boolean = false;

  constructor(rootElement: HTMLElement) {
    this.root = d3.select(rootElement);

    this.svg = this.root.append("svg")
      .style("margin", 0)
      .style("width", "100%")
      .style("height", "100%");

    //イベント登録
    new (window as any).ResizeObserver(() => this._resize()).observe(rootElement);
  }

  public show(dataset: GraphValue<T>[] | null = null): void {
    if (!this.isInit)
      if (dataset)
        this._init(dataset);
      else
        throw new Error("dataset is needed for init");

    if (!this.isShow)
      this._show();

    if (dataset)
      this._update(dataset);
  }

  public hide(): void {
    this._hide()
  }

  // please override
  protected _init(dataset: GraphValue<T>[]): void {
    this.isInit = true;
  }

  // please override
  protected _show(): void {
    this.isShow = true;
  }

  // please override
  protected _update(dataset: GraphValue<T>[]): void {
  }

  protected _hide(): void {
    this.isShow = false;
  }

  // please override
  protected _resize(): void {
  }

  protected getGraphBounds(): GraphBounds {
    const svgNode = this.svg.node();
    if (svgNode) {
      return {
        top: this.marginTop,
        bottom: svgNode.clientHeight - this.marginBottom,
        left: this.marginLeft,
        right: svgNode.clientWidth - this.marginRight,
        width: svgNode.clientWidth - (this.marginLeft + this.marginRight),
        height: svgNode.clientHeight - (this.marginTop + this.marginBottom)
      };
    } else {
      return {top: 0, bottom: 0, left: 0, right: 0, height: 0, width: 0};
    }
  }
}
