<template>
  <div>
    <NormalizedScalableArea
        @dragareastart="$emit('dragareastart', $event)"
        @dragarea="$emit('dragarea', $event)"
        @dragareaend="$emit('dragareaend', $event)"
        @hover="$emit('hover', $event)"
        @movestart="$emit('movestart', $event)"
        @move="$emit('move', $event)"
        @moveend="$emit('moveend', $event)"
        @zoomstart="$emit('zoomstart', $event)"
        @zoom="$emit('zoom', $event)"
        @zoomend="$emit('zoomend', $event)"
    >
      <div class="image_area">
        <img :src="currentUrl" :style="{'opacity':imageOpacity}">
        <div class="overlay_layer" :style="{'opacity':overlayOpacity}">
          <slot></slot>
        </div>
      </div>
    </NormalizedScalableArea>

    <div class="selector_area">
      <button class="button" @click="first">
        <img :src="require('@/assets/img/icons/prev_first.svg')"/>
      </button>

      <button class="button" @click="prev">
        <img :src="require('@/assets/img/icons/prev.svg')"/>
      </button>

      <div class="page_display">
        <input
            type="number"
            placeholder="0"
            :value="pageManager.currentIndex + 1"
            @input="$emit('pageupdate', $event.target.value)"
        >
        <span class="divider">/</span>
        <span class="total-page">{{ srcUrls.length }}</span>
      </div>

      <button class="button" @click="next">
        <img :src="require('@/assets/img/icons/next.svg')"/>
      </button>

      <button class="button" @click="last">
        <img :src="require('@/assets/img/icons/next_last.svg')"/>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator';
import ScalableArea from "@/components/UI/Area/ScalableArea.vue";
import InlineSvg from "@/common/utils/InlineSvg";
import NormalizedScalableArea from "@/components/UI/Area/NormalizedScalableArea.vue";
import ListManager from "@/common/utils/ListManager";

@Component({
  components: {
    NormalizedScalableArea,
    InlineSvg,
    ScalableArea
  }
})
export default class ImagePlayer extends Vue {
  @Prop({default: []}) private srcUrls!: string[];
  @Prop({default: 0}) private seekIndex!: number;
  @Prop({default: []}) private markerTimes!: number[];  // 現状未使用
  @Prop({default: 1}) private imageOpacity!: number;
  @Prop({default: 1}) private overlayOpacity!: number;

  private pageManager: ListManager<string> = new ListManager<string>(this.srcUrls);
  private isShiftDown: boolean = false;

  get currentUrl(): string {
    return this.pageManager.isEnable ? this.pageManager.currentItem : "";
  }

  mounted() {
    this.$watch(
        () => this.srcUrls,
        () => {
          this.pageManager = new ListManager<string>(this.srcUrls);
        }
    );

    this.$watch(
        () => this.seekIndex,
        () => {
          this.pageManager.setIndex(this.seekIndex);
        }
    );

    document.addEventListener("keydown", this.onKeyDown);
    document.addEventListener("keyup", this.onKeyUp)
  }

  destroyed() {
    document.removeEventListener("keydown", this.onKeyDown);
    document.removeEventListener("keyup", this.onKeyUp)
  }

  private onKeyDown(e: KeyboardEvent) {
    if (e.key == "Shift") {
      this.isShiftDown = true;
    }
    if (e.key == "ArrowRight") {
      if (this.isShiftDown) {
        alert("not implemented yet")
      } else {
        this.next();
      }
    }
    if (e.key == "ArrowLeft") {
      if (this.isShiftDown) {
        alert("not implemented yet")
      } else {
        this.prev();
      }
    }
  }

  private onKeyUp(e: KeyboardEvent) {
    if (e.key == "Shift") {
      this.isShiftDown = false;
    }
  }

  public first(): void {
    this.pageManager.first();
    this.$emit('pageupdate', this.pageManager.currentIndex);
  }

  public last(): void {
    this.pageManager.last();
    this.$emit('pageupdate', this.pageManager.currentIndex);
  }

  public next(): void {
    this.pageManager.next();
    this.$emit('pageupdate', this.pageManager.currentIndex);
  }

  public prev(): void {
    this.pageManager.prev();
    this.$emit('pageupdate', this.pageManager.currentIndex);
  }
}
</script>

<style scoped lang="scss">

.image_area {
  display: flex;
  justify-content: center;
  position: relative;

  img {
    width: 100%;
  }

  .overlay_layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
    pointer-events: none;
  }
}

.selector_area {
  margin-top: 16px;
  display: flex;
  justify-content: center;
  align-items: center;

  button {
    margin: 0 8px;
  }

  .page_display {
    margin: 0 32px;
    display: flex;
    justify-content: center;
    align-items: flex-end;

    input[type="number"] {
      font-size: 18px;
      width: 64px;
      height: 32px;
      text-align: right;
    }

    .divider {
      font-size: 12px;
      margin-left: 8px;
      color: var(--darkgray);
    }

    .total-page {
      font-size: 12px;
      margin-left: 8px;
      color: var(--darkgray);
    }

  }
}
</style>
