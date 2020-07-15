<template>

    <Help :descriptions="[
        {
            title: 'アノテーションの追加方法',
            body: '「新しいデータを作る」ボタンを押す',
        },
        {
            title: 'バウンディングボックスの移動・変形',
            body: '矩形の中心をドラッグで移動、端をドラッグで変形',
        },
        {
            title: 'アノテーションの削除（オブジェクトごと）',
            body: '<span>Ctrlキー</span> + クリック',
        },
        {
            title: '画像拡大',
            body: '<span>マウスホイール</span>をころころ',
        },
        {
            title: '画像移動',
            body: '<span>Spaceキー</span>+ドラッグ',
        }

    ]"/>

</template>

<script lang="ts">
    import {Component, Prop, Vue} from "vue-property-decorator";
    import Help from "@/components/Help.vue";

    @Component({
        components: {Help},
    })
    export default class Help_ObjectDetection extends Vue {

    }
</script>

<style lang="scss" scoped>

</style>


