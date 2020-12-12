<template>
  <div>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator';

@Component
export default class MediaSizeChecker extends Vue {

  @Prop() private containerElement!: HTMLElement;
  @Prop() private heightPadding!: number;

  mounted() {
    const mediaElement = this.$el.children[0] as HTMLElement;

    let prevWidth = 0;
    setInterval(() => {
      if (!this.containerElement) {
        return;
      }

      mediaElement.style.maxHeight = (this.containerElement.clientHeight - this.heightPadding) + "px";
      mediaElement.style.maxWidth = this.containerElement.clientWidth + "px";

      if (prevWidth != mediaElement.clientWidth) {
        this.$emit("sizeChange", mediaElement.clientWidth);
        prevWidth = mediaElement.clientWidth;
      }
    }, 50);
  }
}
</script>

<style scoped lang="scss">
div {
  * {
    position: absolute;
    bottom: 0;
    left: 0;
    visibility: hidden;
  }
}
</style>
