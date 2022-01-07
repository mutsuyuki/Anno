<template>

  <div class="control_pane">

    <MenuHeader
        :text="'Cow Cropper'"
    />

    <div class="container">
      <MenuSubTitle :text="'ファイル'"/>
      <FileSelectorSet
          :useVideoSelector="true"
          @selectVideoFile="onSelectVideoFile"
      />

      <div class="object_detection_menu"
           v-show="isVideoSelected"
      >
        <MenuSubTitle :text="'操作'" class="subtitle"/>
        <ButtonGrid
            :class="{'disable': currentAnnotation != null}"
            :data="[{id:0,text:'新しいデータを作る'}]"
            :selectId="-1"
            :cols="1"
            @select="onSelectCreateData"
        />

        <ButtonGrid
            class="copy_button"
            :class="{'disable': isFirstFrame || currentAnnotation != null}"
            :data="[{id:'_',text:'直近フレームから複製'}]"
            :selectId="-1"
            :cols="1"
            @select="onSelectCopyFrame"
        />

        <MenuSubTitle :text="'設定'" class="subtitle"/>
        <NumberInput
            :label="'スケール'"
            @change="onChangeScale"
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
import HelpStore from "@/components/UI_Singleton/Help/HelpStore";
import VideoPlayerStore from "@/components/UI_Singleton/Player/VideoPlayerStore";
import AnnotationsStore_MovieCrop from "@/app/movie_crop/store/AnnotationsStore_MovieCrop";
import OperationStore_MovieCrop from "@/app/movie_crop/store/OperationStore_MovieCrop";
import MenuHeader from "@/components/Menu/MenuHeader.vue";
import MenuFooter from "@/components/Menu/MenuFooter.vue";
import MenuSubTitle from "@/components/Menu/MenuSubTitle.vue";
import FileSelectorSet from "@/components/UI/FileSelector/FileSelectorSet.vue";
import NumberInput from "@/components/UI/Text/NumberInput.vue";
import ButtonGrid from "@/components/UI/Button/ButtonGrid.vue";
import AnnotationsStore_Track from "@/app/track_annotation/store/AnnotationsStore_Track";
import OperationStore_Track from "@/app/track_annotation/store/OperationStore_Track";

@Component({
  components: {
    ButtonGrid,
    MenuFooter,
    NumberInput,
    FileSelectorSet,
    MenuSubTitle,
    MenuHeader
  }
})
export default class MenuPane_MovieCrop extends Vue {
  mounted() {
    AnnotationsStore_MovieCrop.create(OperationStore_MovieCrop.frame);
    OperationStore_MovieCrop.setSelectingObjectId(AnnotationsStore_MovieCrop.newestObjectId);

    document.addEventListener("keydown", (e) => {
      if (e.key == "n") {
        this.onSelectCreateData(0);
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key == "c") {
        this.onSelectCopyFrame(0);
      }
    });
  }

  get isVideoSelected() {
    return VideoPlayerStore.isSelected;
  }

  get isFirstFrame() {
    return Number(OperationStore_MovieCrop.frame) <= 0;
  }

  get currentAnnotation() {
    return AnnotationsStore_MovieCrop.annotations[OperationStore_MovieCrop.frame]
  }

  private onSelectVideoFile(files: File[]) {
    VideoPlayerStore.setFile(files[0]);
  }

  private onSelectCreateData(_: number) {
    // 各フレーム1オブジェクト限定なので、データがある場合は作成しない
    if (this.currentAnnotation != null)
      return;

    AnnotationsStore_MovieCrop.create(OperationStore_Track.frame);
    OperationStore_MovieCrop.setSelectingObjectId(AnnotationsStore_Track.newestObjectId);
    this.addHistory();
  }

  private onSelectCopyFrame(_: number) {
    // 各フレーム1オブジェクト限定なので、データがある場合はコピーしない
    if (this.currentAnnotation != null)
      return;

    AnnotationsStore_MovieCrop.copyPrevFrameObjects(OperationStore_MovieCrop.frame);
    OperationStore_MovieCrop.setSelectingObjectId(AnnotationsStore_MovieCrop.newestObjectId);

    this.addHistory();
  }

  private onChangeScale(value: number) {
    OperationStore_MovieCrop.setScale(value);
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
