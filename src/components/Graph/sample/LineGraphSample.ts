import GraphBase from "../core/GraphBase";
import ScaleFactory from "../core/ScaleFactory";
import GraphValue from "../core/GraphValue";
import {GraphBounds, LinearX, ScaleLinearX, ScaleY} from "../core/Types";
import GraphLine from "../parts/GraphLine";
import AxisLabel from "../parts/AxisLabel";
import AxisRuler from "../parts/AxisRuler";
import {AxisDirection} from "../parts/AxisDirection";
import GraphFrame from "@/components/Graph/parts/GraphFrame";

export default class LineGraphSample extends GraphBase<LinearX> {

  private leftLabel: AxisLabel;
  private bottomLabel: AxisLabel;
  private horizonRuler: AxisRuler;
  private verticalRuler: AxisRuler;
  private graphFrame: GraphFrame;
  private lines: GraphLine[];

  private dataset: GraphValue<LinearX>[] = [];

  private isInit: boolean = false;
  private isShow: boolean = false;

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

    this.lines = [];
  }

  public show(dataset: GraphValue<LinearX>[] | null = null): void {
    // データが渡されてない場合は、表示処理のみ行って終了
    if (!dataset) {
      if (this.isInit) {
        this.showParts();
      }
      return;
    }

    // データを保存
    this.dataset = dataset;

    // 表示処理
    if (!this.isInit) {
      this.isInit = true;
      this.initParts();
    }
    this.showParts();
    this.updateParts();
  }

  public hide(): void {
    if (this.isShow) {
      this.isShow = false;
      this.hideParts();
    }
  }

  private initParts(): void {
    const bounds = this.getGraphBounds();
    const [xScaler, yScaler] = this.getScalers(this.dataset, bounds);

    this.leftLabel.init(yScaler, bounds.left, 0);
    this.bottomLabel.init(xScaler, 0, bounds.bottom);
    this.horizonRuler.init(yScaler, bounds.left, 0);
    this.verticalRuler.init(xScaler, 0, this.marginTop);
    this.graphFrame.init(bounds);

    this.lines = [];
    for (let i = 0; i < this.dataset[0].yValues.length; i++) {
      const line = new GraphLine(this.svg);
      line.dataIndex = i;
      line.color = this.colors[i];
      line.moveDuration = 0;
      line.init(this.dataset, xScaler, yScaler);
      this.lines.push(line);
    }
  }

  private showParts(): void {
    const bounds = this.getGraphBounds();

    this.leftLabel.show();
    this.bottomLabel.show();
    this.horizonRuler.show(bounds.width);
    this.verticalRuler.show(bounds.height);
    this.graphFrame.show(bounds);
    this.lines.forEach(v => v.show());
  }

  private updateParts(): void {
    const bounds = this.getGraphBounds();
    const [xScaler, yScaler] = this.getScalers(this.dataset, bounds);

    this.leftLabel.update(yScaler);
    this.bottomLabel.update(xScaler);
    this.horizonRuler.update(yScaler, bounds.width);
    this.verticalRuler.update(xScaler, bounds.height);
    this.graphFrame.update(bounds);
    this.lines.forEach(v => v.update(this.dataset, xScaler, yScaler));
  }

  public hideParts(): void {
    this.leftLabel.hide();
    this.bottomLabel.hide();
    this.horizonRuler.hide();
    this.verticalRuler.hide();
    this.graphFrame.hide();

    this.lines.forEach(v => v.hide());
  }

  private getScalers(dataset: GraphValue<LinearX>[], bounds: GraphBounds): [ScaleLinearX, ScaleY] {
    const xScaler = ScaleFactory.newScaleLinearX(dataset, bounds.left, bounds.right)
    // const yScaler = ScaleFactory.newScaleLinearY(dataset, bounds.top, bounds.bottom)
    const yScaler = ScaleFactory.newFixedScaleLinearY(-1, 1, bounds.bottom, bounds.top)

    return [xScaler, yScaler];
  }

  protected _resize(): void {
    super._resize();
    this.updateParts();
  }
}
