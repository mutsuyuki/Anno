<template>

  <div class="submenu">
    <MenuSubTitle class="submenu_title"
                  v-show="menuTitle"
                  :text="menuTitle"
    />
    <slot></slot>
  </div>

</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator';
import MenuSubTitle from "@/components/Menu/MenuSubTitle.vue";

@Component({
  components: {MenuSubTitle}
})
export default class SubMenu extends Vue {
  @Prop({default: ""}) private menuTitle!: string;
}
</script>

<style scoped lang="scss">
.submenu {
  &_title {
    margin-bottom: 4px;
  }
}
</style>
