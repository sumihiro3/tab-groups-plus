import { BrowserTab, BrowserTabDto } from '.';
import { compress, decompress } from '../../composables/compress';

type ColorEnum = chrome.tabGroups.ColorEnum;
type TabGroup = chrome.tabGroups.TabGroup;

/**
 * メタデータ内でタブグループを表すオブジェクト
 */
export interface BrowserTabGroupMetadataRecord {
  /**
   * タブグループのタイトル
   */
  title: string;

  /**
   * タブグループの保存に利用されているストレージ項目数
   */
  count: number;
}

/**
 * 保存されているタブグループを表すメタデータオブジェクト
 */
export class BrowserTabGroupMetadata {
  constructor() {
    this.groups = new Map<string, BrowserTabGroupMetadataRecord>();
  }

  /**
   * タブグループのメタデータレコードのMap
   */
  groups: Map<string, BrowserTabGroupMetadataRecord>;

  /**
   * メタデータに含まれるすべてのタブグループレコードを取得する
   */
  getRecords(): BrowserTabGroupMetadataRecord[] {
    return Array.from(this.groups.values());
  }

  /**
   * 指定のタブグループ名の BrowserTabGroupMetadataRecord を取得する
   * @param tabGroupName タブグループ名
   * @returns タブグループのメタデータレコード
   */
  getRecord(tabGroupName: string): BrowserTabGroupMetadataRecord | null {
    return this.groups.get(tabGroupName) ?? null;
  }

  /**
   * 指定のタブグループ名の BrowserTabGroupMetadataRecord を追加または更新する
   */
  upsertRecord(tabGroupName: string, count: number) {
    const record = this.getRecord(tabGroupName);
    if (!record) {
      // レコードが存在しない場合は追加する
      this.groups.set(tabGroupName, {
        title: tabGroupName,
        count: count,
      });
    } else {
      // レコードが存在する場合は更新する
      record.count = count;
    }
  }

  /**
   * 指定のタブグループ名の BrowserTabGroupMetadataRecord を削除する
   */
  removeRecord(tabGroupName: string) {
    this.groups.delete(tabGroupName);
  }

  /**
   * メタデータオブジェクトからインスタンスを生成する
   * @param records タブグループのメタデータレコードの配列
   * @returns タブグループのメタデータオブジェクト
   */
  static fromRecords(
    records: BrowserTabGroupMetadataRecord[],
  ): BrowserTabGroupMetadata {
    const metadata = new BrowserTabGroupMetadata();
    for (const record of records) {
      metadata.groups.set(record.title, record);
    }
    return metadata;
  }
}

/**
 * タブグループに属していないタブをまとめる用途で利用されるタブグループグループのID
 */
const TAB_GROUP_ID_NONE = -1;

/**
 * 保存されたタブグループを表すタブグループのID
 */
const SAVED_TAB_GROUP_ID = 0;

/**
 * ブラウザーでは開かれていないタブグループの windowId
 */
const WINDOW_ID_NONE = -1;

/**
 * タブグループを表すクラス
 * @see https://developer.chrome.com/docs/extensions/reference/tabGroups/#type-Tab
 */
export class BrowserTabGroup {
  /**
   * グループの ID。グループ ID はブラウザ セッション内で一意です。
   */
  readonly id: number;

  /**
   * グループのタイトル。
   */
  readonly title?: string;

  /**
   * グループの色。
   */
  readonly color: ColorEnum;

  /**
   * グループが閉じているかどうか。折りたたまれたグループは、タブが非表示になっているグループです。
   */
  readonly collapsed: boolean;

  /**
   * グループを含むウィンドウの ID。
   */
  readonly windowId: number;

  /**
   * グループに含まれるタブの配列
   */
  tabs?: BrowserTab[];

  /**
   * タブグループリストでの表示位置（リスト中のインデックス）
   */
  displayIndex?: number;

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

  /**
   * リストの表示位置を設定する
   */
  setDisplayIndex(index: number) {
    if (index < 0) {
      throw new Error('displayIndex は 0 以上である必要があります');
    }
    this.displayIndex = index;
  }

  /**
   * DTO からインスタンスを生成する
   */
  static fromDto(tabGroupDto: BrowserTabGroupDto): BrowserTabGroup {
    const tabGroup = new BrowserTabGroup({
      id: SAVED_TAB_GROUP_ID,
      collapsed: false,
      color: tabGroupDto.color,
      title: tabGroupDto.title,
      windowId: WINDOW_ID_NONE,
    });
    tabGroup.tabs = tabGroupDto.tabs.map((tab) => BrowserTab.fromDto(tab));
    return tabGroup;
  }

  /**
   * タブグループに属するタブのタイトルに指定の文字列が含まれているかどうかを判定する
   * 指定の文字列が含まれているタブを持ったタブグループを返す
   * 含まれていない場合は、null を返す
   * @param query 検索文字列
   * @returns 指定の文字列がタイトルに含まれているタブを持ったタブグループオブジェクト
   */
  contains(query: string): BrowserTabGroup | null {
    console.debug(`[${this.title}] contains called! [query: ${query}]`);
    if (!this.tabs) {
      return null;
    }
    const q = query.toLowerCase();
    // タブグループのタイトルに指定の文字列が含まれているかどうか
    // タブグループに属していないタブグループの場合は常に含まれていないと判定する
    const containsInTabGroupTitle =
      this.id === TAB_GROUP_ID_NONE ? -1 : this.title?.toLowerCase().indexOf(q);
    console.debug(
      `[${this.title}] containsInTabGroupTitle: ${containsInTabGroupTitle}`,
    );
    // タブグループに属するタブのうち、指定の文字列が含まれているタブを取得する
    const filteredTabs = this.tabs!.filter((tab) => {
      return tab.title?.toLowerCase().indexOf(q) !== -1;
    });
    if (filteredTabs.length === 0 && containsInTabGroupTitle === -1) {
      // タブグループタイトル、タブタイトルの両方に指定の文字列が含まれていない場合は null を返す
      return null;
    } else if (filteredTabs.length > 0) {
      // タブが検索結果に含まれている場合は、表示位置を更新する
      // filteredTabs.forEach((tab, index) => {
      //   tab.setDisplayIndex(index);
      // });
    }
    // タブグループのコピーを作成する
    let tabGroup: BrowserTabGroup;
    const tabObject = {
      id: this.id,
      collapsed: this.collapsed,
      color: this.color,
      title: this.title,
      windowId: this.windowId,
    };
    if (this instanceof StoredBrowserTabGroup) {
      tabGroup = new StoredBrowserTabGroup(tabObject);
    } else {
      tabGroup = new BrowserTabGroup(tabObject);
    }
    // タブグループに属するタブを設定する
    tabGroup.tabs = filteredTabs;
    return tabGroup;
  }
}

/**
 * ストレージに保存されているタブグループを表すクラス
 */
export class StoredBrowserTabGroup extends BrowserTabGroup {
  /**
   * コンストラクター
   * @param tabGroup タブグループ
   */
  constructor(tabGroup: TabGroup) {
    super(tabGroup);
  }

  /**
   * DTO からインスタンスを生成する
   */
  static fromDto(tabGroupDto: BrowserTabGroupDto): StoredBrowserTabGroup {
    const tabGroup = new StoredBrowserTabGroup({
      id: 0,
      collapsed: false,
      color: tabGroupDto.color,
      title: tabGroupDto.title,
      windowId: 0,
    });
    if (tabGroupDto.tabs) {
      const tabs: BrowserTab[] = [];
      for (const [index, tabDto] of tabGroupDto.tabs!.entries()) {
        const tab = BrowserTab.fromDto(tabDto);
        // tab.setDisplayIndex(index);
        tabs.push(tab);
      }
      tabGroup.setTabs(tabs);
    }
    return tabGroup;
  }
}

/**
 * 保存用のタブグループを表すクラス
 */
export class BrowserTabGroupDto {
  /**
   * グループのタイトル。
   */
  title: string;

  /**
   * グループの色。
   */
  color: ColorEnum;

  /**
   * タブの一覧
   */
  tabs: BrowserTabDto[];

  /**
   * コンストラクター
   */
  constructor(tabGroup: BrowserTabGroup) {
    if (!tabGroup.title) {
      throw new Error('タイトルがありません');
    }
    this.title = tabGroup.title;
    this.color = tabGroup.color;
    // タブの一覧を生成する
    this.tabs = tabGroup.tabs?.map((tab) => new BrowserTabDto(tab)) ?? [];
  }

  /**
   * 圧縮文字列へ変換する
   * @returns 圧縮文字列
   */
  async compress(): Promise<string> {
    console.debug(`compress called!`);
    const original = JSON.stringify(this);
    const compressed = await compress(original);
    console.log(`圧縮文字列: ${compressed}`);
    return compressed;
  }

  /**
   * 圧縮文字列からオブジェクトを復元する
   * @param compressed 圧縮文字列
   * @returns 復元したオブジェクト
   */
  static async decompress(compressed: string): Promise<BrowserTabGroupDto> {
    console.debug(`decompress called!`);
    const decompressed = await decompress(compressed);
    console.log(`解凍文字列: ${decompressed}`);
    const obj = JSON.parse(decompressed);
    console.debug(`解凍オブジェクト: ${JSON.stringify(obj)}`);
    const dto = obj as BrowserTabGroupDto;
    return dto;
  }
}
