<template>
    <div>
        <button class="button"
                @click.prevent="">
            <span>新しいデータ</span>
        </button>

        <button class="button"
                @click.prevent="">
            <span>前のフレームをコピー</span>
        </button>

        <button class="button"
                @click.prevent="">
            <span>選択中データをコピー</span>
        </button>
    </div>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from "vue-property-decorator";

    @Component({ })
    export default class MakeTargetButtons_Track extends Vue {

    }
</script>

<style lang="scss" scoped>
    @import "../../assets/scss/parts/button";
    @import "../../assets/scss/parts/input_text";

    button {
        width: 100%;
        color: var(--white);
        font-size: 12px;

        &:nth-child(n+2){
            margin-top: 8px;
        }
    }

</style>


