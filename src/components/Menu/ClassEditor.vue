<template>
  <div>
    <div class="list">
      <div class="class_list">
        <ButtonGrid
            :data="classList"
            :selectId="selectId"
            :cols="1"
            :showTooltip="true"
            @select="onSelect"
        />
      </div>
      <div class="button_list">
        <ButtonGrid
            :data="deleteList"
            :selectId="-1"
            :cols="1"
            :fontSize="9"
            @select="onDelete"
        />
      </div>
    </div>

    <div class="add_form">
      <input type="text" placeholder="class name"
             v-model="newClassName"
      >
      <button class="button"
              :class="{'disable' : newClassName === ''}"
              @click="onClickAdd"
      >
        追加
      </button>
    </div>
  </div>

</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator';
import ButtonGrid from "@/components/Menu/ButtonGrid.vue";

@Component({
  components: {ButtonGrid}
})
export default class ClassEditor extends Vue {
  @Prop({default: []}) private classes!: { id: string, text: string }[];
  @Prop({default: "0"}) private selectId!: string;

  private newClassName: string = "";

  get classList() {
    return this.classes.map(v => {
      return {id: v.id, text: v.id + " : " + v.text}
    })
  }

  get deleteList() {
    return this.classes.map(v => {
      return {id: v.id, text: "削除"}
    })
  }

  private onSelect(id: string) {
    this.$emit("select", id);
  }

  private onDelete(id: string) {
    const deleteTarget = this.classes.filter(v => v.id == id)[0];
    const isDeleteOK = confirm(deleteTarget.id + " : " + deleteTarget.text + "を削除して良いですか？");
    if (isDeleteOK)
      this.$emit("delete", id);
  }

  private onClickAdd() {
    this.$emit("add", this.newClassName);
  }

}
</script>

<style scoped lang="scss">

.list {
  display: flex;
}

.class_list {
  width: 100%;
  max-width: 130px;

  ::v-deep button {
    text-align: left;
  }
}

.button_list {
  margin-left: 4px;
  width: 48px;

  ::v-deep button {
    color: var(--darkgray);
  }
}

.class_list::v-deep, .button_list::v-deep {
  button {
    height: 34px;
  }
}

.add_form {
  width: 100%;
  display: flex;
  margin-top: 16px;

  input[type=text] {
    font-size: 11px;
    width: 100%;
    height: 32px;
  }

  button {
    margin-left: 4px;
    font-size: 9px;
    width: 48px;
    height: 32px;
  }
}


</style>
