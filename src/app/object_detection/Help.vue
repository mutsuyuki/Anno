<template>

  <HelpBase :descriptions="[
        {
            title: 'アノテーションの追加方法',
            body: '<span>c キー</span> or「新しいデータを作る」ボタンを押す',
        },

        {
            title: 'バウンディングボックスの移動・変形',
            body: '中心をドラッグで移動、端をドラッグで変形',
        },

        {
            title: 'アノテーションの削除（オブジェクトごと）',
            body: '<span>ctrl キー</span> + クリック',
        },

        {
            title: 'クラスの設定',
            body: '<span>0,1 キー</span>',
        },

    ]"/>

</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
import HelpBase from "@/components/UI_Singleton/Help/HelpBase.vue";

@Component({
  components: {HelpBase},
})
export default class Help extends Vue {

}
</script>

<style lang="scss" scoped>

</style>


