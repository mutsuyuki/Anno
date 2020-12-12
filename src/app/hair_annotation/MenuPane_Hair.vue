<template>
  <div class="control_pane">

    <MenuHeader
        :text="'Hair direction'"
    />

    <div class="container">
      <div class="container_above">
        <FileSelector
            :iconPath="require('@/assets/img/icons/image_multi.svg')"
            :message="'画像を選択'"
            :accept="'image/*'"
            :isMultiple="true"
            @change="onSelectImageFiles"
        />

        <FileSelector
            v-show="isImageSelected"
            :iconPath="require('@/assets/img/icons/text_multi.svg')"
            :message="'教師データを選択'"
            :accept="'text/*'"
            :isMultiple="true"
            @change="onSelectAnnotationFiles"
        />
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
import ImagePlayerStore from "@/components/UI_Singleton/Player/ImagePlayerStore";
import AnnotationFilesStore from "@/store/AnnotationFilesStore";
import FileSelector from "@/components/UI/FileSelector/FileSelector.vue";
import HelpStore from "@/components/UI_Singleton/Help/HelpStore";
import MenuHeader from "@/components/Menu/MenuHeader.vue";
import MenuFooter from "@/components/Menu/MenuFooter.vue";

@Component({
  components: {
    MenuFooter,
    MenuHeader,
    FileSelector
  }
})
export default class MenuPane_Hair extends Vue {

  get isImageSelected() {
    return ImagePlayerStore.numberOfItems > 0;
  }

  private onSelectImageFiles(files: File[]) {
    ImagePlayerStore.setFiles(files);
    AnnotationFilesStore.setFiles([]);
  }

  private onSelectAnnotationFiles(files: File[]) {
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
