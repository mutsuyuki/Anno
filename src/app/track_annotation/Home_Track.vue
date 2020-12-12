<template>
  <div>
    <AnnotationPageLayout>
      <template v-slot:menu>
        <MenuPane_Track @addHistory="addHistory"/>
      </template>

      <template v-slot:editor>
        <CanvasPane_Track @addHistory="addHistory"/>
      </template>

      <template v-slot:size-check-target>
        <video :src="sizeCheckVideoUrl"></video>
      </template>

      <template v-slot:help>
        <Help_Track/>
      </template>
    </AnnotationPageLayout>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import MenuPane_Track from "@/app/track_annotation/MenuPane_Track.vue";
import CanvasPane_Track from "@/app/track_annotation/CanvasPane_Track.vue";
import Help_Track from "@/app/track_annotation/Help_Track.vue";
import ImagePlayerStore from "@/components/UI_Singleton/Player/ImagePlayerStore";
import HistoryStore, {HistoryRecord} from "@/store/HistoryStore";
import AnnotationFilesStore from "@/store/AnnotationFilesStore";
import HelpStore from "@/components/UI_Singleton/Help/HelpStore";
import VideoPlayerStore from "@/components/UI_Singleton/Player/VideoPlayerStore";
import OperationStore_Track from "@/app/track_annotation/store/OperationStore_Track";
import EditSequencesStore from "@/store/EditSequenceStore";
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
    return VideoPlayerStore.url;
  }

  mounted() {
    HistoryStore.init(this.makeHistoryRecord());

    // ヒストリが変わった
    this.$watch(
        () => HistoryStore.index,
        () => {
          const current = HistoryStore.current;
          OperationStore_Track.setOperation(current.value.operation);
          EditSequencesStore.setSequences(current.value.editSequence);
          AnnotationsStore_Track.setAnnotation(current.value.annotation);
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
      editSequence: EditSequencesStore.sequences,
      operation: OperationStore_Track.operation,
      annotation: AnnotationsStore_Track.annotations,
    });
  }

  private addHistory() {
    HistoryStore.addHistory(this.makeHistoryRecord());
    EditSequencesStore.setIsDirty({frame: OperationStore_Track.frame, isDirty: true});
  }
}
</script>

<style lang="scss" scoped></style>


