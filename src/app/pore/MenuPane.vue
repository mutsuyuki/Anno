<template>
  <div class="control_pane">

    <MenuHeader
        :text="'Pore'"
    />

    <div class="container">
      <MenuSubTitle :text="'ファイル'"/>
      <FileSelectorSet
          :useImagesSelector="true"
          :useAnnotationSelector="isImagesSelected"
          @selectImageFiles="onSelectImageFiles"
          @selectAnnotationFiles="onSelectAnnotationFiles"
      />
    </div>

    <MenuFooter
        :text="'Enjoy Annotation!'"
        @help="onClickHelp"
    />

  </div>

</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator';
import ImagePlayerStore from "@/components/UI_Singleton/Player/ImagePlayerStore";
import AnnotationFilesStore from "@/store/AnnotationFilesStore";
import HelpStore from "@/components/UI_Singleton/Help/HelpStore";
import MenuHeader from "@/components/Menu/MenuHeader.vue";
import MenuFooter from "@/components/Menu/MenuFooter.vue";
import FileSelectorSet from "@/components/UI/FileSelector/FileSelectorSet.vue";
import MenuSubTitle from "@/components/Menu/MenuSubTitle.vue";

@Component({
  components: {
    MenuSubTitle,
    FileSelectorSet,
    MenuFooter,
    MenuHeader,
  }
})
export default class MenuPane extends Vue {

  get isImagesSelected() {
    return ImagePlayerStore.isSelected;
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

  private onClickHelp(): void {
    HelpStore.toggle();
  }
}
</script>

<style scoped lang="scss">

.container {
  padding: 16px;
  height: calc(100vh - 40px - 40px); // 100vh - header - footer

  .container_above {
    *:nth-child(n + 2) {
      margin-top: 8px;
    }
  }
}


</style>
