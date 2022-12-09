// import * as d3 from "d3";
//
// import TimeGraphBase from "../core/TimeGraphBase";
// import AxisLabel from "../parts/AxisLabel";
// import AxisRuler from "../parts/AxisRuler";
// import GraphLine from "../parts/GraphLine";
// import DotAxis from "../parts/DotAxis";
// import GraphLinePoint from "..//parts/GraphLinePoint";
// import GraphValue from "../value/GraphValue";
// import {AxisDirection} from "../parts/AxisDirection";
//
//
// export default class TimeGraphSample extends TimeGraphBase {
//
//   private leftLabel: AxisLabel;
//   private bottomLabel: AxisLabel;
//   private horizonRuler: AxisRuler;
//   private line: GraphLine;
//   private dot: DotAxis;
//   private point: GraphLinePoint;
//
//   constructor(__rootDivD3: any) {
//     super(__rootDivD3);
//
//     this.leftLabel = new AxisLabel(this.svg);
//     this.bottomLabel = new AxisLabel(this.svg);
//     this.horizonRuler = new AxisRuler(this.svg);
//     this.line = new GraphLine(this.svg);
//     this.dot = new DotAxis(this.svg);
//     this.point = new GraphLinePoint(this.svg);
//   }
//
//   public init(__dataset: GraphValue[]): void {
//     super.init(__dataset);
//
//     this.leftLabel.axisDirection = AxisDirection.HORIZONTAL;
//     this.leftLabel.setPosition(this.marginLeft, 0);
//     this.leftLabel.init(this.yScaler);
//
//     this.bottomLabel.axisDirection = AxisDirection.VERTICAL;
//     this.bottomLabel.setPosition(0, this.svgHeight - this.marginBottom);
//     this.bottomLabel.init(this.xScaler);
//
//     this.horizonRuler.axisDirection = AxisDirection.HORIZONTAL;
//     this.horizonRuler.lineLength = parseInt(this.svg.node().clientWidth) - (this.marginRight + this.marginLeft);
//     this.horizonRuler.color = "#F5F6F7";
//     this.horizonRuler.setPosition(this.marginLeft, 0);
//     this.horizonRuler.init(this.yScaler);
//
//     this.line.dataIndex = 0;
//     this.line.color = "#099";
//     this.line.curveType = d3.curveLinear;
//     this.line.init(this.dataset, this.xScaler, this.yScaler);
//     this.dot.init(this.dataset.map((d)=>d.xValue), this.xScaler, this.yScaler);
//     this.point.init(this.dataset, this.xScaler, this.yScaler);
//   }
//
//   public show(): void {
//     this.leftLabel.show();
//     this.bottomLabel.show();
//     this.horizonRuler.show();
//     this.line.show();
//     this.dot.show();
//     this.point.show();
//   }
//
//   public update(__dataset: GraphValue[]): void {
//     super.update(__dataset);
//     this.leftLabel.update(this.yScaler);
//     this.bottomLabel.update(this.xScaler);
//     this.horizonRuler.update(this.yScaler);
//     this.line.update(this.dataset, this.xScaler, this.yScaler);
//     this.dot.update(this.dataset.map((d)=>d.xValue), this.xScaler, this.yScaler);
//     this.point.update(this.dataset, this.xScaler, this.yScaler);
//   }
//
//   public hide(): void {
//     this.leftLabel.hide();
//     this.horizonRuler.hide();
//     this.line.hide();
//   }
//
// };
