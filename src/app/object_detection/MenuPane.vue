<template>
  <MenuLayout
      :headerText="'Object Detection'"
      :footerText="'Enjoy Annotation!'"
      @help="$emit('help')"
  >
    <SubMenu :menuTitle="'ファイル'">
      <FileSelectorSet
          :useVideoSelector="true"
          :useImagesSelector="true"
          :useAnnotationSelector="isVideoSelected || isImagesSelected"
          @selectVideoFile="onSelectVideoFile"
          @selectImageFiles="onSelectImageFiles"
          @selectAnnotationFiles="onSelectAnnotationFiles"
      />
    </SubMenu>

    <SubMenu v-show="isVideoSelected || isImagesSelected"
             :menuTitle="'データ作成'"
    >
      <Row>
        <ButtonGrid
            :data="[{id:0,text:'新しいデータを作る'}]"
            :selectId="-1"
            :cols="1"
            @select="onSelectCreateData"
        />

        <ButtonGrid
            class="copy_button"
            :class="{'disable': !selectingObject}"
            :data="[{id:'_',text:'選択中データを複製'}]"
            :selectId="-1"
            :cols="1"
            @select="onSelectCopyData"
        />

        <ButtonGrid
            class="copy_button"
            :class="{'disable': isFirstFrame}"
            :data="[{id:'_',text:'直近フレームから複製'}]"
            :selectId="-1"
            :cols="1"
            @select="onSelectCopyFrame"
        />
      </Row>
    </SubMenu>

    <SubMenu v-show="selectingObject"
             :menuTitle="'クラス設定'"
    >
      <ClassEditor
          :classes="classes"
          :selectedId="selectedClass"
          :enableAdd="true"
          :enableDelete="true"
          @select="onSelectClass"
          @delete="onDeleteClass"
          @add="onAddClass"
      />
    </SubMenu>

  </MenuLayout>
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
import MenuLayout from "@/components/Menu/MenuLayout.vue";
import SubMenu from "@/components/Menu/SubMenu.vue";
import Row from "@/components/Layout/Row.vue";
import AnnotationsStore from "@/app/object_detection/store/AnnotationsStore";
import OperationStore from "@/app/object_detection/store/OperationStore";
import ClassListStore from "@/app/object_detection/store/ClassListStore";
import FileStore from "@/app/object_detection/store/FileStore";
import EditStateStore from "@/store/EditStateStore";
import HistoryStore from "@/store/HistoryStore";

@Component({
  components: {
    Row,
    SubMenu,
    MenuLayout,
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
    return FileStore.isVideoFileSelected;
  }

  get isImagesSelected() {
    return FileStore.isImageFilesSelected;
  }

  get classes() {
    return ClassListStore.classList
  }

  get selectedClass() {
    return this.selectingObject ? this.selectingObject.class : -1;
  }

  get isFirstFrame() {
    return Number(OperationStore.frame) <= 0;
  }

  get selectingObject() {
    const frame = OperationStore.frame;
    if (!AnnotationsStore.annotations[frame])
      return null;

    const objectId = OperationStore.selectingObjectId;
    return AnnotationsStore.annotations[frame][objectId];
  }

  private onSelectVideoFile(files: File[]) {
    EditStateStore.clear();
    HistoryStore.clear();
    FileStore.setVideoFile(files[0])
  }

  private onSelectImageFiles(files: File[]) {
    EditStateStore.clear();
    HistoryStore.clear();
    FileStore.setImageFiles(files)
  }

  private onSelectAnnotationFiles(files: File[]) {
    if (!confirm("今編集中のアノテーションは消えてしまいますがよろしいですか？"))
      return;

    FileStore.setAnnotationFiles(files)
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

  private onSelectCopyFrame(_: string) {
    AnnotationsStore.copyPrevFrameObjects(OperationStore.frame);
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

}
</script>

<style scoped lang="scss"></style>
