<template>
    <div>

        <div class="main_container">
            <MenuPane_Track class="menu_pane"/>
            <div class="canvas_pane_container">
                <CanvasPane_Track class="canvas_pane"/>

                <!--画像サイズの計算コンポーネント todo cssだけで実現できるならこの仕組みはやめたい-->
                <VideoSizeChecker
                        @sizeChange="fitWidth"
                        :url="sizeCheckVideoUrl"
                        :heightPadding="40 + 40 + 80 + 40"
                />
            </div>
        </div>

        <Help_Track/>
    </div>
</template>

<script lang="ts">
    import {Component, Vue} from "vue-property-decorator";
    import MenuPane_Track from "@/app/track_annotation/MenuPane_Track.vue";
    import CanvasPane_Track from "@/app/track_annotation/CanvasPane_Track.vue";
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
            CanvasPane_Track,
            VideoSizeChecker,
            ImageSizeChecker,
            MenuPane_Track,
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
            const canvasPaneElement = this.$el.getElementsByClassName("canvas_pane")[0] as HTMLElement;
            canvasPaneElement.style.width = width + "px";
        }
    }
</script>

<style lang="scss" scoped>

    .main_container {
        display: flex;
        height: 100vh;
        width: 100%;

        .menu_pane {
            width: 200px;
            min-width: 200px;
            height: 100%;
            overflow-y: scroll;
        }

        .canvas_pane_container {
            margin: 0 auto;
            width: calc(100% - 200px);
            height: 100%;
            overflow-y: scroll;
            background-color: var(--background-canvas);

            .canvas_pane {
                height: 100%;
                min-width: 500px;
                margin: 0 auto;
                padding: 0 16px;
            }
        }
    }

</style>


