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
                        :data="[{id:0,text:'新しいデータを作る'},{id:1,text:'選択中データをコピー'},{id:2,text:'前のフレームをコピー'}]"
                        :selectId="-1"
                        :cols="1"
                />

                <MenuSubTitle :text="'クラス設定'" class="subtitle"/>
                <ButtonGrid
                        :data="[{id:0,text:'食'},{id:1,text:'歩'},{id:2,text:'立'},{id:3,text:'休'},{id:4,text:'飲'}]"
                        :selectId="selectedClass"
                        :cols="5"
                        :font-size="11"
                />

                <MenuSubTitle :text="'モード選択'" class="subtitle"/>
                <ButtonGrid
                        :data="[{id:0,text:'領域'}, {id:1,text:'ボーン'}]"
                        :selectId="selectedMode"
                        :cols="2"
                />

                <MenuSubTitle :text="'データビュー'" class="subtitle"/>

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
            return 1;
        }

        get selectedMode() {
            return 0;
        }

        private onSelectVideoFile(files: File[]) {
            VideoFileStore.setFile(files[0]);
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
