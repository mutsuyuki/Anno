<template>
  <div>
    <div class="main_container">
      <div class="menu_pane">
        <!--メニューを入れる-->
        <slot name="menu"></slot>
      </div>
      <div class="editor_pane_container" ref="sizeCheckContainer">
        <div class="editor_pane">
          <!--エディタを入れる-->
          <slot name="editor"></slot>
        </div>

        <MediaSizeChecker
            :containerElement="$refs.sizeCheckContainer"
            :heightPadding="sizeCheckerPadding"
            @sizeChange="fitWidth"
        >
          <!--サイズの計算対象のimg,videoを入れる-->
          <slot name="size-check-target"></slot>
        </MediaSizeChecker>
      </div>
    </div>
    <!--ヘルプを入れる-->
    <slot name="help"></slot>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
import MediaSizeChecker from "@/components/SizeChecker/MediaSizeChecker.vue";

@Component({
  components: {
    MediaSizeChecker,
  },
})
export default class AnnotationPageLayout extends Vue {

  @Prop({default: 40 + 40 + 80 + 40}) private sizeCheckerPadding!: number;

  private fitWidth(width: number) {
    const editorPaneElement = this.$el.getElementsByClassName("editor_pane")[0] as HTMLElement;
    editorPaneElement.style.width = width + "px";
  }
}
</script>

<style lang="scss" scoped>

.main_container {
  display: flex;
  height: 100vh;
  width: 100%;

  .menu_pane {
    width: 200px;
    min-width: 200px;
    height: 100%;
    overflow-y: scroll;
  }

  .editor_pane_container {
    margin: 0 auto;
    width: calc(100% - 200px);
    height: 100%;
    background-color: var(--background-canvas);

    .editor_pane {
      height: 100%;
      min-width: 500px;
      margin: 0 auto;
      padding: 0 16px;
    }
  }
}

</style>


