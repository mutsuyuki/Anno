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
        <img :src="imageUrl">
        <div class="overlay_layer">
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
        <input type="number" v-model="currentPage" placeholder="0">
        <span class="divider">/</span>
        <span class="total-page">{{ totalPage }}</span>
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
import ScalableArea from "@/components/ScalableArea/ScalableArea.vue";
import InlineSvg from "@/components/InlineSvg";
import ImageFilesStore from "@/store/ImageFilesStore";
import NormalizedScalableArea from "@/components/ScalableArea/NormalizedScalableArea.vue";

@Component({
  components: {NormalizedScalableArea, InlineSvg, ScalableArea}
})
export default class ImagePlayer extends Vue {

  private isShiftDown: boolean = false;

  get imageUrl() {
    return ImageFilesStore.currentItemUrl;
  }

  get currentPage() {
    return ImageFilesStore.currentIndex + 1;
  }

  set currentPage(value) {
    ImageFilesStore.setIndex(value)
  }

  get totalPage() {
    return ImageFilesStore.numberOfItems;
  }

  private first() {
    ImageFilesStore.first();
  }

  private prev() {
    ImageFilesStore.prev();
  }

  private next() {
    ImageFilesStore.next();
  }

  private last() {
    ImageFilesStore.last();
  }

  mounted() {

    document.addEventListener("keydown", (e) => {
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
    });

    document.addEventListener("keyup", (e) => {
      if (e.key == "Shift") {
        this.isShiftDown = false;
      }
    })

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
