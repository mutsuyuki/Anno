<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator';

@Component({
  components: {},
})
export default class App extends Vue {
}
</script>

<style lang="scss" src="./assets/scss/style.scss"></style>
