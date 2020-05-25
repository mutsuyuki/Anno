<template>
    <div class="annotation-status-bar">
        <div class="file-name"> {{fileName}}</div>
        <div class="statuses">
            <div class="status" :class="{'active':isSetByFile}">教師データ読込</div>
            <div class="status" :class="{'active':isDownloaded}">ダウンロード済</div>
        </div>
    </div>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from "vue-property-decorator";

    @Component({
        components: {},
    })
    export default class AnnotationStatusBar extends Vue {
        @Prop() fileName!: string;
        @Prop() isSetByFile!: boolean;
        @Prop() isDownloaded!: boolean;
    }
</script>

<style scoped lang="scss">
    .annotation-status-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 24px;

        .file-name{
            color: var(--gray);
            font-size: 12px;

        }

        .statuses{
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100%;
        }
        .status {
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 11px;
            width: 104px;
            height: 100%;

            color: var(--gray);
            opacity: 0.1;
            margin-left: 8px;

            &.active {
                background-color: forestgreen;
                color: white;
                opacity: 1;
            }
        }
    }


</style>


