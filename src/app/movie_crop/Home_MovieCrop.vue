<template>
  <AnnotationPageLayout>
    <template v-slot:menu>
      <MenuPane_MovieCrop @addHistory="addHistory"/>
    </template>

    <template v-slot:editor>
      <CanvasPane_MovieCrop @addHistory="addHistory"/>
    </template>

    <template v-slot:size-check-target>
      <video :src="sizeCheckVideoUrl"></video>
    </template>

    <template v-slot:help>
      <Help_MovieCrop/>
    </template>
  </AnnotationPageLayout>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import MenuPane_MovieCrop from "@/app/movie_crop/MenuPane_MovieCrop.vue";
import CanvasPane_MovieCrop from "@/app/movie_crop/CanvasPane_MovieCrop.vue";
import Help_MovieCrop from "@/app/movie_crop/Help_MovieCrop.vue";
import HistoryStore, {HistoryRecord} from "@/store/HistoryStore";
import AnnotationFilesStore from "@/store/AnnotationFilesStore";
import HelpStore from "@/components/UI_Singleton/Help/HelpStore";
import VideoPlayerStore from "@/components/UI_Singleton/Player/VideoPlayerStore";
import OperationStore_MovieCrop from "@/app/movie_crop/store/OperationStore_MovieCrop";
import EditSequencesStore from "@/store/EditSequenceStore";
import AnnotationsStore_MovieCrop from "@/app/movie_crop/store/AnnotationsStore_MovieCrop";
import AnnotationPageLayout from "@/components/Layout/AnnotationPageLayout.vue";


@Component({
  components: {
    AnnotationPageLayout,
    MenuPane_MovieCrop,
    CanvasPane_MovieCrop,
    Help_MovieCrop,
  },
})
export default class Home_MovieCrop extends Vue {
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
          OperationStore_MovieCrop.setOperation(current.value.operation);
          EditSequencesStore.setSequences(current.value.editSequence);
          AnnotationsStore_MovieCrop.setAnnotation(current.value.annotation);
        }
    );
  }

  destroyed() {
    VideoPlayerStore.clear();
    AnnotationFilesStore.clear();
    HistoryStore.clear();
    HelpStore.hide();
  }

  private makeHistoryRecord() {
    return new HistoryRecord({
      operation: OperationStore_MovieCrop.operation,
      editSequence: EditSequencesStore.sequences,
      annotation: AnnotationsStore_MovieCrop.annotations,
    });
  }

  private addHistory() {
    HistoryStore.addHistory(this.makeHistoryRecord());
    EditSequencesStore.setIsDirty({frame: OperationStore_MovieCrop.frame, isDirty: true});
  }
}
</script>

<style lang="scss" scoped></style>


