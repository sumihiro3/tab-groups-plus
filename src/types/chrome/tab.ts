type Tab = chrome.tabs.Tab;

/**
 * ブラウザーのタブを表すクラス
 * @see https://developer.chrome.com/docs/extensions/reference/tabs/#type-Tab
 */
export class BrowserTab {
  /**
   * タブの ID。
   * タブ ID は、ブラウザ セッション内で一意です。
   * 状況によっては、タブに ID が割り当てられないことがあります。
   * たとえば、sessions API を使用して外部タブをクエリする場合、セッション ID が存在することがあります。タブ ID は、アプリとデベロッパー ツールのウィンドウに対して chrome.tabs.TAB_ID_NONE に設定することもできます。
   */
  id?: number;

  /**
   * ウィンドウ内のタブのゼロから始まるインデックス。
   */
  index: number;

  /**
   * タブを含むウィンドウの ID。
   */
  windowId: number;

  /**
   * タブがハイライト表示されているかどうか。
   */
  highlighted: boolean;

  /**
   * ウィンドウでタブがアクティブかどうか。
   * 必ずしもウィンドウがフォーカスされているとは限りません。
   */
  active: boolean;

  /**
   * タブが固定されているかどうか。
   */
  pinned: boolean;

  /**
   * タブが破棄されるかどうか。
   * 破棄されたタブとは、コンテンツがメモリからアンロードされたものの、タブバーには表示されているタブのことです。
   * そのコンテンツは、次回アクティブになったときに再読み込みされます。
   */
  discarded: boolean;

  /**
   * タブのタイトル。このプロパティは、拡張機能のマニフェストに "tabs" 権限が含まれている場合にのみ存在します。
   */
  title?: string;

  /**
   * タブのメインフレームの最後の commit URL。
   * このプロパティは、拡張機能のマニフェストに "tabs" 権限が含まれている場合のみ存在します。タブがまだ commit されていない場合は空の文字列になります。Tab.pendingUrl もご覧ください。
   */
  url?: string;

  /**
   * タブのファビコンの URL です。
   * このプロパティは、拡張機能のマニフェストに "tabs" 権限が含まれている場合にのみ存在します。
   * タブが読み込まれている場合は空の文字列になることもあります。
   */
  favIconUrl?: string;

  /**
   * タブの読み込みステータス。
   */
  status?: string;

  /**
   * タブがシークレット ウィンドウにあるかどうかを示します。
   */
  incognito: boolean;

  /**
   * このタブを開いたタブの ID（ある場合）。
   * このプロパティは、オープナー タブがまだ存在する場合にのみ使用できます。
   */
  openerTabId?: number;

  /**
   * タブが属するグループの ID。
   */
  groupId: number;

  /**
   * タブが属するタブグループのアイテムリストでの表示位置（リスト中のインデックス）
   */
  tabGroupDisplayIndex?: number;

  /**
   * タブのアイテムリストでの表示位置（リスト中のインデックス）
   */
  displayIndex?: number;

  /**
   * コンストラクター
   * @param tab タブ
   */
  constructor(tab: Tab) {
    this.id = tab.id;
    this.index = tab.index;
    this.windowId = tab.windowId;
    this.highlighted = tab.highlighted;
    this.active = tab.active;
    this.pinned = tab.pinned;
    this.discarded = tab.discarded;
    this.title = tab.title;
    if (tab.status === 'loading') {
      this.url = tab.pendingUrl;
    } else {
      this.url = tab.url;
    }
    this.favIconUrl = tab.favIconUrl;
    this.status = tab.status;
    this.incognito = tab.incognito;
    this.openerTabId = tab.openerTabId;
    this.groupId = tab.groupId;
  }

  /**
   * リストでの表示位置を設定する
   */
  setDisplayIndex(index: number) {
    if (index < 0) {
      throw new Error('displayIndex は 0 以上である必要があります');
    }
    this.displayIndex = index;
  }

  /**
   * タブグループを設定する
   * @param group タブグループ
   */
  setGroupDisplayIndex(index: number) {
    if (index < 0) {
      throw new Error('tabGroupDisplayIndex は 0 以上である必要があります');
    }
    this.tabGroupDisplayIndex = index;
  }

  /**
   * DTO からインスタンスを生成する
   */
  static fromDto(tabDto: BrowserTabDto): BrowserTab {
    const tab = new BrowserTab({
      title: tabDto.title,
      url: tabDto.url,
      favIconUrl: tabDto.favIconUrl,
      id: 0,
      index: 0,
      windowId: 0,
      highlighted: false,
      active: false,
      pinned: false,
      discarded: false,
      incognito: false,
      groupId: 0,
      selected: false,
      autoDiscardable: false,
    });
    return tab;
  }
}

/**
 * 保存用のタブを表すクラス
 */
export class BrowserTabDto {
  /**
   * タブのタイトル
   */
  title: string;

  /**
   * タブで開いている URL
   */
  url: string;

  /**
   * タブのファビコンの URL
   */
  favIconUrl?: string;

  /**
   * コンストラクター
   * @param tab タブ
   */
  constructor(tab: BrowserTab) {
    if (!tab.title) {
      throw new Error('タブのタイトルがありません');
    }
    if (!tab.url) {
      throw new Error('タブの URL がありません');
    }
    this.title = tab.title;
    this.url = tab.url;
    this.favIconUrl = tab.favIconUrl;
  }
}
