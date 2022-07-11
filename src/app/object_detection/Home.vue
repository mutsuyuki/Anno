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
      <video v-if="sizeCheckVideoUrl" :src="sizeCheckVideoUrl"></video>
      <img v-if="sizeCheckImageUrl" :src="sizeCheckImageUrl"/>
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
import Help from "@/components/UI/Help/Help.vue";
import MenuPane from "@/app/object_detection/MenuPane.vue";
import CanvasPane from "@/app/object_detection/CanvasPane.vue";
import HelpMessage from "@/app/object_detection/HelpMessages";
import HistoryStore, {HistoryRecord} from "@/store/HistoryStore";
import EditStateStore from "@/store/EditStateStore";
import OperationStore from "@/app/object_detection/store/OperationStore";
import AnnotationsStore from "@/app/object_detection/store/AnnotationsStore";
import ClassListStore from "@/app/object_detection/store/ClassListStore";
import FileStore from "@/app/object_detection/store/FileStore";

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

  get sizeCheckImageUrl() {
    const imageIndex = parseInt(OperationStore.frame);
    return FileStore.imageUrls[imageIndex];
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
          ClassListStore.setClassList(current.value.classList);
          AnnotationsStore.setAnnotation(current.value.annotation);
        }
    );
  }

  private makeHistoryRecord() {
    return new HistoryRecord({
      operation: OperationStore.operation,
      editSequence: EditStateStore.states,
      classList: ClassListStore.classList,
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


