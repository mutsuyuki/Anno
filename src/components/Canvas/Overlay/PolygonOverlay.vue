<template>
  <CanvasRenderer :graphics="graphics"/>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator';
import CanvasRenderer from "@/components/Canvas/Renderer/CanvasRenderer.vue";
import {PolygonModel} from "@/common/model/PolygonModel";
import {Graphic} from "@/components/Canvas/Renderer/Graphic";
import {Color} from "@/common/interface/Color";
import DeepCloner from "@/common/utils/DeepCloner";
import MultiCircles from "@/components/Canvas/Renderer/MultiCircles";
import Polygon from "@/components/Canvas/Renderer/Polygon";

@Component({
  components: {
    CanvasRenderer,
  }
})
export default class PolygonOverlay extends Vue {
  @Prop() private polygonModels!: { [objectId: string]: PolygonModel };
  @Prop() private selectingObjectId!: string;
  @Prop() private selectingPointIndex!: number;

  @Prop({default: () => ({r: 0, g: 40, b: 150, a: 1})}) private lineColor!: Color;
  @Prop({default: () => ({r: 0, g: 40, b: 150, a: 0.1})}) private areaColor!: Color;
  @Prop({default: () => ({r: 0, g: 150, b: 40, a: 1})}) private pointColor!: Color;

  private graphics: Graphic[] = [];

  created() {
    // モデルの状態が変わったら描画
    this.$watch(() => this.polygonModels, () => this.draw(), {deep: true});
    this.$watch(() => this.selectingPointIndex, () => this.draw(), {deep: true});
    this.$watch(() => this.lineColor, () => this.draw(), {deep: true});
    this.$watch(() => this.pointColor, () => this.draw(), {deep: true});
    this.$watch(() => this.areaColor, () => this.draw(), {deep: true});
  }

  private draw() {
    if (!this.polygonModels) {
      return;
    }

    const graphics: Graphic[] = [];

    const lineColor = DeepCloner.copy(this.lineColor);
    const areaColor = DeepCloner.copy(this.areaColor);
    const pointColor = DeepCloner.copy(this.pointColor);

    for (const objectId in this.polygonModels) {
      const polygonModel = this.polygonModels[objectId];
      const isSelecting = this.selectingObjectId == objectId;

      // ------ area  --------------------------------------------------
      lineColor.a = this.lineColor.a * (isSelecting ? 1 : 0.7);
      areaColor.a = this.areaColor.a * (isSelecting ? 1 : 0.7);
      const polygon = new Polygon(polygonModel.points, lineColor, areaColor);
      polygon.zIndex = 1;
      graphics.push(polygon);

      // ------ point --------------------------------------------------
      pointColor.a = this.pointColor.a * (isSelecting ? 1 : 0.4);
      const points = new MultiCircles(polygonModel.points, 4, pointColor);
      points.zIndex = 2;
      graphics.push(points);
    }
    this.graphics = graphics;
  }
}

</script>
