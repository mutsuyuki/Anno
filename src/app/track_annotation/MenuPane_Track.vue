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
                <DataCreateButtons_Track
                        v-show="isVideoSelected"
                />

                <MenuSubTitle :text="'クラス設定'" class="subtitle"/>
                <ButtonGrid
                        :data="[{id:0,text:'食'},{id:1,text:'歩'},{id:2,text:'立'},{id:3,text:'休'},{id:4,text:'飲'}]"
                        :selectId="1"
                        :cols="5"
                        :font-size="11"
                        :max-height="100"
                />

                <MenuSubTitle :text="'モード選択'" class="subtitle"/>
                <ButtonGrid
                        :data="[{id:0,text:'領域'}, {id:1,text:'ボーン'}]"
                        :selectId="0"
                        :cols="2"
                        :max-height="100"
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
    import DataCreateButtons_Track from "@/app/track_annotation/DataCreateButtons_Track.vue";
    import MenuSubTitle from "@/components/Menu/MenuSubTitle.vue";
    import ButtonGrid from "@/components/Menu/ButtonGrid.vue";

    @Component({
        components: {
            ButtonGrid,
            MenuSubTitle,
            DataCreateButtons_Track,
            MenuFooter,
            MenuHeader,
            FileSelector
        }
    })
    export default class MenuPane_Track extends Vue {

        get isVideoSelected() {
            return VideoFileStore.isSelected;
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
