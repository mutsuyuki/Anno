<template>
    <div class="multi_label_container">
        <div
                v-for="label in labels"
                class="label"
                :class="{'active': label.isActive}"
                :style="{'left':label.position.x +'%','top':label.position.y + '%'}"
        >
            {{label.text}}
        </div>
    </div>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from 'vue-property-decorator';
    import {Point} from "@/common/interface/Point";

    @Component({
        components: {}
    })
    export default class MultiLabels extends Vue {
        @Prop() private labels!: { text: string, position: Point, isActive: boolean }[];
    }
</script>

<style scoped lang="scss">

    .multi_label_container {
        position: absolute;
        top:0;
        left:0;
        padding: 0;
        margin: 0;
        width: 100%;
        height: 100%;

        .label {
            position: absolute;
            z-index: 100;
            height: 24px;
            line-height: 24px;
            font-size: 12px;
            font-weight: bold;
            color: var(--white);
            text-align: center;
            padding: 0 8px;
            pointer-events: none;
            transform: translateY(calc(-100%));
            overflow: hidden;
            text-shadow:1px 1px 0 #000,-1px 1px 0 #000,1px -1px 0 #000,-1px -1px 0 #000;

            opacity: 0.1;
            &.active {
                opacity: 0.6;
            }
        }
    }


</style>
