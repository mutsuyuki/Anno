<template>
  <AnnotationPageLayout>
    <template v-slot:menu>
      <MenuPane_ObjectDetection @addHistory="addHistory"/>
    </template>

    <template v-slot:editor>
      <CanvasPane_ObjectDetection @addHistory="addHistory"/>
    </template>

    <template v-slot:size-check-target>
      <video :src="sizeCheckVideoUrl"></video>
    </template>

    <template v-slot:help>
      <Help_ObjectDetection/>
    </template>
  </AnnotationPageLayout>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import MenuPane_ObjectDetection from "@/app/object_detection_annotation/MenuPane_ObjectDetection.vue";
import CanvasPane_ObjectDetection from "@/app/object_detection_annotation/CanvasPane_ObjectDetection.vue";
import Help_ObjectDetection from "@/app/object_detection_annotation/Help_ObjectDetection.vue";
import HistoryStore, {HistoryRecord} from "@/store/HistoryStore";
import AnnotationFilesStore from "@/store/AnnotationFilesStore";
import HelpStore from "@/store/HelpStore";
import VideoFileStore from "@/store/VideoFileStore";
import OperationStore_ObjectDetection from "@/app/object_detection_annotation/store/OperationStore_ObjectDetection";
import OperationOfFramesStore from "@/store/OperationOfFramesStore";
import AnnotationsStore_ObjectDetection from "@/app/object_detection_annotation/store/AnnotationsStore_ObjectDetection";
import AnnotationPageLayout from "@/components/Layout/AnnotationPageLayout.vue";

@Component({
  components: {
    AnnotationPageLayout,
    CanvasPane_ObjectDetection,
    MenuPane_ObjectDetection,
    Help_ObjectDetection,
  },
})
export default class Home_ObjectDetection extends Vue {
  get sizeCheckVideoUrl() {
    return VideoFileStore.url;
  }

  mounted() {
    HistoryStore.init(this.makeHistoryRecord());

    // ヒストリが変わった
    this.$watch(
        () => HistoryStore.index,
        () => {
          const current = HistoryStore.current;
          OperationStore_ObjectDetection.setOperation(current.value.operation);
          OperationOfFramesStore.setOperations(current.value.operationOfFrame);
          AnnotationsStore_ObjectDetection.setAnnotation(current.value.annotation);
        }
    );
  }

  destroyed() {
    VideoFileStore.clear();
    AnnotationFilesStore.clear();
    HistoryStore.clear();
    HelpStore.hide();
  }

  private makeHistoryRecord() {
    return new HistoryRecord({
      operation: OperationStore_ObjectDetection.operation,
      operationOfFrame: OperationOfFramesStore.operations,
      annotation: AnnotationsStore_ObjectDetection.annotations,
    });
  }

  private addHistory() {
    HistoryStore.addHistory(this.makeHistoryRecord());
    OperationOfFramesStore.setIsDirty({frame: OperationStore_ObjectDetection.frame, isDirty: true});
  }
}
</script>

<style lang="scss" scoped></style>


