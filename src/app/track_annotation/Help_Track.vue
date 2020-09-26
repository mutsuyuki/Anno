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
            body: 'モード選択で「領域」を選択中に <span>ctrl キー</span> + クリック',
        },
        {
            title: 'アノテーションの削除（関節だけ）',
            body: 'モード選択で「ボーン」を選択中に消したい関節を <span>ctrl キー</span> + クリック',
        },

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


