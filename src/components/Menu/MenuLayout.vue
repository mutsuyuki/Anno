<template>
  <div>
    <div class="header-container">
      <MenuHeader :text="headerText"/>
    </div>

    <ScrollableArea class="control-container">
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
import ScrollableArea from "@/components/UI/ScrollableArea.vue";

@Component({
  components: {
    ScrollableArea,
    MenuFooter,
    MenuHeader,
  }
})
export default class MenuLayout extends Vue {
  @Prop({default:"Annotation Tool"}) private headerText!:string;
  @Prop({default:"Enjoy Annotation!"}) private footerText!:string;

}
</script>

<style scoped lang="scss">
.header-container{
  height: 40px;
}

.control-container {
  padding: 16px;
  height: calc(100vh - 40px - 40px); // 100vh - header - footer
}

.footer-container{
  height: 40px;
}

</style>
