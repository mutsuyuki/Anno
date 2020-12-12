<template>
  <AnnotationPageLayout>
    <template v-slot:menu>
      <MenuPane_ObjectDetection_ByImages @addHistory="addHistory"/>
    </template>

    <template v-slot:editor>
      <CanvasPane_ObjectDetection_ByImages @addHistory="addHistory"/>
    </template>

    <template v-slot:size-check-target>
      <img :src="sizeCheckVideoUrl">
    </template>

    <template v-slot:help>
      <Help_ObjectDetection/>
    </template>
  </AnnotationPageLayout>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import MenuPane_ObjectDetection_ByImages from "@/app/object_detection_annotation/MenuPane_ObjectDetection_ByImages.vue";
import CanvasPane_ObjectDetection_ByImages
  from "@/app/object_detection_annotation/CanvasPane_ObjectDetection_ByImages.vue";
import Help_ObjectDetection from "@/app/object_detection_annotation/Help_ObjectDetection.vue";
import HistoryStore, {HistoryRecord} from "@/store/HistoryStore";
import AnnotationFilesStore from "@/store/AnnotationFilesStore";
import HelpStore from "@/components/UI_Singleton/Help/HelpStore";
import OperationStore_ObjectDetection from "@/app/object_detection_annotation/store/OperationStore_ObjectDetection";
import EditSequencesStore from "@/store/EditSequenceStore";
import AnnotationsStore_ObjectDetection from "@/app/object_detection_annotation/store/AnnotationsStore_ObjectDetection";
import ImagePlayerStore from "@/components/UI_Singleton/Player/ImagePlayerStore";
import AnnotationPageLayout from "@/components/Layout/AnnotationPageLayout.vue";

@Component({
  components: {
    AnnotationPageLayout,
    CanvasPane_ObjectDetection_ByImages,
    MenuPane_ObjectDetection_ByImages,
    Help_ObjectDetection,
  },
})
export default class Home_ObjectDetection_ByImages extends Vue {

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
          OperationStore_ObjectDetection.setOperation(current.value.operation);
          EditSequencesStore.setSequences(current.value.editSequence);
          AnnotationsStore_ObjectDetection.setAnnotation(current.value.annotation);
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
    return new HistoryRecord({
      operation: OperationStore_ObjectDetection.operation,
      editSequence: EditSequencesStore.sequences,
      annotation: AnnotationsStore_ObjectDetection.annotations,
    });
  }

  private addHistory() {
    HistoryStore.addHistory(this.makeHistoryRecord());
    EditSequencesStore.setIsDirty({frame: OperationStore_ObjectDetection.frame, isDirty: true});
  }
}
</script>

<style lang="scss" scoped></style>


