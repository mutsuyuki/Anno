<template>
  <CanvasRenderer :graphics="graphics"/>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator';
import CanvasRenderer from "@/components/Canvas/Renderer/CanvasRenderer.vue";
import {Graphic} from "@/components/Canvas/Renderer/Graphic";
import {Color} from "@/common/interface/Color";
import RectangleLine from "@/components/Canvas/Renderer/RectangleLine";
import DeepCloner from "@/common/utils/DeepCloner";
import {BoundingBoxModel} from "@/common/model/BoundingBoxModel";

@Component({
  components: {
    CanvasRenderer,
  }
})
export default class BoundingBoxOverlay extends Vue {
  @Prop() private boundingBoxModels!: { [objectId: string]: BoundingBoxModel };
  @Prop() private selectingObjectId!: string;
  @Prop({default: () => ({r: 255, g: 0, b: 0, a: 1})}) private color!: Color;

  private graphics: Graphic[] = [];

  created() {
    // モデルの状態が変わったら描画
    this.$watch(() => this.boundingBoxModels, () => this.draw(), {deep: true});
    this.$watch(() => this.selectingObjectId, () => this.draw(), {deep: true});
    this.$watch(() => this.color, () => this.draw(), {deep: true});
  }

  private draw() {
    if(!this.boundingBoxModels) {
      return;
    }

    const graphics: Graphic[] = [];

    const color = DeepCloner.copy(this.color);
    for (const objectId in this.boundingBoxModels) {
      color.a = this.color.a * (objectId == this.selectingObjectId ? 1 : 0.6);
      const boundingBoxModel: BoundingBoxModel = this.boundingBoxModels[objectId];
      const boundingBox = new RectangleLine(
          boundingBoxModel.left,
          boundingBoxModel.top,
          boundingBoxModel.width,
          boundingBoxModel.height,
          2,
          color
      );
      graphics.push(boundingBox)
    }
    this.graphics = graphics;
  }
}

</script>
