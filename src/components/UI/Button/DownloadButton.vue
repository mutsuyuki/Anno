<template>
  <div class="download_panel ">
    <button class="button"
            @click.prevent="$emit('download')">
      <img :src="require('@/assets/img/icons/download.svg')"/>
      <span> 教師データを保存</span>
    </button>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator';
import ShortcutRegister from "@/common/utils/ShortcutRegister";

@Component({})
export default class DownloadButton extends Vue {
  private shortcut: ShortcutRegister = new ShortcutRegister();

  created() {
    this.shortcut.register([
      {key: "d", callback: () => this.$emit('download')},
    ]);
  }

  destroyed(){
    this.shortcut.unregister();
  }
}
</script>

<style scoped lang="scss">

.download_panel {
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;

  button {
    width: 50%;
    min-width: 50%;

    span {
      margin-left: 8px;
      color: var(--gray);
    }
  }
}

</style>
