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

      <!--データ選択時表示メニュー-->
      <SubMenu v-show="selectingObject">
        <SubMenu :menuTitle="'モード選択'">
          <ButtonGrid
              :data="[
                  {id:'bounding',text:'領域'},
                  {id:'bone',text:'ボーン'},
                  {id:'neck_mark', text:'首'}
              ]"
              :selectId="selectedMode"
              :cols="3"
              @select="onSelectMode"
          />
        </SubMenu>

        <!--矩形選択モード-->
        <SubMenu v-show="selectedMode==='bounding'">
          <SubMenu :menuTitle="'クラス設定'">
            <ButtonGrid
                :data="behaviours"
                :selectId="selectedClass"
                :cols="3"
                :font-size="11"
                @select="onSelectBehaviour"
            />
          </SubMenu>
        </SubMenu>

        <!--ボーンモード-->
        <SubMenu v-show="selectedMode==='bone'">
          <SubMenu v-show="!isNeckExist" :menuTitle="'反転'">
            <ButtonGrid
                :data="[{id:'_',text:'左右反転'}]"
                :cols="1"
                @select="onClickFlipJoint"
            />
          </SubMenu>
          <SubMenu :menuTitle="'復活'">
            <ButtonGrid
                :data="[{id:'_',text:'削除した関節を復活'}]"
                :cols="1"
                @select="onClickRebirthJoint"
            />
          </SubMenu>
        </SubMenu>

        <!--首装置モード-->
        <SubMenu v-show="selectedMode==='neck_mark'">
          <SubMenu v-show="!isNeckExist" :menuTitle="'データ追加'">
            <ButtonGrid
                :data="[{id:'_',text:'首装置を追加'}]"
                :cols="1"
                @select="onClickCreateNeckMark"
            />
          </SubMenu>
          <SubMenu v-show="isNeckExist" :menuTitle="'クラス設定'">
            <ButtonGrid
                :data="neckMarks"
                :selectId="selectedClass"
                :cols="5"
                :font-size="11"
                @select="onSelectNeckMark"
            />
          </SubMenu>
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
import {BEHAVIOUR, NECK_MARK} from "@/app/track_annotation/const/TrackConst";

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
    return this.selectingObject ? this.selectingObject.behaviour_class : -1;
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

  get isNeckExist() {
    return this.selectingObject?.neck_mark_bounding.left != -9999;
  }

  get behaviours() {
    return Object.keys(BEHAVIOUR).map(key => ({id: key, text: BEHAVIOUR[key]}));
  }

  get neckMarks() {
    return Object.keys(NECK_MARK).map(key => ({id: key, text: NECK_MARK[key]})) ;
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

  private onSelectMode(mode: string) {
    switch (mode) {
      case "bounding":
        OperationStore_Track.setModeToBounding();
        break;
      case "bone":
        OperationStore_Track.setModeToBone();
        break;
      case "neck_mark":
        OperationStore_Track.setModeToNeckMark();
        break;
    }
  }

  private onSelectBehaviour(classNo: string) {
    const frame = OperationStore_Track.frame;
    const objectId = OperationStore_Track.selectingObjectId;
    AnnotationsStore_Track.setBehaviour({frame: frame, objectId: objectId, behaviour_class: classNo});

    this.addHistory();
  }

  private onClickFlipJoint(_: number) {
    const frame = OperationStore_Track.frame;
    const objectId = OperationStore_Track.selectingObjectId;
    AnnotationsStore_Track.flipJoint({frame: frame, objectId: objectId});
  }

  private onClickRebirthJoint(_: number) {
    const frame = OperationStore_Track.frame;
    const objectId = OperationStore_Track.selectingObjectId;
    AnnotationsStore_Track.rebirthJoint({frame: frame, objectId: objectId});
  }

  private onClickCreateNeckMark(_: number) {
    const frame = OperationStore_Track.frame;
    const objectId = OperationStore_Track.selectingObjectId;
    AnnotationsStore_Track.createNeckMark({frame: frame, objectId: objectId});
  }

  private onSelectNeckMark(classNo: string) {
    const frame = OperationStore_Track.frame;
    const objectId = OperationStore_Track.selectingObjectId;
    AnnotationsStore_Track.setNeckMarkClass({frame: frame, objectId: objectId, neck_mark_class: classNo});

    this.addHistory();
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
