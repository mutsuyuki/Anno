<template>
  <div>
    <div class="header-container">
      <MenuHeader :text="headerText"/>
    </div>

    <ScrollableArea class="menu-container">
      <slot></slot>
    </ScrollableArea>

    <div class="footer-container">
      <MenuFooter
          :text="footerText"
          @help="$emit('help',$event)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator';
import MenuHeader from "@/components/Menu/MenuHeader.vue";
import MenuFooter from "@/components/Menu/MenuFooter.vue";
import ScrollableArea from "@/components/UI/Area/ScrollableArea.vue";

@Component({
  components: {
    ScrollableArea,
    MenuFooter,
    MenuHeader,
  }
})
export default class MenuLayout extends Vue {
  @Prop({default: ""}) private headerText!: string;
  @Prop({default: ""}) private footerText!: string;

}
</script>

<style scoped lang="scss">
.header-container {
  height: 40px;
}

.menu-container {
  padding: 16px;
  height: calc(100vh - 40px - 40px); // 100vh - header - footer

  &::v-deep {
    .submenu+.submenu{
      margin-top: 24px;
    }
  }
}

.footer-container {
  height: 40px;
}

</style>
