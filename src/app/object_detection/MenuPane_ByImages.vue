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
import HelpStore from "@/components/UI_Singleton/Help/HelpStore";
import MenuHeader from "@/components/Menu/MenuHeader.vue";
import MenuFooter from "@/components/Menu/MenuFooter.vue";
import MenuSubTitle from "@/components/Menu/MenuSubTitle.vue";
import ButtonGrid from "@/components/UI/Button/ButtonGrid.vue";
import AnnotationsStore
  from "@/app/object_detection/store/AnnotationsStore";
import OperationStore from "@/app/object_detection/store/OperationStore";
import ClassEditor from "@/components/UI/ClassEditor/ClassEditor.vue";
import ClassListStore from "@/components/UI/ClassEditor/ClassListStore";
import ImagePlayerStore from "@/components/UI_Singleton/Player/ImagePlayerStore";
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
export default class MenuPane_ByImages extends Vue {

  get isImagesSelected() {
    return ImagePlayerStore.isSelected;
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

  get classes() {
    return ClassListStore.classesArray;
  }

  mounted() {
    ClassListStore.addClass({id: "0", text: "piman"});
    ClassListStore.addClass({id: "1", text: "stem"});

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
    ImagePlayerStore.setFiles(files);
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
    const frame = OperationStore.frame;
    const objectId = OperationStore.selectingObjectId;

    AnnotationsStore.copyObject({frame: frame, objectId: objectId});
    OperationStore.setSelectingObjectId(AnnotationsStore.newestObjectId);

    this.addHistory();
  }

  private onSelectClass(classNo: number) {
    console.log("class is ", classNo);
    const frame = OperationStore.frame;
    const objectId = OperationStore.selectingObjectId;
    AnnotationsStore.setClass({frame: frame, objectId: objectId, class: classNo});

    this.addHistory();
  }

  private onDeleteClass(classNo: number) {
    ClassListStore.removeClass(classNo.toString());
  }

  private onAddClass(className: string) {
    ClassListStore.addClassByName(className);
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
