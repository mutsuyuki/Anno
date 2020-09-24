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
            title: 'データの新規作成',
            body: '<span>n キー</span>',
        },
        {
            title: 'クラスの設定',
            body: '<span>0,1 キー</span>',
        },
        {
            title: '次のデータに移動',
            body: '<span>→ キー</span>',
        },
        {
            title: '前のデータに移動',
            body: '<span>← キー</span>',
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


