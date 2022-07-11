import {defaultHelpMessages} from "@/components/UI/Help/DefaultHelpMessages";

export default class HelpMessage {
  public static descriptions = [
    {
      title: 'アノテーションの追加方法',
      body: '「新しいデータを作る」ボタンを押す',
    },

    {
      title: 'バウンディングボックスの移動・変形',
      body: 'モード選択で「領域」を選択中にオブジェクトの矩形をドラッグ',
    },

    {
      title: 'ボーン変形',
      body: 'モード選択で「ボーン」を選択中にオブジェクトの矩形をドラッグ',
    },

    {
      title: 'アノテーションの削除（オブジェクトごと）',
      body: 'モード選択で「領域」を選択中に <span>ctrl キー</span> + クリック',
    },

    {
      title: 'アノテーションの削除（関節だけ）',
      body: 'モード選択で「ボーン」を選択中に消したい関節を <span>ctrl キー</span> + クリック',
    },
  ].concat(defaultHelpMessages)
}

