import {defaultHelpMessages} from "@/components/UI/Help/DefaultHelpMessages";

export default class HelpMessage {
  public static descriptions = [
    {
      title: '毛穴+毛の方向指定',
      body: 'ドラッグ（始点が毛穴の位置、終点が毛の流れの位置）',
    },

    {
      title: 'アノテーションの削除',
      body: '<span>Ctrlキー</span> + クリック',
    },

    {
      title: '画像拡大',
      body: '<span>マウスホイール</span>をころころ',
    },

    {
      title: '画像移動',
      body: '<span>Spaceキー</span>+ドラッグ',
    },

    {
      title: '(備考)フォーマット',
      body: '始点x, 始点y, 終点x, 終点y, 毛の幅(横幅を1とした割合)',
    },

    {
      title: '(備考)画像が大きすぎる',
      body: '画像が大きすぎて下にはみ出るときは、ウィンドウ幅を小さくしてみて下さい',
    },

  ].concat(defaultHelpMessages)
}

