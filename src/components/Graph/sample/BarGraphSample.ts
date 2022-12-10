import GraphBase from "../core/GraphBase";
import ScaleFactory from "../core/ScaleFactory";
import GraphValue from "../core/GraphValue";
import {GraphBounds} from "../core/Types";
import AxisLabel from "../parts/AxisLabel";
import AxisRuler from "../parts/AxisRuler";
import {AxisDirection} from "../parts/AxisDirection";
import GraphFrame from "@/components/Graph/parts/GraphFrame";
import GraphBar from "@/components/Graph/parts/GraphBar";

export default class BarGraphSample extends GraphBase<string> {

  private leftLabel: AxisLabel;
  private bottomLabel: AxisLabel;
  private horizonRuler: AxisRuler;
  private verticalRuler: AxisRuler;
  private graphFrame: GraphFrame;
  private bars:GraphBar[]

  private dataset: GraphValue<string>[] = [];

  private colors: string[] = [
    "rgba(255, 99, 100, 1)",
    "rgba(104, 235, 162, 1)",
    "rgba(100, 206, 255, 1)",
  ]

  constructor(rootElement: HTMLElement) {
    super(rootElement);

    this.leftLabel = new AxisLabel(this.svg);
    this.leftLabel.axisDirection = AxisDirection.HORIZONTAL;
    this.leftLabel.color = "#7B848F";
    this.leftLabel.ticks = 4;
    this.leftLabel.moveDuration = 0;

    this.bottomLabel = new AxisLabel(this.svg);
    this.bottomLabel.axisDirection = AxisDirection.VERTICAL;
    this.bottomLabel.color = "#7B848F";
    this.bottomLabel.ticks = 8;
    this.bottomLabel.moveDuration = 0;

    this.horizonRuler = new AxisRuler(this.svg);
    this.horizonRuler.axisDirection = AxisDirection.HORIZONTAL;
    this.horizonRuler.color = "#EDF0F1";
    this.horizonRuler.ticks = 4;
    this.horizonRuler.moveDuration = 0;

    this.verticalRuler = new AxisRuler(this.svg);
    this.verticalRuler.axisDirection = AxisDirection.VERTICAL;
    this.verticalRuler.color = "#EDF0F1";
    this.verticalRuler.ticks = 8;
    this.verticalRuler.moveDuration = 0;

    this.graphFrame = new GraphFrame(this.svg);
    this.graphFrame.isRight = false;
    this.graphFrame.isLeft = false;

    this.bars = [];
  }

  public show(dataset: GraphValue<string>[]) {
    super.show(dataset);
  }

  protected _init(dataset: GraphValue<string>[]): void {
    super._init(dataset);

    this.dataset = dataset;
    const bounds = this.getGraphBounds();
    const [xScaler, yScaler] = this.getScalers(dataset, bounds);

    this.leftLabel.init(yScaler, bounds.left, 0);
    this.bottomLabel.init(xScaler, 0, bounds.bottom);
    this.horizonRuler.init(yScaler, bounds.left, 0);
    this.verticalRuler.init(xScaler, 0, this.marginTop);
    this.graphFrame.init(bounds);

    this.bars = [];
    for (let i = 0; i < this.dataset[0].yValues.length; i++) {
      const bar = new GraphBar(this.svg);
      bar.dataIndex = i;
      bar.barsPerLabel = 3;
      bar.color = this.colors[i];
      bar.init(this.dataset, xScaler, yScaler);
      this.bars.push(bar);
    }
  }

  protected _show(): void {
    super._show();

    const bounds = this.getGraphBounds();

    this.leftLabel.show();
    this.bottomLabel.show();
    this.horizonRuler.show(bounds.width);
    this.verticalRuler.show(bounds.height);
    this.graphFrame.show(bounds);
    this.bars.forEach(v => v.show());
  }

  protected _update(dataset: GraphValue<string>[]): void {
    super._update(dataset);

    this.dataset = dataset;
    const bounds = this.getGraphBounds();
    const [xScaler, yScaler] = this.getScalers(dataset, bounds);

    this.leftLabel.update(yScaler);
    this.bottomLabel.update(xScaler);
    this.horizonRuler.update(yScaler, bounds.width);
    this.verticalRuler.update(xScaler, bounds.height);
    this.graphFrame.update(bounds);
    this.bars.forEach(v => v.update(this.dataset, xScaler, yScaler));
  }

  protected _hide(): void {
    this.leftLabel.hide();
    this.bottomLabel.hide();
    this.horizonRuler.hide();
    this.verticalRuler.hide();
    this.graphFrame.hide();

    this.bars.forEach(v => v.hide());
  }

  protected _resize(): void {
    super._resize();
    this._update(this.dataset);
  }

  private getScalers(dataset: GraphValue<string>[], bounds: GraphBounds) {
    const xScaler = ScaleFactory.newScaleBandX(dataset, bounds.left, bounds.right)
    const yScaler = ScaleFactory.newFixedScaleLinearY(0, 2, bounds.bottom, bounds.top)

    return [xScaler, yScaler];
  }

};
