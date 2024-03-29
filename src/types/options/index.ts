/**
 * デフォルトのオプション
 */
export const DEFAULT_EXTENSION_OPTIONS: ExtensionOptions = {
  removeSavedTabGroupWhenRestore: false,
  reloadOnHighlight: false,
  overwriteTabGroup: false,
  openInNewWindow: false,
  showUnGroupedTabs: true,
  searchIncludeTabUrl: false,
};

/**
 * 拡張機能のオプションの型定義
 */
export interface ExtensionOptions {
  /**
   * タブグループを復元した時に、保存されている内容を削除するかどうか
   * - true: 削除する
   * - false: 削除しない
   */
  removeSavedTabGroupWhenRestore: boolean;

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

  /**
   * タブグループに属していないタブを一覧に表示するかどうか
   * - true: 表示する
   * - false: 表示しない
   */
  showUnGroupedTabs: boolean;

  /**
   * タブグループの検索時に、タブの URL も検索対象に含めるかどうか
   * - true: URL も検索対象に含める
   * - false: URL は検索対象に含めない
   */
  searchIncludeTabUrl: boolean;
}
