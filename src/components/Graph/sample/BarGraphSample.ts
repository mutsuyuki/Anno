// import BandGraphBase from "../core/BandGraphBase";
// import GraphValue from "../value/GraphValue";
// import GraphBar from "../parts/GraphBar";
// import GraphTooltip from "../parts/GraphTooltip";
// import GrouphBarTouchArea from "../parts/GraphBarTouchArea";
//
// export default class BarGraphSample extends BandGraphBase {
//
//   public barColor: string = "#888";
//
//   private bars: GraphBar;
//   private touchArea: GrouphBarTouchArea;
//   private tooltip: GraphTooltip;
//
//   constructor(__rootDivD3: any) {
//     super(__rootDivD3);
//
//     this.bars = new GraphBar(this.svg);
//     this.touchArea = new GrouphBarTouchArea(this.svg);
//     this.tooltip = new GraphTooltip(__rootDivD3.select(".tooltip"));
//   }
//
//   public init(dataset: GraphValue<XAxisType>[]): void {
//     super.init(dataset);
//
//     this.bars.dataIndex = 0;
//     this.bars.color = this.barColor;
//     this.bars.init(this.dataset, this.xScaler, this.yScaler);
//     this.touchArea.init(this.dataset, this.xTouchAreaScaler);
//     this.tooltip.init(this.xScaler, this.yScaler);
//   }
//
//   public resize(): void {
//     super.resize();
//     this.bars.resize(this.xScaler, this.yScaler);
//     this.touchArea.resize(this.xTouchAreaScaler);
//     this.tooltip.resize(this.xScaler, this.yScaler);
//   }
//
//   public show(): void {
//     this.bars.show();
//     this.eventsListen();
//   }
//
//   public update(dataset: GraphValue<XAxisType>[]): void {
//     super.update(dataset);
//     this.bars.update(this.dataset, this.xScaler, this.yScaler);
//     this.eventsListen();
//   }
//
//   protected eventsListen(): void {
//     this.touchArea.dispatcher.on(GrouphBarTouchArea.MOUSE_ENTER, (d: GraphValue<string>) => {
//       this.tooltip.setContent(d.xValue);
//       this.tooltip.show(d, this.xScaler, this.yScaler);
//     });
//
//     this.svg.on("mouseout", () => {
//       this.tooltip.hide();
//     });
//   }
//
//
//   public hide(): void {
//     this.bars.hide();
//   }
//
// };
