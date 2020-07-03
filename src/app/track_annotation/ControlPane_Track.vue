<template>
    <div class="control_pane">

        <div class="header">
            <div class="icon">
                <img :src="require('@/assets/img/icons/home.svg')"/>
            </div>
            <h1>Tracking</h1>
        </div>

        <div class="container">
            <div class="container_above">
                <FileSelector
                        :iconPath="require('@/assets/img/icons/video.svg')"
                        :message="'動画を選択'"
                        :accept="'video/*'"
                        :isMultiple="false"
                        @change="onSelectVideoFile"
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

        <div class="footer">
            <div class="icon"
                 @click="onClickHelp"
            >
                <img :src="require('@/assets/img/icons/help.svg')"/>
            </div>
            <div class="copy">Enjoy Annotation!</div>
        </div>
    </div>

</template>

<script lang="ts">
    import {Component, Prop, Vue} from 'vue-property-decorator';
    import ImageFilesStore from "@/store/ImageFilesStore";
    import AnnotationFilesStore from "@/store/AnnotationFilesStore";
    import FileSelector from "@/components/FileSelector.vue";
    import HelpStore from "@/store/HelpStore";
    import VideoFileStore from "@/store/VideoFileStore";

    @Component({
        components: {
            FileSelector
        }
    })
    export default class ControlPane_Track extends Vue {

        get isImageSelected() {
            return ImageFilesStore.numberOfItems > 0;
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

    .header, .footer {
        display: flex;
        justify-content: left;
        align-items: center;
        background: var(--background-dark);
        height: 40px;

        .icon {
            padding: 12px;
            background: var(--background-light);
            cursor: pointer;

            img {
                width: 16px;
                height: 16px;
            }
        }

        h1 {
            margin-left: 12px;
            font-size: 16px;
        }

        .copy{
            height: 40px;
            line-height: 40px;
            font-size: 12px;
            width: 100%;
            margin-left: 12px;
        }
    }


    .container {
        padding: 16px;
        height: calc(100vh - 40px - 40px); // 100vh - header - copyright

        .container_above{
            *:nth-child(n + 2) {
                margin-top: 8px;
            }
        }


    }


</style>
