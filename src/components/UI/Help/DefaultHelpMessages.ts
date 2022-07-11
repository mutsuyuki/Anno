
export const defaultHelpMessages: { title: string, body: string }[] = [

  // ToolBar.vue
  {
    title: 'アノテーションの不透度を0',
    body: '<span>a キー</span>',
  },
  {
    title: 'アノテーションの不透度を1',
    body: '<span>s キー</span>',
  },
  {
    title: '操作を取り消す（Undo）',
    body: '<span>ctrl キー</span> + <span>z キー</span>',
  },
  {
    title: '取り消した操作をやり直す（Redo）',
    body: '<span>ctrl キー</span> + <span>shift キー</span> + <span>z キー</span>',
  },

  // ToolBar.vue
  {
    title: '次のアノテーション済データを表示',
    body: '<span>shift キー</span> + <span>→ キー</span>',
  },
  {
    title: '前のアノテーション済データを表示',
    body: '<span>shift キー</span> + <span>← キー</span>',
  },
  {
    title: '次のフレームへ',
    body: '<span>→ キー</span>',
  },
  {
    title: '前のフレームへ',
    body: '<span>← キー</span>',
  },

  // Area.vue
  {
    title: '画像拡大',
    body: 'マウスホイール',
  },
  {
    title: '画像拡大をやめる',
    body: '<span>r キー</span>',
  },
  {
    title: '画像移動',
    body: '<span>右ドラッグ</span>',
  },

  // DownloadButton.vue
  {
    title: '教師データを保存',
    body: '<span>d キー</span>',
  },
]
