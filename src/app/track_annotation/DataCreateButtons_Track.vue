<template>
    <div>
        <button class="button"
                @click.prevent="makeNewData">
            <span>新しいデータを作る</span>
        </button>

        <button class="button"
                @click.prevent="copyFromSelect">
            <span>選択中データをコピー</span>
        </button>

        <button class="button"
                @click.prevent="copyFromPrevFrame">
            <span>前のフレームをコピー</span>
        </button>
    </div>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from "vue-property-decorator";
    import MenuStore_Track from "@/app/track_annotation/MenuStore_Track";

    @Component({})
    export default class MakeTargetButtons_Track extends Vue {

        private makeNewData() {
            MenuStore_Track.toggleMakeNewDataCue();
        }

        private copyFromSelect() {
            MenuStore_Track.toggleCopyFromSelectCue();
        }

        private copyFromPrevFrame() {
            MenuStore_Track.toggleCopyFromPrevFrameCue();
        }
    }
</script>

<style lang="scss" scoped>
    @import "../../assets/scss/parts/button";
    @import "../../assets/scss/parts/input_text";

    button {
        width: 100%;
        color: var(--white);
        font-size: 12px;

        &:nth-child(n+2) {
            margin-top: 8px;
        }
    }

</style>


