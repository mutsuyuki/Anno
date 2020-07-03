<template>
    <div class="control_pane">

        <MenuHeader
                :title="'Hair direction'"
        />

        <div class="container">
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


            <MakeTargetButtons_Track
                    v-show="isVideoSelected"
            />
        </div>

        <MenuFooter
                :message="'Enjoy Annotation!'"
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
    import MakeTargetButtons_Track from "@/app/track_annotation/MakeTargetButtons_Track.vue";

    @Component({
        components: {
            MakeTargetButtons_Track,
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

        private onClickHelp():void{
            HelpStore.toggle();
        }
    }
</script>

<style scoped lang="scss">

    .container {
        padding: 16px;
        height: calc(100vh - 40px - 40px); // 100vh - header - footer

        .file_selectors{
            *:nth-child(n + 2) {
                margin-top: 8px;
            }
        }
    }

</style>
