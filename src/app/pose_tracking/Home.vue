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
import MenuPane from "@/app/track_annotation/MenuPane.vue";
import CanvasPane from "@/app/track_annotation/CanvasPane.vue";
import Help from "@/app/track_annotation/Help.vue";
import ImagePlayerStore from "@/components/UI_Singleton/Player/ImagePlayerStore";
import HistoryStore, {HistoryRecord} from "@/store/HistoryStore";
import AnnotationFilesStore from "@/store/AnnotationFilesStore";
import HelpStore from "@/components/UI_Singleton/Help/HelpStore";
import VideoPlayerStore from "@/components/UI_Singleton/Player/VideoPlayerStore";
import OperationStore from "@/app/track_annotation/store/OperationStore";
import EditSequencesStore from "@/store/EditSequenceStore";
import AnnotationsStore from "@/app/track_annotation/store/AnnotationsStore";
import AnnotationPageLayout from "@/components/Layout/AnnotationPageLayout.vue";

@Component({
  components: {
    AnnotationPageLayout,
    CanvasPane_Track: CanvasPane,
    MenuPane_Track: MenuPane,
    Help_Track: Help,
  },
})
export default class Home extends Vue {

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
    return new HistoryRecord({
      editSequence: EditSequencesStore.sequences,
      operation: OperationStore.operation,
      annotation: AnnotationsStore.annotations,
    });
  }

  private addHistory() {
    HistoryStore.addHistory(this.makeHistoryRecord());
    EditSequencesStore.setIsDirty({frame: OperationStore.frame, isDirty: true});
  }
}
</script>

<style lang="scss" scoped></style>


