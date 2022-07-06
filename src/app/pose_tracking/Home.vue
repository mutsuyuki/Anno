<template>
  <div>
    <AnnotationPageLayout>
      <template v-slot:menu>
        <MenuPane @addHistory="addHistory"/>
      </template>

      <template v-slot:editor>
        <CanvasPane @addHistory="addHistory"/>
      </template>

      <template v-slot:size-check-target>
        <video :src="sizeCheckVideoUrl"></video>
      </template>

      <template v-slot:help>
        <Help/>
      </template>
    </AnnotationPageLayout>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import MenuPane from "@/app/pose_tracking/MenuPane.vue";
import CanvasPane from "@/app/pose_tracking/CanvasPane.vue";
import Help from "@/app/pose_tracking/Help.vue";
import ImagePlayerStore from "@/components/UI_Singleton/Player/ImagePlayerStore";
import HistoryStore, {HistoryRecord} from "@/store/HistoryStore";
import AnnotationFilesStore from "@/store/AnnotationFilesStore";
import HelpStore from "@/components/UI_Singleton/Help/HelpStore";
import VideoPlayerStore from "@/components/UI_Singleton/Player/VideoPlayerStore";
import OperationStore from "@/app/pose_tracking/store/OperationStore";
import EditStateStore from "@/store/EditStateStore";
import AnnotationsStore from "@/app/pose_tracking/store/AnnotationsStore";
import AnnotationPageLayout from "@/components/Layout/AnnotationPageLayout.vue";

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
          EditStateStore.setSequences(current.value.editSequence);
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


