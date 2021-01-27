<template>
  <div class="toolbar">

    <div class="history_changer">
      <div class="undo ui-unit"
           :class="{'is-disable':!enableUndo}"
           @click="onClickUndo"
      >
        <img :src="require('@/assets/img/icons/undo.svg')"/>
        <span> 取り消す</span>
      </div>

      <div class="redo ui-unit"
           :class="{'is-disable':!enableRedo}"
           @click="onClickRedo"
      >
        <img :src="require('@/assets/img/icons/redo.svg')"/>
        <span> やり直す</span>
      </div>
    </div>

    <div class="alpha_changer ui-unit">
      <span>教師データ透明度</span>
      <input type="range" min="0" max="1" step="0.000001"
             v-model="opacity"
      >
    </div>

  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator';
import ScalableArea from "@/components/UI/ScalableArea/ScalableArea.vue";
import InlineSvg from "@/common/utils/InlineSvg";
import NormalizedScalableArea from "@/components/UI/ScalableArea/NormalizedScalableArea.vue";
import CanvasSettingsStore from "@/components/UI_Singleton/ToolBar/CanvasSettingsStore";
import HistoryStore from "@/store/HistoryStore";

@Component({
  components: {NormalizedScalableArea, InlineSvg, ScalableArea}
})
export default class ToolBar extends Vue {

  private isControlDown: boolean = false;

  mounted() {
    document.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key == "a") this.opacity = 0;
      if (e.key == "s") this.opacity = 1;

      if (e.key == "Control") this.isControlDown = true;
      if (e.key == "z" && this.isControlDown) HistoryStore.undo();
      if (e.key == "Z" && this.isControlDown) HistoryStore.redo();
    });
    document.addEventListener("keyup", (e: KeyboardEvent) => {
      if (e.key == "Control") this.isControlDown = false;
    });
  }

  private onClickUndo() {
    HistoryStore.undo();
  }

  private onClickRedo() {
    HistoryStore.redo();
  }

  get enableUndo() {
    return HistoryStore.enableUndo;
  }

  get enableRedo() {
    return HistoryStore.enableRedo;
  }

  get opacity() {
    return CanvasSettingsStore.opacity;
  }

  set opacity(opacity: number) {
    CanvasSettingsStore.setOpacity(opacity);
  }

}
</script>

<style scoped lang="scss">

.toolbar {
  height: 40px;
  min-width: 450px;
  display: flex;
  justify-content: space-evenly;
  align-items: center;

  * {
    user-select: none;
  }
}

.ui-unit {
  display: flex;
  align-items: center;

  svg {
    width: 16px;
    height: 16px;
  }

  span {
    font-size: 12px;
    margin-left: 8px;
  }

  input {
    cursor: pointer;
  }

  cursor: pointer;
  opacity: 0.85;

  &:hover {
    opacity: 1;
  }


  &.is-disable {
    opacity: 0.4;
    cursor: default;

    &:hover {
      opacity: 0.4;
    }
  }
}

.history_changer {
  display: flex;
  align-items: center;

  div:nth-child(2) {
    margin-left: 24px;
  }
}

.alpha_changer {
  display: flex;
  align-items: center;

  :nth-child(n+2) {
    margin-left: 8px;
  }

  .buttons {

    display: flex;
    align-items: center;

    .button {
      height: 32px;
      display: flex;
      align-items: center;
      margin-left: 0;
    }
  }
}

</style>