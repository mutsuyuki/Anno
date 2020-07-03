<template>
    <div>

        <div class="main_container">
            <ControlPane_Track class="control_pane"/>
            <div class="annotation_pane_container">
                <AnnotationPane_Track class="annotation_pane"/>

                <!--画像サイズの計算コンポーネント todo cssだけで実現できるならこの仕組みはやめたい-->
                <VideoSizeChecker
                        @sizeChange="fitWidth"
                        :url="sizeCheckVideoUrl"
                        :heightPadding="40 + 40 + 40 + 40 + 8"
                />
            </div>
        </div>

        <Help_Track/>
    </div>
</template>

<script lang="ts">
    import {Component, Vue} from "vue-property-decorator";
    import ControlPane_Track from "@/app/track_annotation/ControlPane_Track.vue";
    import AnnotationPane_Track from "@/app/track_annotation/AnnotationPane_Track.vue";
    import Help_Track from "@/app/track_annotation/Help_Track.vue";
    import ImageSizeChecker from "@/components/SizeChecker/ImageSizeChecker.vue";
    import ImageFilesStore from "@/store/ImageFilesStore";
    import AnnotationHistoryStore from "@/store/AnnotationHistoryStore";
    import AnnotationFilesStore from "@/store/AnnotationFilesStore";
    import HelpStore from "@/store/HelpStore";
    import VideoFileStore from "@/store/VideoFileStore";
    import VideoSizeChecker from "@/components/SizeChecker/VideoSizeChecker.vue";

    @Component({
        components: {
            VideoSizeChecker,
            ImageSizeChecker,
            AnnotationPane_Track,
            ControlPane_Track,
            Help_Track,
        },
    })
    export default class Home_Track extends Vue {

        destroyed() {
            ImageFilesStore.clear();
            AnnotationFilesStore.clear();
            AnnotationHistoryStore.clear();
            HelpStore.hide();
        }

        get sizeCheckVideoUrl() {
            return VideoFileStore.url;
        }

        private fitWidth(width: number) {
            const annotationPaneElement = this.$el.getElementsByClassName("annotation_pane")[0] as HTMLElement;
            annotationPaneElement.style.width = width + "px";
        }
    }
</script>

<style lang="scss" scoped>

    .main_container {
        display: flex;
        height: calc(100vh);
        width: 100%;

        .control_pane {
            width: 200px;
            min-width: 200px;
            height: 100%;
            overflow-y: scroll;
        }

        .annotation_pane_container {
            margin: 0 auto;
            width: calc(100% - 200px);
            height: 100%;
            overflow-y: scroll;
            background-color: var(--background-canvas);

            .annotation_pane {
                min-width: 500px;
                margin: 0 auto;
            }
        }
    }

</style>


