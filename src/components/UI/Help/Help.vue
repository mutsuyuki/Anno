<template>
  <div class="help description_area"
       v-show="isShow"
  >
    <h3>操作方法</h3>

    <img class="close"
         :src="require('@/assets/img/icons/close.svg')"
         @click="$emit('close')"
    />

    <ScrollableArea class="contents">
      <table>
        <tr v-for="description in descriptions">
          <th>{{ description.title }}</th>
          <td v-html="description.body"></td>
        </tr>
      </table>
    </ScrollableArea>
  </div>

</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
import ScrollableArea from "@/components/UI/Area/ScrollableArea.vue";
import {defaultHelpMessages} from "@/components/UI/Help/DefaultHelpMessages";

@Component({
  components: {ScrollableArea},
})
export default class Help extends Vue {
  @Prop({default: false}) isShow!: boolean;
  @Prop({default: defaultHelpMessages}) descriptions!: { title: string, body: string }[];
}
</script>

<style lang="scss">


.help.description_area {
  width: 80%;
  height: 80%;
  position: absolute;
  margin: auto;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid lightgray;
  border-radius: 8px;
  padding: 24px;

  $header_height: 48px;

  h3 {
    height: $header_height;
    font-size: 18px;
    color: #ddd;
    padding: 8px;
    text-align: center;
  }

  .close {
    position: absolute;
    right: 16px;
    top: 16px;
    cursor: pointer;
  }

  .contents {
    height: calc(100% - #{$header_height});

    table {
      width: 100%;

      th, td {
        font-size: 14px;
        color: #ddd;
        text-align: left;
        border-bottom: 1px solid #777;
        padding: 8px;

        span {
          background: #444;
          padding: 4px 8px;
          border-radius: 4px;
        }
      }
    }
  }
}

</style>


