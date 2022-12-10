import {ScaleBand, ScaleLinear} from "d3-scale";

// X軸の使用可能型
export type LinearX = number | Date;
export type BandX = string;

// グラフ用のスケール
export type ScaleLinearX = ScaleLinear<LinearX, number>;
export type ScaleBandX = ScaleBand<BandX>;
export type ScaleY = ScaleLinear<number, number>;

// グラフ領域
export type GraphBounds = {
  top: number,
  bottom: number,
  left: number,
  right: number,
  width: number,
  height: number
};

// 期間
export type NumberRange = {
  start: number,
  end: number
}

