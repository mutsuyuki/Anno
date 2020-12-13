<template>
  <CanvasRenderer :graphics="graphics"/>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator';
import CanvasRenderer from "@/components/Canvas/Renderer/CanvasRenderer.vue";
import {Graphic} from "@/components/Canvas/Renderer/Graphic";
import {MovingPoint, Point, PointUtil} from "@/common/interface/Point";
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

  @Prop({default: true}) private useInteraction!: boolean;
  @Prop({default: false}) private isDeleteMode!: boolean;
  @Prop() private dragStartPosition!: MovingPoint;
  @Prop() private draggingPosition!: MovingPoint;
  @Prop() private dragEndPosition!: MovingPoint;
  @Prop() private hoverPosition!: Point;

  @Prop({default: {r: 255, g: 0, b: 0, a: 1}}) private color!: Color;

  private graphics: Graphic[] = [];
  private selectingEdge = {top: false, right: false, bottom: false, left: false, isResize: false};
  private interactionWatchers: (() => void)[] = [];

  created() {
    // モデルの状態が変わったら描画
    this.$watch(() => this.boundingBoxModels, () => this.draw(), {deep: true});
    this.$watch(() => this.selectingObjectId, () => this.draw(), {deep: true});
    this.$watch(() => this.color, () => this.draw(), {deep: true});

    // インタラクションの有効無効を監視
    this.$watch(
        () => this.useInteraction,
        () => {
          if (this.useInteraction) {
            this.watchInteraction();
          } else {
            this.unwatchInteraction();
          }
        },
        {deep: true, immediate: true}
    );
  }

  private watchInteraction() {
    this.interactionWatchers.push(...[
      // ドラッグ座標もらった
      this.$watch(() => this.dragStartPosition, () => this.dragStart(), {deep: true}),
      this.$watch(() => this.draggingPosition, () => this.dragging(), {deep: true}),
      this.$watch(() => this.dragEndPosition, () => this.dragEnd(), {deep: true}),

      // ホバー座標もらった
      this.$watch(() => this.hoverPosition, () => this.hover(), {deep: true})
    ]);
  }

  private unwatchInteraction() {
    this.interactionWatchers.forEach(f => f());
  }

  private draw() {
    const graphics: Graphic[] = [];

    const color = DeepCloner.copy(this.color);
    for (const objectId in this.boundingBoxModels) {
      color.a = this.color.a * (objectId == this.selectingObjectId ? 1 : 0.5);
      const boundingBoxModel: BoundingBoxModel = this.boundingBoxModels[objectId];
      const boundingBox = new RectangleLine(
          boundingBoxModel.left,
          boundingBoxModel.top,
          boundingBoxModel.width,
          boundingBoxModel.height,
          2,
          this.color
      );
      graphics.push(boundingBox)
    }
    this.graphics = graphics;
  }

  private dragStart() {
    // バウンディングを探す
    const clickedBounding = this.searchBounding(this.dragStartPosition);
    const objectId = clickedBounding.objectId;
    this.selectingEdge = clickedBounding.selectingEdge;

    if (objectId) {
      if (this.isDeleteMode) {
        this.$emit("delete", objectId);
      } else {
        if (this.selectingEdge.isResize) {
          this.$emit("resizestart", objectId);
        } else {
          this.$emit("movestart", objectId);
        }
      }
    } else {
      this.$emit("unselect");
    }
  }

  private dragging() {
    if (!this.boundingBoxModels[this.selectingObjectId]) {
      return;
    }

    let editedBoundingBox = DeepCloner.copy(this.boundingBoxModels[this.selectingObjectId]);

    if (this.selectingEdge.isResize) {
      // 端のドラッグは矩形の拡大縮小
      if (this.selectingEdge.left) {
        editedBoundingBox.left += this.draggingPosition.deltaX;
        editedBoundingBox.width -= this.draggingPosition.deltaX;
      }
      if (this.selectingEdge.right) {
        editedBoundingBox.width += this.draggingPosition.deltaX;
      }
      if (this.selectingEdge.top) {
        editedBoundingBox.top += this.draggingPosition.deltaY;
        editedBoundingBox.height -= this.draggingPosition.deltaY;
      }
      if (this.selectingEdge.bottom) {
        editedBoundingBox.height += this.draggingPosition.deltaY;
      }

      this.$emit("resize", this.selectingObjectId, editedBoundingBox);
    } else {
      // 中心部ドラッグは移動
      editedBoundingBox.top += this.draggingPosition.deltaY;
      editedBoundingBox.left += this.draggingPosition.deltaX;

      this.$emit("move", this.selectingObjectId, editedBoundingBox);
    }
  }

  private dragEnd() {
    if (!this.boundingBoxModels[this.selectingObjectId]) {
      return;
    }

    if (this.selectingEdge.isResize) {
      this.$emit("resizeend", this.selectingObjectId);
    } else {
      this.$emit("moveend", this.selectingObjectId);
    }
  }

  private hover() {
    // todo 選択中の線の強調
  }

  private searchBounding(position: Point) {
    let smallestArea = Number.MAX_VALUE;
    let smallestObjectId: string = "";
    let selectingEdge = {top: false, right: false, bottom: false, left: false, isResize: false};
    const edgeWidth = 0.02;

    for (const objectId in this.boundingBoxModels) {
      const boundingBoxModel = this.boundingBoxModels[objectId];
      const x = position.x;
      const y = position.y;
      const insideHorizontal = (boundingBoxModel.left - edgeWidth < x) && (x < boundingBoxModel.left + boundingBoxModel.width + edgeWidth);
      const insideVertical = (boundingBoxModel.top - edgeWidth < y) && (y < boundingBoxModel.top + boundingBoxModel.height + edgeWidth);
      const area = boundingBoxModel.width * boundingBoxModel.height;
      if (insideHorizontal && insideVertical && area < smallestArea) {
        smallestObjectId = objectId;

        if (Math.abs(boundingBoxModel.left - x) <= edgeWidth) {
          selectingEdge.left = true;
          selectingEdge.isResize = true;
        }
        if (Math.abs(boundingBoxModel.left + boundingBoxModel.width - x) <= edgeWidth) {
          selectingEdge.right = true;
          selectingEdge.isResize = true;
        }
        if (Math.abs(boundingBoxModel.top - y) <= edgeWidth) {
          selectingEdge.top = true;
          selectingEdge.isResize = true;
        }
        if (Math.abs(boundingBoxModel.top + boundingBoxModel.height - y) <= edgeWidth) {
          selectingEdge.bottom = true;
          selectingEdge.isResize = true;
        }
      }
    }

    return {objectId: smallestObjectId, selectingEdge: selectingEdge};
  }
}

</script>

<style scoped lang="scss"></style>
