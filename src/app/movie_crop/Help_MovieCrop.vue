<template>

  <Help :descriptions="[
        {
            title: '直近の矩形領域のコピー',
            body: '<span>c キー</span> or「直近フレームから複製」ボタンを押す',
        },

        {
            title: 'バウンディングボックスの移動・変形',
            body: '中心をドラッグで移動、端をドラッグで変形',
        },


    ]"/>

</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
import Help from "@/components/UI_Singleton/Help/Help.vue";

@Component({
  components: {Help},
})
export default class Help_MovieCrop extends Vue {

}
</script>

<style lang="scss" scoped>

</style>


