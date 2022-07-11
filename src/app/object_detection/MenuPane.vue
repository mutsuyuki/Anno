<template>

  <div class="control_pane">

    <MenuHeader
        :text="'Object Detection'"
    />

    <div class="container">
      <MenuSubTitle :text="'ファイル'"/>
      <FileSelectorSet
          :useVideoSelector="true"
          :useAnnotationSelector="isVideoSelected"
          @selectVideoFile="onSelectVideoFile"
          @selectAnnotationFiles="onSelectAnnotationFiles"
      />

      <div class="object_detection_menu"
           v-show="isVideoSelected"
      >
        <MenuSubTitle :text="'データ作成'" class="subtitle"/>
        <ButtonGrid
            :data="[{id:'_',text:'新しいデータを作る'}]"
            :cols="1"
            @select="onSelectCreateData"
        />

        <div v-show="selectingObject">

          <ButtonGrid
              class="copy_button"
              :class="{'disable': !selectingObject}"
              :data="[{id:'_',text:'選択中データを複製'}]"
              :cols="1"
              @select="onSelectCopyData"
          />

          <MenuSubTitle :text="'クラス設定'" class="subtitle"/>
          <ClassEditor
              :classes="classes"
              :selectedId="selectedClass"
              :enableAdd="true"
              :enableDelete="true"
              @select="onSelectClass"
              @delete="onDeleteClass"
              @add="onAddClass"
          />
        </div>

      </div>
    </div>

    <MenuFooter
        :text="'Enjoy Annotation!'"
        @help="onClickHelp"
    />

  </div>

</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator';
import FileSelector from "@/components/UI/FileSelector/FileSelector.vue";
import MenuHeader from "@/components/Menu/MenuHeader.vue";
import MenuFooter from "@/components/Menu/MenuFooter.vue";
import MenuSubTitle from "@/components/Menu/MenuSubTitle.vue";
import ButtonGrid from "@/components/UI/Button/ButtonGrid.vue";
import ClassEditor from "@/components/UI/ClassEditor/ClassEditor.vue";
import FileSelectorSet from "@/components/UI/FileSelector/FileSelectorSet.vue";
import HelpStore from "@/components/UI_Singleton/Help/HelpStore";
import VideoPlayerStore from "@/components/UI_Singleton/Player/VideoPlayerStore";
import AnnotationsStore from "@/app/object_detection/store/AnnotationsStore";
import OperationStore from "@/app/object_detection/store/OperationStore";
import AnnotationFilesStore from "@/store/AnnotationFilesStore";
import ClassListStore from "@/app/object_detection/store/ClassListStore";

@Component({
  components: {
    FileSelectorSet,
    ClassEditor,
    ButtonGrid,
    MenuSubTitle,
    MenuFooter,
    MenuHeader,
    FileSelector
  }
})
export default class MenuPane extends Vue {
  mounted() {
    document.addEventListener("keydown", (e) => {
      if (e.key == "c") {
        this.onSelectCreateData(-1);
      }
      if (parseInt(e.key)) {
        this.onSelectClass(e.key);
      }
    });
  }

  get isVideoSelected() {
    return VideoPlayerStore.isSelected;
  }

  get classes(){
    return ClassListStore.classList
  }

  get selectedClass() {
    return this.selectingObject ? this.selectingObject.class : -1;
  }

  get selectingObject() {
    const frame = OperationStore.frame;
    if (!AnnotationsStore.annotations[frame])
      return null;

    const objectId = OperationStore.selectingObjectId;
    return AnnotationsStore.annotations[frame][objectId];
  }

  private onSelectVideoFile(files: File[]) {
    VideoPlayerStore.setFile(files[0]);
    AnnotationFilesStore.setFiles([]);
  }

  private onSelectAnnotationFiles(files: File[]) {
    if (!confirm("今編集中のアノテーションは消えてしまいますがよろしいですか？"))
      return;

    AnnotationFilesStore.setFiles(files);
  }

  private onSelectCreateData(_: number) {
    AnnotationsStore.create(OperationStore.frame);
    OperationStore.setSelectingObjectId(AnnotationsStore.newestObjectId);
    this.addHistory();
  }

  private onSelectCopyData() {
    AnnotationsStore.copyObject({
      frame: OperationStore.frame,
      objectId: OperationStore.selectingObjectId
    });
    OperationStore.setSelectingObjectId(AnnotationsStore.newestObjectId);

    this.addHistory();
  }

  private onSelectClass(classNo: string) {
    AnnotationsStore.setClass({
      frame: OperationStore.frame,
      objectId: OperationStore.selectingObjectId,
      class: classNo
    });
    this.addHistory();
  }

  private onDeleteClass(classNo: string) {
    ClassListStore.deleteClass(classNo)
    this.addHistory();
  }

  private onAddClass(className: string) {
    ClassListStore.addClassByName(className)
    this.addHistory();
  }


  private addHistory() {
    this.$emit("addHistory")
  }

  private onClickHelp(): void {
    HelpStore.toggle();
  }
}
</script>

<style scoped lang="scss">

.container {
  padding: 16px;
  height: calc(100vh - 40px - 40px); // 100vh - header - footer

  .copy_button {
    margin-top: 8px;
  }

  .object_detection_menu {
    .subtitle {
      margin-top: 24px;
    }
  }
}

</style>