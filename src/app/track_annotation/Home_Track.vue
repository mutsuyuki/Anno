<template>
    <AnnotationPageLayout>
      <template v-slot:menu>
        <MenuPane_Track @addHistory="addHistory" />
      </template>

      <template v-slot:editor>
        <CanvasPane_Track @addHistory="addHistory" />
      </template>

      <template v-slot:size-check-target>
        <video :src="sizeCheckVideoUrl"></video>
      </template>

      <template v-slot:help>
        <Help_Track/>
      </template>
    </AnnotationPageLayout>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import MenuPane_Track from "@/app/track_annotation/MenuPane_Track.vue";
import CanvasPane_Track from "@/app/track_annotation/CanvasPane_Track.vue";
import Help_Track from "@/app/track_annotation/Help_Track.vue";
import ImageFilesStore from "@/store/ImageFilesStore";
import HistoryStore, {HistoryRecord} from "@/store/HistoryStore";
import AnnotationFilesStore from "@/store/AnnotationFilesStore";
import HelpStore from "@/store/HelpStore";
import VideoFileStore from "@/store/VideoFileStore";
import OperationStore_Track from "@/app/track_annotation/store/OperationStore_Track";
import OperationOfFramesStore from "@/store/OperationOfFramesStore";
import AnnotationsStore_Track from "@/app/track_annotation/store/AnnotationsStore_Track";
import AnnotationPageLayout from "@/components/Layout/AnnotationPageLayout.vue";

@Component({
  components: {
    AnnotationPageLayout,
    CanvasPane_Track,
    MenuPane_Track,
    Help_Track,
  },
})
export default class Home_Track extends Vue {

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
          OperationStore_Track.setOperation(current.value.operation);
          OperationOfFramesStore.setOperations(current.value.operationOfFrame);
          AnnotationsStore_Track.setAnnotation(current.value.annotation);
        }
    );
  }

  destroyed() {
    ImageFilesStore.clear();
    AnnotationFilesStore.clear();
    HistoryStore.clear();
    HelpStore.hide();
  }

  private makeHistoryRecord() {
    return new HistoryRecord({
      operation: OperationStore_Track.operation,
      operationOfFrame: OperationOfFramesStore.operations,
      annotation: AnnotationsStore_Track.annotations,
    });
  }

  private addHistory() {
    HistoryStore.addHistory(this.makeHistoryRecord());
    OperationOfFramesStore.setIsDirty({frame: OperationStore_Track.frame, isDirty: true});
  }
}
</script>

<style lang="scss" scoped></style>


