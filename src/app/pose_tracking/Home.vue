<template>
  <AnnotationPageLayout>
    <template v-slot:menu>
      <MenuPane
          @addHistory="addHistory"
          @help="isShowHelp = !isShowHelp"
      />
    </template>

    <template v-slot:editor>
      <CanvasPane @addHistory="addHistory"/>
    </template>

    <template v-slot:size-check-target>
      <video :src="sizeCheckVideoUrl"></video>
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
import AnnotationPageLayout from "@/components/Layout/AnnotationPageLayout.vue";
import MenuPane from "@/app/pose_tracking/MenuPane.vue";
import CanvasPane from "@/app/pose_tracking/CanvasPane.vue";
import Help from "@/components/UI/Help/Help.vue";
import HelpMessage from "@/app/pose_tracking/HelpMessages";
import HistoryStore, {HistoryRecord} from "@/store/HistoryStore";
import OperationStore from "@/app/pose_tracking/store/OperationStore";
import EditStateStore from "@/store/EditStateStore";
import AnnotationsStore from "@/app/pose_tracking/store/AnnotationsStore";
import FileStore from "@/app/pose_tracking/store/FileStore";

@Component({
  components: {
    AnnotationPageLayout,
    CanvasPane,
    MenuPane,
    Help,
  },
})
export default class Home extends Vue {
  private isShowHelp: boolean = false;

  get sizeCheckVideoUrl() {
    return FileStore.videoUrl;
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
      editSequence: EditStateStore.states,
      operation: OperationStore.operation,
      annotation: AnnotationsStore.annotations,
    });
  }

  private addHistory() {
    HistoryStore.addHistory(this.makeHistoryRecord());
    EditStateStore.setIsDirty({frame: OperationStore.frame, isDirty: true});
  }
}
</script>

<style lang="scss" scoped></style>


