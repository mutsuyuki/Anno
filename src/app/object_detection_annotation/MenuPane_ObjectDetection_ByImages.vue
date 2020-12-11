<template>
  <div class="control_pane">

    <MenuHeader
        :text="'Object Detection'"
    />

    <div class="container">
      <MenuSubTitle :text="'ファイル'"/>
      <FileSelectorSet
          :useImagesSelector="true"
          :useAnnotationSelector="isImagesSelected"
          @selectImageFiles="onSelectImageFiles"
          @selectAnnotationFiles="onSelectAnnotationFiles"
      />

      <div class="object_detection_menu"
           v-show="isImagesSelected"
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
              :selectId="selectedClass"
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
import AnnotationFilesStore from "@/store/AnnotationFilesStore";
import FileSelector from "@/components/UI/FileSelector/FileSelector.vue";
import HelpStore from "@/store/HelpStore";
import MenuHeader from "@/components/Menu/MenuHeader.vue";
import MenuFooter from "@/components/Menu/MenuFooter.vue";
import MenuSubTitle from "@/components/Menu/MenuSubTitle.vue";
import ButtonGrid from "@/components/UI/Button/ButtonGrid.vue";
import AnnotationsStore_ObjectDetection
  from "@/app/object_detection_annotation/store/AnnotationsStore_ObjectDetection";
import OperationStore_ObjectDetection from "@/app/object_detection_annotation/store/OperationStore_ObjectDetection";
import ClassEditor from "@/components/UI/Button/ClassEditor.vue";
import ClassesStore from "@/store/ClassesStore";
import ImageFilesStore from "@/store/ImageFilesStore";
import FileSelectorSet from "@/components/UI/FileSelector/FileSelectorSet.vue";

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
export default class MenuPane_ObjectDetection_ByImages extends Vue {

  get isImagesSelected() {
    return ImageFilesStore.isSelected;
  }

  get selectedClass() {
    return this.selectingObject ? this.selectingObject.class : -1;
  }

  get selectingObject() {
    const frame = OperationStore_ObjectDetection.frame;
    if (!AnnotationsStore_ObjectDetection.annotations[frame])
      return null;

    const objectId = OperationStore_ObjectDetection.selectingObjectId;
    return AnnotationsStore_ObjectDetection.annotations[frame][objectId];
  }

  get classes() {
    return ClassesStore.classesArray;
  }

  mounted() {
    ClassesStore.addClass({id: "0", text: "piman"});
    ClassesStore.addClass({id: "1", text: "stem"});

    document.addEventListener("keydown", (e) => {
      if (e.key == "c") {
        this.onSelectCreateData(-1);
      }
      if (e.key == "0") {
        this.onSelectClass("0" as any);
      }
      if (e.key == "1") {
        this.onSelectClass("1" as any);
      }
    });
  }

  private onSelectImageFiles(files: File[]) {
    ImageFilesStore.setFiles(files);
    AnnotationFilesStore.setFiles([]);
  }

  private onSelectAnnotationFiles(files: File[]) {
    if (!confirm("今編集中のアノテーションは消えてしまいますがよろしいですか？"))
      return;

    AnnotationFilesStore.setFiles(files);
  }

  private onSelectCreateData(_: number) {
    AnnotationsStore_ObjectDetection.create(OperationStore_ObjectDetection.frame);
    OperationStore_ObjectDetection.setSelectingObjectId(AnnotationsStore_ObjectDetection.newestObjectId);
    this.addHistory();
  }

  private onSelectCopyData() {
    const frame = OperationStore_ObjectDetection.frame;
    const objectId = OperationStore_ObjectDetection.selectingObjectId;

    AnnotationsStore_ObjectDetection.copyObject({frame: frame, objectId: objectId});
    OperationStore_ObjectDetection.setSelectingObjectId(AnnotationsStore_ObjectDetection.newestObjectId);

    this.addHistory();
  }

  private onSelectClass(classNo: number) {
    console.log("class is ", classNo);
    const frame = OperationStore_ObjectDetection.frame;
    const objectId = OperationStore_ObjectDetection.selectingObjectId;
    AnnotationsStore_ObjectDetection.setClass({frame: frame, objectId: objectId, class: classNo});

    this.addHistory();
  }

  private onDeleteClass(classNo: number) {
    ClassesStore.removeClass(classNo.toString());
  }

  private onAddClass(className: string) {
    ClassesStore.addClassByName(className);
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
