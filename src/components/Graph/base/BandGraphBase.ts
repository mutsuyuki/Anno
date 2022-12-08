import * as d3 from 'd3'
import {ScaleBand} from "d3-scale";
import {GraphValue} from "../parts/GraphValue";
import SingleGraphBase from "./SingleGraphBase";

export default class BandGraphBase extends SingleGraphBase{

    protected xScaler: ScaleBand<string> = d3.scaleBand();
    protected xTouchAreaScaler: ScaleBand<string> = d3.scaleBand();

    protected makeXScaler(): void {
        this.xScaler = d3.scaleBand()
            .domain(this.dataset.map((d: GraphValue) => d.xValue))
            .range([this.marginLeft, this.svgWidth - this.marginRight])
            .paddingInner(this.paddingIn)
            .paddingOuter(this.paddingOut)
            .align(0.5);

        this.xTouchAreaScaler = d3.scaleBand()
            .domain(this.dataset.map((d: GraphValue) => d.xValue))
            .range([this.marginLeft, this.svgWidth - this.marginRight])
            .paddingInner(0)
            .paddingOuter(0)
            .align(0.5);
    }

}
