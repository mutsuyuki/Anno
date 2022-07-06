<template>
  <div>

    <div class="main_container">
      <MenuPane_Hair class="menu_pane"/>
      <div class="canvas_pane_container">
        <!--                <CanvasPane_Hair class="canvas_pane"/>-->
      </div>
    </div>

    <Help_Hair/>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import MenuPane from "@/app/hair_annotation/MenuPane.vue";
// import CanvasPane_Hair from "@/app/hair_annotation/CanvasPane.vue";
import Help from "@/app/hair_annotation/Help.vue";
import ImagePlayerStore from "@/components/UI_Singleton/Player/ImagePlayerStore";
import HistoryStore from "@/store/HistoryStore";
import AnnotationFilesStore from "@/store/AnnotationFilesStore";
import HelpStore from "@/components/UI_Singleton/Help/HelpStore";

@Component({
  components: {
    // CanvasPane_Hair,
    MenuPane_Hair: MenuPane,
    Help_Hair: Help,
  },
})
export default class Home extends Vue {
  destroyed() {
    ImagePlayerStore.clear();
    AnnotationFilesStore.clear();
    HistoryStore.clear();
    HelpStore.hide();
  }
}
</script>

<style lang="scss" scoped>

.main_container {
  display: flex;
  height: calc(100vh);
  width: 100%;

  .menu_pane {
    width: 200px;
    min-width: 200px;
    height: 100%;
    overflow-y: scroll;
  }

  .canvas_pane_container {
    margin: 0 auto;
    width: calc(100% - 200px);
    height: 100%;
    overflow-y: scroll;
    background-color: var(--background-canvas);

    .canvas_pane {
      height: 100%;
      min-width: 500px;
      margin: 0 auto;
      padding: 0 16px;
    }
  }
}

</style>


