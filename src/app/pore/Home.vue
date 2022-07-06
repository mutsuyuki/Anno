<template>
  <AnnotationPageLayout>
    <template v-slot:menu>
      <MenuPane @addHistory="addHistory"/>
    </template>

    <template v-slot:editor>
      <CanvasPane @addHistory="addHistory"/>
    </template>

    <template v-slot:size-check-target>
      <img :src="sizeCheckVideoUrl">
    </template>

    <template v-slot:help>
      <Help/>
    </template>
  </AnnotationPageLayout>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import MenuPane from "@/app/pore/MenuPane.vue";
import CanvasPane from "@/app/pore/CanvasPane.vue";
import Help from "@/app/pore/Help.vue";
import ImagePlayerStore from "@/components/UI_Singleton/Player/ImagePlayerStore";
import HistoryStore, {HistoryRecord} from "@/store/HistoryStore";
import AnnotationFilesStore from "@/store/AnnotationFilesStore";
import HelpStore from "@/components/UI_Singleton/Help/HelpStore";
import AnnotationPageLayout from "@/components/Layout/AnnotationPageLayout.vue";
import EditSequencesStore from "@/store/EditSequenceStore";
import AnnotationsStore from "@/app/pore/store/AnnotationsStore";
import OperationStore from "@/app/pore/store/OperationStore";

@Component({
  components: {
    AnnotationPageLayout,
    CanvasPane,
    MenuPane,
    Help,
  },
})
export default class Home extends Vue {
  get sizeCheckVideoUrl() {
    return ImagePlayerStore.currentItemUrl;
  }

  mounted() {
    HistoryStore.init(this.makeHistoryRecord());

    // ヒストリが変わった
    this.$watch(
        () => HistoryStore.index,
        () => {
          const current = HistoryStore.current;
          console.log("change", current.value.annotation)
          OperationStore.setOperation(current.value.operation);
          EditSequencesStore.setSequences(current.value.editSequence);
          AnnotationsStore.setAnnotation(current.value.annotation);
        }
    );
  }

  destroyed() {
    ImagePlayerStore.clear();
    AnnotationFilesStore.clear();
    HistoryStore.clear();
    HelpStore.hide();
  }

  private makeHistoryRecord() {
    console.log("make", AnnotationsStore.annotations)
    return new HistoryRecord({
      operation: OperationStore.operation,
      editSequence: EditSequencesStore.sequences,
      annotation: AnnotationsStore.annotations,
    });
  }

  private addHistory() {
    HistoryStore.addHistory(this.makeHistoryRecord());
    EditSequencesStore.setIsDirty({frame: OperationStore.frame, isDirty: true});
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


