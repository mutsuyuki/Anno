<template>
  <div class="control_pane">

    <MenuHeader
        :text="'Tracking'"
    />

    <ScrollableArea class="container">
      <MenuSubTitle :text="'ファイル'"/>
      <div class="file_selectors">
        <FileSelector
            :iconPath="require('@/assets/img/icons/video.svg')"
            :message="'動画を選択'"
            :accept="'video/*'"
            :isMultiple="false"
            @change="onSelectVideoFile"
        />

        <FileSelector
            v-show="isVideoSelected"
            :iconPath="require('@/assets/img/icons/text_multi.svg')"
            :message="'教師データを選択'"
            :accept="'application/json'"
            :isMultiple="true"
            @change="onSelectAnnotationFiles"
        />
      </div>

      <div class="track_menu"
           v-show="isVideoSelected"
      >
        <MenuSubTitle :text="'データ作成'" class="subtitle"/>
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
            :data="[{id:'_',text:'前フレーム全て複製'}]"
            :selectId="-1"
            :cols="1"
            @select="onSelectCopyFrame"
        />

        <div
            v-show="selectingObject"
        >

          <MenuSubTitle :text="'クラス設定'" class="subtitle"/>
          <ButtonGrid
              :data="[{id:'0',text:'食'},{id:'1',text:'飲'},{id:'2',text:'歩'},{id:'3',text:'立/通常'},{id:'4',text:'立/反芻'},{id:'5',text:'休/通常'}, {id:'6',text:'休/反芻'}]"
              :selectId="selectedClass"
              :cols="2"
              :font-size="11"
              @select="onSelectClass"
          />

          <MenuSubTitle :text="'モード選択'" class="subtitle"/>
          <ButtonGrid
              :data="[{id:'bounding',text:'領域'}, {id:'bone',text:'ボーン'}, {id: 'neck_equipment', text:'首'}]"
              :selectId="selectedMode"
              :cols="2"
              @select="onSelectMode"
          />

          <MenuSubTitle :text="'復活'" class="subtitle"/>
          <ButtonGrid
              :data="[{id:'_',text:'削除した関節を復活'}]"
              :cols="1"
              @select="onClickRebirthJoint"
          />
          <ButtonGrid
              style="margin-top: 8px"
              :data="[{id:'_',text:'削除した首装置を復活'}]"
              :cols="1"
              @select="onClickRebirthNeckEquipment"
          />
        </div>
      </div>
    </ScrollableArea>

    <MenuFooter
        :text="'Enjoy Annotation!'"
        @help="onClickHelp"
    />

  </div>

</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator';
import AnnotationFilesStore from "@/store/AnnotationFilesStore";
import FileSelector from "@/components/Menu/FileSelector.vue";
import HelpStore from "@/store/HelpStore";
import VideoFileStore from "@/store/VideoFileStore";
import MenuHeader from "@/components/Menu/MenuHeader.vue";
import MenuFooter from "@/components/Menu/MenuFooter.vue";
import MenuSubTitle from "@/components/Menu/MenuSubTitle.vue";
import ButtonGrid from "@/components/Menu/ButtonGrid.vue";
import AnnotationsStore_Track from "@/app/track_annotation/store/AnnotationsStore_Track";
import OperationStore_Track from "@/app/track_annotation/store/OperationStore_Track";
import ScrollableArea from "@/components/Layout/ScrollableArea.vue";

@Component({
  components: {
    ScrollableArea,
    ButtonGrid,
    MenuSubTitle,
    MenuFooter,
    MenuHeader,
    FileSelector
  }
})
export default class MenuPane_Track extends Vue {

  get isVideoSelected() {
    return VideoFileStore.isSelected;
  }

  get selectedClass() {
    return this.selectingObject ? this.selectingObject.class : -1;
  }

  get selectedMode() {
    return OperationStore_Track.annotationMode;
  }

  get selectingObject() {
    const frame = OperationStore_Track.frame;
    if (!AnnotationsStore_Track.annotations[frame])
      return null;

    const objectId = OperationStore_Track.selectingObjectId;
    return AnnotationsStore_Track.annotations[frame][objectId];
  }

  get isFirstFrame() {
    return Number(OperationStore_Track.frame) <= 0;
  }

  private onSelectVideoFile(files: File[]) {
    VideoFileStore.setFile(files[0]);
    AnnotationFilesStore.setFiles([]);
  }

  private onSelectAnnotationFiles(files: File[]) {
    if (!confirm("今編集中のアノテーションは消えてしまいますがよろしいですか？"))
      return;

    AnnotationFilesStore.setFiles(files);
  }

  private onSelectCreateData(_: number) {
    AnnotationsStore_Track.create(OperationStore_Track.frame);
    OperationStore_Track.setSelectingObjectId(AnnotationsStore_Track.newestObjectId);
    OperationStore_Track.setModeToBounding();
    this.addHistory();
  }

  private onSelectCopyData(_: string) {
    const frame = OperationStore_Track.frame;
    const objectId = OperationStore_Track.selectingObjectId;

    AnnotationsStore_Track.copyObject({frame: frame, objectId: objectId});
    OperationStore_Track.setSelectingObjectId(AnnotationsStore_Track.newestObjectId);
    OperationStore_Track.setModeToBounding();

    this.addHistory();
  }

  private onSelectCopyFrame(_: string) {
    const frame = OperationStore_Track.frame;
    const objectId = OperationStore_Track.selectingObjectId;

    AnnotationsStore_Track.copyPrevFrameObjects(frame);
    OperationStore_Track.setSelectingObjectId(AnnotationsStore_Track.newestObjectId);
    OperationStore_Track.setModeToBounding();

    this.addHistory();
  }

  private onSelectClass(classNo: string) {
    const frame = OperationStore_Track.frame;
    const objectId = OperationStore_Track.selectingObjectId;
    AnnotationsStore_Track.setClass({frame: frame, objectId: objectId, class: classNo});

    this.addHistory();
  }

  private onSelectMode(mode: string) {
    switch (mode) {
      case "bounding":
        OperationStore_Track.setModeToBounding();
        break;
      case "bone":
        OperationStore_Track.setModeToBone();
        break;
      case "neck_equipment":
        OperationStore_Track.setModeToNeckEquipment();
        break;
    }
  }

  private onClickRebirthJoint(_: number) {
    const frame = OperationStore_Track.frame;
    const objectId = OperationStore_Track.selectingObjectId;
    AnnotationsStore_Track.rebirthJoint({frame: frame, objectId: objectId});
  }

  private onClickRebirthNeckEquipment(_: number) {
    const frame = OperationStore_Track.frame;
    const objectId = OperationStore_Track.selectingObjectId;
    AnnotationsStore_Track.rebirthNeckEquipment({frame: frame, objectId: objectId});
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

  .file_selectors {
    *:nth-child(n + 2) {
      margin-top: 8px;
    }
  }

  .copy_button {
    margin-top: 8px;
  }

  .track_menu {
    .subtitle {
      margin-top: 24px;
    }
  }
}


</style>
