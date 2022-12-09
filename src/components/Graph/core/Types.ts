import * as d3 from 'd3'
import {Selection} from 'd3-selection'

// X軸の使用可能型
export type XAxisType = string | number | Date;

// グラフ領域
export type GraphBounds = { top: number, bottom: number, left: number, right: number, width: number, height: number };
