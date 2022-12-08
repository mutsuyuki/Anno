import {GraphValue} from "../parts/GraphValue";
import GraphLine from "../parts/GraphLine";
import AxisLabel from "../parts/AxisLabel";
import AxisRuler from "../parts/AxisRuler";
import {AxisDirection} from "@/components/Graph/parts/AxisDirection";
import SequenceGraphBase from "@/components/Graph/base/SequenceGraphBase";

export default class LineGraphSample extends SequenceGraphBase {

  private leftLabel: AxisLabel;
  private bottomLabel: AxisLabel;
  private horizonRuler: AxisRuler;
  private verticalRuler: AxisRuler;
  protected lines: GraphLine[];

  private colors: string[] = [
    "rgba(255, 99, 100, 1)",
    "rgba(104, 235, 162, 1)",
    "rgba(100, 206, 255, 1)",
  ]

  public init(__dataset: GraphValue[]): void {
    super.init(__dataset);

    this.leftLabel = new AxisLabel(this.svg);
    this.leftLabel.axisDirection = AxisDirection.HORIZONTAL;
    this.leftLabel.color = "#7B848F";
    this.leftLabel.ticks = 4;
    this.leftLabel.moveDuration = 0;
    this.leftLabel.setPosition(this.marginLeft, 0);
    this.leftLabel.init(this.yScaler);

    this.bottomLabel = new AxisLabel(this.svg);
    this.bottomLabel.axisDirection = AxisDirection.VERTICAL;
    this.bottomLabel.color = "#7B848F";
    this.bottomLabel.ticks = 8;
    this.bottomLabel.moveDuration = 0;
    this.bottomLabel.setPosition(0, this.svgHeight - this.marginBottom);
    this.bottomLabel.init(this.xScaler);

    this.horizonRuler = new AxisRuler(this.svg);
    this.horizonRuler.axisDirection = AxisDirection.HORIZONTAL;
    this.horizonRuler.lineLength = parseInt(this.svg.node().clientWidth) - (this.marginRight + this.marginLeft);
    this.horizonRuler.color = "#EDF0F1";
    this.horizonRuler.ticks = 4;
    this.horizonRuler.moveDuration = 0;
    this.horizonRuler.setPosition(this.marginLeft, 0);
    this.horizonRuler.init(this.yScaler);

    this.verticalRuler = new AxisRuler(this.svg);
    this.verticalRuler.axisDirection = AxisDirection.VERTICAL;
    this.verticalRuler.lineLength = parseInt(this.svg.node().clientHeight) - (this.marginTop + this.marginBottom);
    this.verticalRuler.color = "#EDF0F1";
    this.verticalRuler.ticks = 8;
    this.verticalRuler.showDuration = 0;
    this.verticalRuler.setPosition(0, this.marginTop);
    this.verticalRuler.init(this.xScaler);

    this.lines = [];
    for (let i = 0; i < this.dataset[0].yValues.length; i++) {
      const line = new GraphLine(this.svg);
      line.dataIndex = i;
      line.color = this.colors[i];
      line.moveDuration = 0;
      line.init(this.dataset, this.xScaler as any, this.yScaler);
      this.lines.push(line);
    }

    this.verticalRuler.moveDuration = 0;
  }

  public show(): void {
    this.leftLabel.show();
    this.bottomLabel.show();
    this.horizonRuler.show();
    this.verticalRuler.show();
    this.lines.forEach(v => v.show());
  }

  public update(__dataset: GraphValue[]): void {
    super.update(__dataset);

    this.makeYScaler();
    this.makeXScaler();

    this.leftLabel.update(this.yScaler);
    this.bottomLabel.update(this.xScaler);
    this.horizonRuler.update(this.yScaler);
    this.verticalRuler.update(this.xScaler);

    this.leftLabel.update(this.yScaler);
    this.bottomLabel.update(this.xScaler);
    this.horizonRuler.update(this.yScaler);
    this.verticalRuler.update(this.xScaler);

    this.lines.forEach(v => v.update(this.dataset, this.xScaler, this.yScaler));
  }


  public hide(): void {
    this.leftLabel.hide();
    this.bottomLabel.hide();
    this.horizonRuler.hide();
    this.verticalRuler.hide();

    this.lines.forEach(v => v.hide());
  }

  public resize(): void {
    super.resize();
    this.leftLabel.resize(this.yScaler);
    this.bottomLabel.resize(this.xScaler);
    this.horizonRuler.resize(this.yScaler, parseInt(this.svg.node().clientWidth) - (this.marginRight + this.marginLeft));
    this.verticalRuler.resize(this.xScaler, parseInt(this.svg.node().clientHeight) - (this.marginTop + this.marginBottom));

    this.lines.forEach(v => v.resize(this.xScaler, this.yScaler));
  }

};
