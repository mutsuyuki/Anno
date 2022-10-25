<template>
  <MenuLayout
      :headerText="'Pore'"
      :footerText="'Enjoy Annotation!'"
      @help="$emit('help')"
  >

    <SubMenu :menuTitle="'ファイル'">
      <FileSelectorSet
          :useVideoSelector="false"
          :useImagesSelector="true"
          :useAnnotationSelector="isImagesSelected"
          @selectImageFiles="onSelectImageFiles"
          @selectAnnotationFiles="onSelectAnnotationFiles"
      />
    </SubMenu>

  </MenuLayout>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator';
import MenuHeader from "@/components/Menu/MenuHeader.vue";
import MenuFooter from "@/components/Menu/MenuFooter.vue";
import FileSelectorSet from "@/components/UI/FileSelector/FileSelectorSet.vue";
import MenuSubTitle from "@/components/Menu/MenuSubTitle.vue";
import MenuLayout from "@/components/Menu/MenuLayout.vue";
import SubMenu from "@/components/Menu/SubMenu.vue";
import EditStateStore from "@/store/EditStateStore";
import HistoryStore from "@/store/HistoryStore";
import FileStore from "@/app/pore_detection/store/FileStore";

@Component({
  components: {
    SubMenu,
    MenuLayout,
    MenuSubTitle,
    FileSelectorSet,
    MenuFooter,
    MenuHeader,
  }
})
export default class MenuPane extends Vue {

  get isImagesSelected() {
    return FileStore.isImageFilesSelected;
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

}
</script>

<style scoped lang="scss"></style>
