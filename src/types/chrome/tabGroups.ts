import { BrowserTab } from '.';

type ColorEnum = chrome.tabGroups.ColorEnum;
type TabGroup = chrome.tabGroups.TabGroup;

/**
 * 保存されているタブグループを表すメタデータオブジェクト
 */
export interface BrowserTabGroupMetadata {
  /**
   * 保存されているタブグループのタイトルの配列
   */
  titleList: string[];
}

/**
 * タブグループを表すクラス
 * @see https://developer.chrome.com/docs/extensions/reference/tabGroups/#type-Tab
 */
export class BrowserTabGroup {
  /**
   * グループの ID。グループ ID はブラウザ セッション内で一意です。
   */
  id: number;

  /**
   * グループのタイトル。
   */
  title?: string;

  /**
   * グループの色。
   */
  color: ColorEnum;

  /**
   * グループが閉じているかどうか。折りたたまれたグループは、タブが非表示になっているグループです。
   */
  collapsed: boolean;

  /**
   * グループを含むウィンドウの ID。
   */
  windowId: number;

  /**
   * グループに含まれるタブの配列
   */
  tabs?: BrowserTab[];

  /**
   * コンストラクター
   * @param tabGroup タブグループ
   */
  constructor(tabGroup: TabGroup) {
    this.id = tabGroup.id;
    this.title = tabGroup.title;
    this.color = tabGroup.color;
    this.collapsed = tabGroup.collapsed;
    this.windowId = tabGroup.windowId;
  }

  /**
   * タブグループに属するタブを設定する
   * @param tabs タブグループに属するタブ
   */
  setTabs(tabs: BrowserTab[]) {
    this.tabs = tabs;
  }
}
