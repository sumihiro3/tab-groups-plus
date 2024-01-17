/**
 * デフォルトのオプション
 */
export const DEFAULT_EXTENSION_OPTIONS: ExtensionOptions = {
  reloadOnHighlight: false,
  overwriteTabGroup: false,
  openInNewWindow: false,
};

/**
 * 拡張機能のオプションの型定義
 */
export interface ExtensionOptions {
  /** タブグループを選択した際に、そのタブグループのタブをリロードするかどうか */
  reloadOnHighlight: boolean;

  /**
   * 同名のタブグループが保存されている場合に、タブグループを上書きするかどうか
   * - true: 上書きする
   * - false: 上書きせずにマージする
   */
  overwriteTabGroup: boolean;

  /**
   * タブグループを復元する際に、新しいウィンドウで開くかどうか
   */
  openInNewWindow: boolean;
}
