<template>
    <img :src="imagePath" alt="">
</template>

<script lang="ts">
    import {Component, Prop, Vue} from 'vue-property-decorator';

    @Component
    export default class ImageSizeChecker extends Vue {

        @Prop() private imagePath!: string;
        @Prop() private heightPadding!: number;

        mounted() {
            const parentElement = this.$el.parentElement as HTMLElement;
            const innerElement = this.$el as HTMLElement;

            let prevWidth = 0;
            setInterval(() => {
                innerElement.style.maxHeight = (parentElement.clientHeight - this.heightPadding) + "px";
                innerElement.style.maxWidth = parentElement.clientWidth + "px";

                if (prevWidth != innerElement.clientWidth) {
                    this.$emit("sizeChange", innerElement.clientWidth);
                    prevWidth = innerElement.clientWidth;
                }
            }, 50);
        }
    }
</script>

<style scoped lang="scss">
    img {
        position: absolute;
        top: 0;
        left: 0;
        visibility: hidden;
    }
</style>
