<template>

    <Help :descriptions="[

        {
            title: 'アノテーションの追加方法',
            body: '「新しいデータを作る」ボタンを押す',
        },
        {
            title: 'バウンディングボックスの移動・変形',
            body: 'モード選択で「領域」を選択中にオブジェクトの矩形をドラッグ',
        },
        {
            title: 'ボーン変形',
            body: 'モード選択で「ボーン」を選択中にオブジェクトの矩形をドラッグ',
        },
        {
            title: 'アノテーションの削除（オブジェクトごと）',
            body: 'モード選択で「領域」を選択中に <span>Ctrlキー</span> + クリック',
        },
        {
            title: 'アノテーションの削除（関節だけ）',
            body: 'モード選択で「ボーン」を選択中に消したい関節を <span>Ctrlキー</span> + クリック',
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
    export default class Help_Track extends Vue {

    }
</script>

<style lang="scss" scoped>

</style>


