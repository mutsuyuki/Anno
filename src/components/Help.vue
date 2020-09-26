<template>
    <div class="help description_area"
         v-show="isShow"
    >
        <h3>操作方法</h3>

        <img class="close"
             :src="require('@/assets/img/icons/close.svg')"
             @click="onClickClose"
        />

        <table>
            <tr v-for="description in descriptions">
                <th>{{description.title}}</th>
                <td v-html="description.body"></td>
            </tr>

            <!-- ToolBar.vue -->
            <tr>
                <th>アノテーションの不透度を0</th>
                <td><span>a キー</span></td>
            </tr>
            <tr>
                <th>アノテーションの不透度を1</th>
                <td><span>s キー</span></td>
            </tr>

            <!-- VideoPlayer.vue / ImagePlayer.vue -->
            <tr>
                <th>次のアノテーション済データを表示</th>
                <td><span>→ キー</span></td>
            </tr>
            <tr>
                <th>前のアノテーション済データを表示</th>
                <td><span>← キー</span></td>
            </tr>

            <!-- ImagePlayer.vue -->
            <tr>
                <th>画像拡大</th>
                <td>マウスホイール</td>
            </tr>
            <tr>
                <th>画像移動</th>
                <td><span>Space キー</span> + ドラッグ</td>
            </tr>

            <!-- DownloadButton.vue -->
            <tr>
                <th>教師データを保存</th>
                <td><span>d キー</span></td>
            </tr>

        </table>
    </div>

</template>

<script lang="ts">
    import {Component, Prop, Vue} from "vue-property-decorator";
    import HelpStore from "@/store/HelpStore";

    @Component({
        components: {},
    })
    export default class Help extends Vue {
        @Prop() descriptions!: { title: string, body: string }[];

        get isShow(): boolean {
            return HelpStore.isShow;
        }

        created() {
            document.addEventListener("keydown", (e: KeyboardEvent) => {
                if (e.key == "h") {
                    HelpStore.toggle();
                }
            });
        }

        private onClickClose(){
            HelpStore.hide();
        }
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

        h3 {
            font-size: 18px;
            color: #ddd;
            padding: 8px;
            text-align: center;
        }

        .close{
            position: absolute;
            right: 16px;
            top: 16px;
            cursor: pointer;
        }

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

</style>


