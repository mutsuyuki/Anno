import {defaultHelpMessages} from "@/components/UI/Help/DefaultHelpMessages";

export default class HelpMessage {
  public static descriptions = [
    {
      title: 'アノテーションの追加方法',
      body: '<span>c キー</span> or「新しいデータを作る」ボタンを押す',
    },

    {
      title: 'バウンディングボックスの移動・変形',
      body: '中心をドラッグで移動、端をドラッグで変形',
    },

    {
      title: 'アノテーションの削除（オブジェクトごと）',
      body: '<span>ctrl キー</span> + クリック',
    },

    {
      title: 'クラスの設定',
      body: '<span>0,1 キー</span>',
    },
  ].concat(defaultHelpMessages)
}

