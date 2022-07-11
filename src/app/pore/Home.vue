<template>
  <AnnotationPageLayout>
    <template v-slot:menu>
      <MenuPane @addHistory="addHistory"/>
    </template>

    <template v-slot:editor>
      <CanvasPane @addHistory="addHistory"/>
    </template>

    <template v-slot:size-check-target>
      <img :src="sizeCheckImageUrl">
    </template>

    <template v-slot:help>
      <Help
          :isShow="isShowHelp"
          :descriptions="helpDescriptions"
          @close="isShowHelp = false"
      />
    </template>
  </AnnotationPageLayout>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import MenuPane from "@/app/pore/MenuPane.vue";
import CanvasPane from "@/app/pore/CanvasPane.vue";
import AnnotationPageLayout from "@/components/Layout/AnnotationPageLayout.vue";
import Help from "@/components/UI/Help/Help.vue";
import HelpMessage from "@/app/pore/HelpMessages";
import HistoryStore, {HistoryRecord} from "@/store/HistoryStore";
import EditStateStore from "@/store/EditStateStore";
import AnnotationsStore from "@/app/pore/store/AnnotationsStore";
import OperationStore from "@/app/pore/store/OperationStore";
import FileStore from "@/app/pore/store/FileStore";

@Component({
  components: {
    AnnotationPageLayout,
    CanvasPane,
    MenuPane,
    Help
  },
})
export default class Home extends Vue {
  private isShowHelp: boolean = false;

  get sizeCheckImageUrl() {
    return FileStore.imageUrls[OperationStore.frame];
  }

  get helpDescriptions() {
    return HelpMessage.descriptions;
  }

  mounted() {
    HistoryStore.init(this.makeHistoryRecord());

    // ヒストリが変わった
    this.$watch(
        () => HistoryStore.index,
        () => {
          const current = HistoryStore.current;
          OperationStore.setOperation(current.value.operation);
          EditStateStore.setSequences(current.value.editSequence);
          AnnotationsStore.setAnnotation(current.value.annotation);
        }
    );
  }

  private makeHistoryRecord() {
    return new HistoryRecord({
      operation: OperationStore.operation,
      editSequence: EditStateStore.states,
      annotation: AnnotationsStore.annotations,
    });
  }

  private addHistory() {
    HistoryStore.addHistory(this.makeHistoryRecord());
    EditStateStore.setIsDirty({frame: OperationStore.frame, isDirty: true});
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


