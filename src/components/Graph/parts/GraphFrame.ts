import * as d3 from 'd3'

export default class GraphFrame {

  public isTop: boolean = true;
  public isBottom: boolean = true;
  public isLeft: boolean = true;
  public isRight: boolean = true;
  public isDashed: boolean = false;
  public lineWidth = 1;
  public width: number = 1;
  public height: number = 1;
  public color: string = "#888";
  public showDuration:number = 700;
  public hideDuration:number = 800;

  private root: any;
  private topLine: any;
  private bottomLine: any;
  private leftLine: any;
  private rightLine: any;


  constructor(__parent: any) {
    this.root = __parent.append('g');
  }

  public init(): void {
    this.topLine = this.prepareLine(this.isTop, 0, 0);
    this.bottomLine = this.prepareLine(this.isBottom, 0, this.height);
    this.leftLine = this.prepareLine(this.isLeft, 0, 0);
    this.rightLine = this.prepareLine(this.isRight, this.width, 0);
    console.log(this.topLine, this.bottomLine, this.leftLine, this.rightLine)
  }


  private prepareLine(__isNeed: boolean, __fromX: number, __fromY: number): any {
    if (__isNeed) {
      let path: any = this.root.append("path");
      path
        .attr("stroke-width", this.lineWidth)
        .attr("stroke", this.color)
        .attr("d", "M " + __fromX + " " + __fromY + " L " + __fromX + " " + __fromY)
      if (this.isDashed)
        path.attr("stroke-dasharray", "1,1")
      return path;
    } else {
      return null;
    }
  }

  public setPosition(__x, __y): void {
    this.root.attr("transform", "translate(" + __x + "," + __y + ")");
  }

  public show(): void {
    this.root.attr("display", "block");

    this.expandLine(this.topLine, 0, 0, this.width, 0,this.showDuration);
    this.expandLine(this.bottomLine, 0, this.height, this.width, this.height,this.showDuration);
    this.expandLine(this.leftLine, 0, 0, 0, this.height,this.showDuration);
    this.expandLine(this.rightLine, this.width, 0, this.width, this.height,this.showDuration);
  }

  private expandLine(__line: any, __fromX: number, __fromY: number, __toX: number, __toY: number, __duration:number): void {
    if (!__line)
      return;

    __line
      .transition()
      .duration(__duration)
      .ease(d3.easeExpOut)
      .attr("d", "M " + __fromX + " " + __fromY + " L " + __toX + " " + __toY)
  }

  public resize(__width:number, __height:number):void{
    this.width = __width;
    this.height = __height;

    let tempDuration:number = this.showDuration;
    this.showDuration = 0;
    this.show();
    this.showDuration = tempDuration;
  }

  public hide(): void {
    this.expandLine(this.topLine, 0, 0, 0, 0,this.hideDuration);
    this.expandLine(this.bottomLine, 0, this.height, 0, this.height,this.hideDuration);
    this.expandLine(this.leftLine, 0, 0, 0, 0,this.hideDuration);
    this.expandLine(this.rightLine, this.width, 0, this.width, 0,this.hideDuration);
  }

};
