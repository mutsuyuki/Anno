import * as d3 from "d3";

import MultiTimeGraphBase from "./base/MultiTimeGraphBase";
import AxisLabel from "./parts/AxisLabel";
import AxisRuler from "./parts/AxisRuler";
import GraphLine from "./parts/GraphLine";
import {GraphValue} from "./parts/GraphValue";
import {AxisDirection} from "./parts/AxisDirection";
import GraphLineArea from "./parts/GraphLineArea";


export default class TimeLineGraph extends MultiTimeGraphBase {

  public colors:{ [recordId: string]: string } = {};

  private leftLabel: AxisLabel;
  private bottomLabel: AxisLabel;
  private horizonRuler: AxisRuler;
  private verticalRuler: AxisRuler;
  private lines: { [recordId: string]: GraphLine };
  private areas: { [recordId: string]: GraphLineArea };


  constructor(__rootDivD3: any) {
    super(__rootDivD3);

    this.leftLabel = new AxisLabel(this.svg);
    this.bottomLabel = new AxisLabel(this.svg);
    this.horizonRuler = new AxisRuler(this.svg);
    this.verticalRuler = new AxisRuler(this.svg);
    this.lines = {};
    this.areas = {};
  }

  public init(__dataset: { [recordId: string]: GraphValue[] }): void {
    super.init(__dataset);

    this.leftLabel.axisDirection = AxisDirection.HORIZONTAL;
    this.leftLabel.color = "#7B848F";
    this.leftLabel.ticks = 4;
    this.leftLabel.setPosition(this.marginLeft, 0);
    this.leftLabel.init(this.yScaler);

    this.bottomLabel.axisDirection = AxisDirection.VERTICAL;
    this.bottomLabel.setPosition(0, this.svgHeight - this.marginBottom);
    this.bottomLabel.init(this.xScaler);

    this.horizonRuler.axisDirection = AxisDirection.HORIZONTAL;
    this.horizonRuler.lineLength = parseInt(this.svg.node().clientWidth) - (this.marginRight + this.marginLeft);
    this.horizonRuler.color = "#EDF0F1";
    this.horizonRuler.ticks = 4;
    this.horizonRuler.setPosition(this.marginLeft, 0);
    this.horizonRuler.init(this.yScaler);

    this.verticalRuler.axisDirection = AxisDirection.VERTICAL;
    this.verticalRuler.lineLength = parseInt(this.svg.node().clientHeight);
    this.verticalRuler.color = "#EDF0F1";
    this.verticalRuler.ticks = 7;
    this.verticalRuler.setPosition(this.marginLeft, 0);
    this.verticalRuler.init(this.xScaler);

    for (let recordId in this.lines) this.lines[recordId].destroy();
    this.lines = {};

    for (let recordId in this.areas) this.areas[recordId].destroy();
    this.areas = {};

    for (let recordId in __dataset) {
      this.lines[recordId] = new GraphLine(this.svg);
      this.lines[recordId].dataIndex = 0;
      this.lines[recordId].curveType = d3.curveStepAfter;
      this.lines[recordId].init(this.dataset[recordId], this.xScaler as any, this.yScaler);

      this.areas[recordId] = new GraphLineArea(this.svg);
      this.areas[recordId].dataIndex = 0;
      this.areas[recordId].opacity = recordId == "simulate" ? 0.2 : 0.1;
      this.areas[recordId].curveType = d3.curveStepAfter;
      this.areas[recordId].init(this.dataset[recordId], this.xScaler, this.yScaler);
    }

    this.setLineColor();
  }

  public show(): void {
    this.leftLabel.show();
    this.bottomLabel.show();
    this.horizonRuler.show();
    this.verticalRuler.show();

    this.setLineColor();
    for (let recordId in this.lines)
      this.lines[recordId].show();

    for (let recordId in this.areas)
      this.areas[recordId].show();
  }

  public update(__dataset: { [recordId: string]: GraphValue[] }): void {
    super.update(__dataset);
    this.leftLabel.update(this.yScaler);
    this.bottomLabel.update(this.xScaler);
    this.horizonRuler.update(this.yScaler);
    this.verticalRuler.update(this.xScaler);

    this.setLineColor();
    for (let recordId in __dataset) {
      this.lines[recordId].update(this.dataset[recordId], this.xScaler, this.yScaler);
      this.areas[recordId].update(this.dataset[recordId], this.xScaler, this.yScaler);
    }
  }

  public hide(): void {
    this.leftLabel.hide();
    this.horizonRuler.hide();
    this.verticalRuler.hide();

    for (let recordId in this.lines)
      this.lines[recordId].hide();

    for (let recordId in this.areas)
      this.areas[recordId].hide();
  }

  public resize(): void {
    super.resize();
    this.leftLabel.resize(this.yScaler);
    this.bottomLabel.resize(this.xScaler);
    this.horizonRuler.resize(this.yScaler, parseInt(this.svg.node().clientWidth) - (this.marginRight + this.marginLeft));
    this.verticalRuler.resize(this.xScaler, parseInt(this.svg.node().clientHeight) - (this.marginTop + this.marginBottom));

    for (let recordId in this.lines)
      this.lines[recordId].resize(this.xScaler, this.yScaler);

    for (let recordId in this.areas)
      this.areas[recordId].resize(this.xScaler, this.yScaler);
  }

  private setLineColor():void{
    for (let recordId in this.lines)
      this.lines[recordId].color = this.colors[recordId];

    for (let recordId in this.areas)
      this.areas[recordId].color = this.colors[recordId];
  }
};
