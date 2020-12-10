<template>
  <MenuLayout
      :headerText="'Tracking'"
      @help="onHelp"
  >
    <SubMenu :menuTitle="'ファイル'">
      <FileSelectorSet
          :useVideoSelector="true"
          :useAnnotationSelector="isVideoSelected"
          @selectVideoFile="onSelectVideoFile"
          @selectAnnotationFiles="onSelectAnnotationFiles"
      />
    </SubMenu>

    <SubMenu v-show="isVideoSelected">
      <SubMenu :menuTitle="'データ作成'">
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
              :data="[{id:'_',text:'前フレーム全て複製'}]"
              :selectId="-1"
              :cols="1"
              @select="onSelectCopyFrame"
          />
        </Row>
      </SubMenu>

      <SubMenu v-show="selectingObject">

        <SubMenu :menuTitle="'モード選択'">
          <ButtonGrid
              :data="[{id:'bounding',text:'領域'}, {id:'bone',text:'ボーン'}, {id: 'neck_equipment', text:'首'}]"
              :selectId="selectedMode"
              :cols="2"
              @select="onSelectMode"
          />
        </SubMenu>

        <SubMenu :menuTitle="'クラス設定'">
          <ButtonGrid
              :data="[{id:'0',text:'食'},{id:'1',text:'飲'},{id:'2',text:'歩'},{id:'3',text:'立/通常'},{id:'4',text:'立/反芻'},{id:'5',text:'休/通常'}, {id:'6',text:'休/反芻'}]"
              :selectId="selectedClass"
              :cols="2"
              :font-size="11"
              @select="onSelectClass"
          />
        </SubMenu>

        <SubMenu :menuTitle="'復活'">
          <Row>
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
          </Row>
        </SubMenu>
      </SubMenu>
    </SubMenu>
  </MenuLayout>

</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator';
import AnnotationFilesStore from "@/store/AnnotationFilesStore";
import HelpStore from "@/store/HelpStore";
import VideoFileStore from "@/store/VideoFileStore";
import MenuHeader from "@/components/Menu/MenuHeader.vue";
import MenuFooter from "@/components/Menu/MenuFooter.vue";
import MenuSubTitle from "@/components/Menu/MenuSubTitle.vue";
import ButtonGrid from "@/components/UI/Button/ButtonGrid.vue";
import AnnotationsStore_Track from "@/app/track_annotation/store/AnnotationsStore_Track";
import OperationStore_Track from "@/app/track_annotation/store/OperationStore_Track";
import ScrollableArea from "@/components/UI/ScrollableArea.vue";
import FileSelectorSet from "@/components/UI/Button/FileSelectorSet.vue";
import MenuLayout from "@/components/Menu/MenuLayout.vue";
import SubMenu from "@/components/Menu/SubMenu.vue";
import Row from "@/components/UI/Layout/Row.vue";

@Component({
  components: {
    Row,
    SubMenu,
    MenuLayout,
    FileSelectorSet,
    ScrollableArea,
    ButtonGrid,
    MenuSubTitle,
    MenuFooter,
    MenuHeader,
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

  private onHelp(): void {
    HelpStore.toggle();
  }
}
</script>

<style scoped lang="scss"></style>
