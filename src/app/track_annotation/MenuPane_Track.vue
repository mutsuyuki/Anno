<template>
    <div class="control_pane">

        <MenuHeader
                :text="'Tracking'"
        />

        <div class="container">
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
                        :accept="'text/*'"
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

                <div
                        v-show="selectingObject"
                >
                    <MenuSubTitle :text="'データの複製'" class="subtitle"/>
                    <ButtonGrid
                            :data="[{id:0,text:'選択中データを複製'},{id:1,text:'前フレーム全て複製'}]"
                            :selectId="-1"
                            :cols="1"
                            @select="onSelectCopyData"
                    />

                    <MenuSubTitle :text="'クラス設定'" class="subtitle"/>
                    <ButtonGrid
                            :data="[{id:0,text:'食'},{id:1,text:'歩'},{id:2,text:'立'},{id:3,text:'休'},{id:4,text:'飲'}]"
                            :selectId="selectedClass"
                            :cols="5"
                            :font-size="11"
                            @select="onSelectClass"
                    />

                    <MenuSubTitle :text="'モード選択'" class="subtitle"/>
                    <ButtonGrid
                            :data="[{id:0,text:'領域'}, {id:1,text:'ボーン'}]"
                            :selectId="selectedMode"
                            :cols="2"
                            @select="onSelectMode"
                    />

                    <MenuSubTitle :text="'データビュー'" class="subtitle"/>
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
    import FileSelector from "@/components/Menu/FileSelector.vue";
    import HelpStore from "@/store/HelpStore";
    import VideoFileStore from "@/store/VideoFileStore";
    import MenuHeader from "@/components/Menu/MenuHeader.vue";
    import MenuFooter from "@/components/Menu/MenuFooter.vue";
    import MenuSubTitle from "@/components/Menu/MenuSubTitle.vue";
    import ButtonGrid from "@/components/Menu/ButtonGrid.vue";
    import AnnotationsStore_Track from "@/app/track_annotation/store/AnnotationsStore_Track";
    import OperationStore_Track from "@/app/track_annotation/store/OperationStore_Track";

    @Component({
        components: {
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

        private onSelectVideoFile(files: File[]) {
            VideoFileStore.setFile(files[0]);
            AnnotationFilesStore.setFiles([]);
        }

        private onSelectAnnotationFiles(files: File[]) {
            AnnotationFilesStore.setFiles(files);
        }


        private onSelectCreateData(_: number) {
            AnnotationsStore_Track.create(OperationStore_Track.frame);
            OperationStore_Track.setSelectingObjectId(AnnotationsStore_Track.newestObjectId);
            OperationStore_Track.setModeToBounding();
        }

        private onSelectCopyData(copyMenuId: number) {
            switch (copyMenuId) {
                case 0:
                    const frame = OperationStore_Track.frame;
                    const objectId = OperationStore_Track.selectingObjectId;
                    AnnotationsStore_Track.copyObject({frame: frame, objectId: objectId});
                    OperationStore_Track.setSelectingObjectId(AnnotationsStore_Track.newestObjectId);
                    OperationStore_Track.setModeToBounding();
                    break;
                case 1:
                    OperationStore_Track.setModeToBone();
                    break;
            }
        }

        private onSelectClass(classNo: number) {
            const frame = OperationStore_Track.frame;
            const objectId = OperationStore_Track.selectingObjectId;
            AnnotationsStore_Track.setClass({frame: frame, objectId: objectId, class: classNo});
        }

        private onSelectMode(modeNo: number) {
            switch (modeNo) {
                case 0:
                    OperationStore_Track.setModeToBounding();
                    break;
                case 1:
                    OperationStore_Track.setModeToBone();
                    break;
            }
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

        .track_menu {
            .subtitle {
                margin-top: 24px;
            }
        }
    }

</style>
