import * as d3 from 'd3'
import {Selection} from "d3-selection";
import {ScaleBand} from "d3-scale";
import {Dispatch} from "d3-dispatch";
import GraphValue from "../core/GraphValue";

export default class GrouphBarTouchArea {

  public dataIndex: number = 0;     // datasetのyValuesのうち、どのデータを使うか

  private parent: any;
  private root: Selection<SVGElement, string, null, undefined>;

  private bars: any;
  private labelData: GraphValue<string>[] = [new GraphValue("_",[0])];
  private height: number = 0;

  private dataset: GraphValue<string>[] = [new GraphValue("_", [0])];
  private xScaler: ScaleBand<string> = d3.scaleBand();

  public dispatcher: Dispatch<any>;

  static MOUSE_ENTER: string = "on_mouseenter";
  static CLICK: string = "on_bar_click";

  constructor(__parent: Selection<SVGElement, string, null, undefined>) {
    this.dispatcher = d3.dispatch(GrouphBarTouchArea.MOUSE_ENTER, GrouphBarTouchArea.CLICK);
    this.parent = __parent;
    this.root = __parent.append('g');
    this.root.attr("parts-name", this.constructor.name);
    this.bars = this.root.selectAll("rect");
  }

  public init(dataset: GraphValue<string>[], xScaler: ScaleBand<string>) {
    this.height = parseInt(this.parent.node().clientHeight);
    this.labelData = dataset;
    this.dataset = dataset;
    this.xScaler = xScaler;
    this.bindData();

    this.bars
      .attr("x", (d: GraphValue<string>) => xScaler(d.xValue))
      .attr("width", xScaler.bandwidth())
      .attr("y", 0)
      .attr("height", this.height)
      .attr("opacity", 0)
      .on("mouseenter", (d: GraphValue<string>) => {
        this.dispatcher.call(GrouphBarTouchArea.MOUSE_ENTER, this, d);
      })
  }

  protected bindData(): void {
    let update: any = this.bars.data(this.labelData);
    let enter: any = update.enter().append("rect");
    update.exit().remove();
    this.bars = update.merge(enter);

    this.bars.data(this.labelData);
  }

  public enableClick(): void {
    this.bars
      .attr("cursor", "pointer")
      .on("click", (d: GraphValue<string>) => {
        this.dispatcher.call(GrouphBarTouchArea.CLICK, this, d);
      });
  }

  public disableClick(): void {
    this.bars
      .attr("cursor", "auto")
      .on("click", null);
  }

  public show(): void {
    this.root.attr("display", "block");
  }

  public hide(): void {
    this.root.attr("display", "none");
  }
};
