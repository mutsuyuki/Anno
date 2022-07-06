<template>
  <AnnotationPageLayout>
    <template v-slot:menu>
      <MenuPane_ByImages @addHistory="addHistory"/>
    </template>

    <template v-slot:editor>
      <CanvasPane_ByImages @addHistory="addHistory"/>
    </template>

    <template v-slot:size-check-target>
      <img :src="sizeCheckVideoUrl">
    </template>

    <template v-slot:help>
      <Help/>
    </template>
  </AnnotationPageLayout>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import MenuPane_ByImages from "@/app/object_detection/MenuPane_ByImages.vue";
import CanvasPane_ByImages from "@/app/object_detection/CanvasPane_ByImages.vue";
import Help from "@/app/object_detection/Help.vue";
import HistoryStore, {HistoryRecord} from "@/store/HistoryStore";
import AnnotationFilesStore from "@/store/AnnotationFilesStore";
import HelpStore from "@/components/UI_Singleton/Help/HelpStore";
import OperationStore from "@/app/object_detection/store/OperationStore";
import EditStateStore from "@/store/EditStateStore";
import AnnotationsStore from "@/app/object_detection/store/AnnotationsStore";
import ImagePlayerStore from "@/components/UI_Singleton/Player/ImagePlayerStore";
import AnnotationPageLayout from "@/components/Layout/AnnotationPageLayout.vue";

@Component({
  components: {
    AnnotationPageLayout,
    CanvasPane_ByImages,
    MenuPane_ByImages,
    Help,
  },
})
export default class Home_ByImages extends Vue {

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

<style lang="scss" scoped></style>


