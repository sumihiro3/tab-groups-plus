import {
  getTabGroupMetadataFromSyncStorage,
  getTabGroupValueFromSyncStorage,
  setTabGroupMetadataToSyncStorage,
  saveTabGroupValueToSyncStorage,
  removeTabGroup,
} from '..';
import {
  BrowserTab,
  BrowserTabGroup,
  BrowserTabGroupMetadataRecord,
  StoredBrowserTabGroup,
  UnGroupedTabs,
} from '../../../types';
import { TabGroupsSaveError } from '../../../types/errors';
import { getExtensionOptions } from '../../options';

/**
 * 指定のタブグループがブラウザーで開かれているかどうかを判定する
 * @returns ブラウザーで開かれている場合は true
 */
export const isOpenedBrowserTabGroup = (tabGroup: BrowserTabGroup): boolean => {
  console.debug(
    `isTabGroupOpened called! [tabGroup: ${JSON.stringify(tabGroup)}]`,
  );
  let result = false;
  if (tabGroup instanceof StoredBrowserTabGroup) {
    result = false;
  } else if (tabGroup instanceof UnGroupedTabs) {
    result = false;
  } else {
    result = true;
  }
  return result;
};

/**
 * 指定のタブグループが、保存されているタブグループであるかを判定する
 * @returns 保存されているタブグループである場合は true
 */
export const isStoredBrowserTabGroup = (tabGroup: BrowserTabGroup): boolean => {
  console.debug(
    `isTabGroupStored called! [tabGroup: ${JSON.stringify(tabGroup)}]`,
  );
  let result = false;
  if (tabGroup instanceof StoredBrowserTabGroup) {
    result = true;
  }
  return result;
};

/**
 * 指定のタブグループが、タブグループに属していない TabGroup オブジェクトであるかを判定する
 * @returns タブグループに属していない TabGroup オブジェクトである場合は true
 */
export const isUnGroupedBrowserTabGroup = (
  tabGroup: BrowserTabGroup,
): boolean => {
  console.debug(
    `isUnGroupedBrowserTabGroup called! [tabGroup: ${JSON.stringify(
      tabGroup,
    )}]`,
  );
  let result = false;
  if (tabGroup instanceof UnGroupedTabs) {
    result = true;
  }
  return result;
};

/**
 * すべてのタブグループを取得する
 */
export const getTabGroups = async (): Promise<BrowserTabGroup[]> => {
  console.debug('getTabGroups called!');
  const tabGroups = await chrome.tabGroups.query({});
  const result = [];
  for (const group of tabGroups) {
    const g = new BrowserTabGroup(group);
    const tabs = await getTabsInTabGroup(g);
    g.setTabs(tabs);
    result.push(g);
  }
  return result;
};

/**
 * タブグループに含まれるタブを取得する
 * @param tabGroup タブグループ
 */
export const getTabsInTabGroup = async (
  tabGroup: BrowserTabGroup,
): Promise<BrowserTab[]> => {
  console.debug('getTabsInTabGroup called!');
  const tabs = await chrome.tabs.query({ groupId: tabGroup.id });
  console.debug(`got tabs: ${JSON.stringify(tabs)}`);
  const result: BrowserTab[] = [];
  for (const tab of tabs) {
    const t = new BrowserTab(tab);
    result.push(t);
  }
  return result;
};

/**
 * 指定タブグループのタブをハイライト状態にする
 * @param tabGroup タブグループ
 */
export const highlightTabGroup = async (
  tabGroup: BrowserTabGroup,
): Promise<void> => {
  console.debug(
    `highlightTabGroup called! [target tabGroup: ${tabGroup.title}]`,
  );
  const options = await getExtensionOptions();
  // タブグループに属する最初のタブを取得し、このタブをハイライト対象とする
  const tabs = await chrome.tabs.query({ groupId: tabGroup.id });
  if (!tabs.length) {
    return;
  }
  const targetTab = tabs[0];
  // カレントウィンドウを取得
  const currentWindow = await chrome.windows.getCurrent();
  if (currentWindow.id !== targetTab.windowId) {
    // ハイライト対象タブが属するウィンドウがカレントウィンドウでない場合は、
    // タブが属するウィンドウをアクティブにする
    await chrome.windows.update(targetTab.windowId, { focused: true });
  }
  // 対象のタブをハイライトする
  await chrome.tabs.highlight({
    tabs: targetTab.index,
    windowId: targetTab.windowId,
  });
  if (options.reloadOnHighlight && targetTab.id) {
    // オプションで設定されている場合は、対象のタブをリロードする
    await chrome.tabs.reload(targetTab.id);
  }
};

/**
 * 未分類のタブ群を取得する
 */
export const getUnGroupedTabs = async (
  title: string = '',
): Promise<UnGroupedTabs> => {
  console.debug('getUnGroupedTabs called!');
  const tabs = await chrome.tabs.query({
    // タブグループに含まれていないタブのみ取得する
    groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
  });
  const unGroupedTabs = new UnGroupedTabs(title);
  if (tabs.length > 0) {
    unGroupedTabs.setTabs(tabs.map((tab) => new BrowserTab(tab)));
  }
  return unGroupedTabs;
};

/**
 * 指定のタブグループをストレージに保存する
 * すでに同じタイトルのタブグループが存在する場合は、タブ内容をマージする
 * @param tabGroup タブグループ
 */
export const saveTabGroup = async (
  tabGroup: BrowserTabGroup,
): Promise<void> => {
  console.debug(`saveTabGroup called! [tabGroup: ${JSON.stringify(tabGroup)}]`);
  if (!tabGroup.title) {
    // タイトルが存在しない場合は保存しない
    const errorMessage = `タイトルが存在しないため、タブグループを保存できません。`;
    console.error(errorMessage);
    throw new TabGroupsSaveError(errorMessage);
  }
  // 保存されているタブグループのメタデータを取得する
  const tabGroupMetadata = await getTabGroupMetadataFromSyncStorage();
  // タブグループに属するタブを取得する
  let tabs = await getTabsInTabGroup(tabGroup);
  // 保存対象のタブグループのタイトルが既に存在するかどうかを確認する
  let metadataRecord = tabGroupMetadata.getRecord(tabGroup.title);
  if (metadataRecord) {
    // 既に同じタイトルのタブグループが存在する場合
    const options = await getExtensionOptions();
    if (!options.overwriteTabGroup) {
      // オプションで上書きしない設定になっている場合は、マージする
      // 保存されているタブグループの内容を取得する
      const savedGroup = await getTabGroupValueFromSyncStorage(tabGroup.title);
      if (savedGroup && savedGroup.tabs) {
        // マージする
        tabs = mergeTabs(tabs, savedGroup.tabs!);
      }
    }
  }
  // タブグループに属するタブを設定する
  tabGroup.setTabs(tabs);
  // タブグループを保存する
  const storageItemCount = await saveTabGroupValueToSyncStorage(tabGroup);
  // 保存したタブグループのメタデータを更新する
  tabGroupMetadata.upsertRecord(tabGroup.title, storageItemCount);
  // タブグループのメタデータを保存する
  await setTabGroupMetadataToSyncStorage(tabGroupMetadata);
};

/**
 * 2つのタブ一覧をマージする
 * 両方に一致するURLを持つタブは、後者のタブ一覧にあるタブの内容で上書きされる
 * @param tabList1 タブ一覧1
 * @param tabList2 タブ一覧2
 */
export const mergeTabs = (
  tabList1: BrowserTab[],
  tabList2: BrowserTab[],
): BrowserTab[] => {
  console.debug(
    `mergeTabs called! [tabs1: ${JSON.stringify(
      tabList1,
    )}, tabs2: ${JSON.stringify(tabList2)}]`,
  );
  // タブ一覧2のタブをタブ一覧1にマージする
  // タブ一覧2 に含まれないものはそのまま残す
  // 両方に同じURLがある場合は、タブ一覧2の内容を優先して残す
  const filteredTabList1 = tabList1.filter((tab1) => {
    const index = tabList2.findIndex((tab2) => tab2.url === tab1.url);
    if (index === -1) {
      // タブ一覧2に含まれない場合はそのまま残す
      return true;
    } else {
      return false;
    }
  });
  // タブ一覧2のタブをマージする
  const result = filteredTabList1.concat(tabList2);
  return result;
};

/**
 * 指定のタブグループを閉じる
 */
export const closeTabGroup = async (
  tabGroup: BrowserTabGroup,
): Promise<void> => {
  console.debug(
    `closeTabGroup called! [tabGroup: ${JSON.stringify(tabGroup)}]`,
  );
  let tabs = await getTabsInTabGroup(tabGroup);
  // 閉じる対象のタブグループがカレントウィンドウに存在するかどうかを確認する
  const currentWindow = await chrome.windows.getCurrent();
  const inCurrentWindows = tabs.filter(
    (tab) => tab.windowId === currentWindow.id,
  );
  if (inCurrentWindows.length > 0) {
    // カレントウィンドウに存在する場合は、先にグループを解除する
    await chrome.tabs.ungroup(inCurrentWindows.map((tab) => tab.id!));
  }
  // 各タブを閉じる
  for (const tab of tabs) {
    await chrome.tabs.remove(tab.id!);
  }
};

/**
 * 指定のタブグループが現在のウィンドウに存在するかどうかを判定する
 * @param tabGroup タブグループ
 * @returns 現在のウィンドウに存在する場合は true
 */
export const isTabGroupInCurrentWindow = async (
  tabGroup: BrowserTabGroup,
): Promise<boolean> => {
  console.debug(
    `isTabGroupInCurrentWindow called! [tabGroup: ${JSON.stringify(tabGroup)}]`,
  );
  const currentWindow = await chrome.windows.getCurrent();
  const tabs = await chrome.tabs.query({
    groupId: tabGroup.id,
    windowId: currentWindow.id,
  });
  return tabs.length > 0;
};

/**
 * 保存されたタブグループをすべて取得する
 */
export const getStoredTabGroups = async (): Promise<BrowserTabGroup[]> => {
  console.debug('getStoredTabGroups called!');
  // 保存されているタブグループのメタデータを取得する
  const tabGroupMetadata = await getTabGroupMetadataFromSyncStorage();
  // 保存されているタブグループを取得する
  const tabGroups: BrowserTabGroup[] = [];
  const metadataRecords: BrowserTabGroupMetadataRecord[] =
    tabGroupMetadata.getRecords();
  for (const metadataRecord of metadataRecords) {
    const tabGroup = await getTabGroupValueFromSyncStorage(
      metadataRecord.title!,
      metadataRecord.count,
    );
    // tabGroup?.setDisplayIndex(index);
    if (tabGroup) {
      tabGroups.push(tabGroup);
    }
  }
  return tabGroups;
};

/**
 * 指定の保存されていたタブグループをブラウザーに復元する
 * @param tabGroup タブグループ
 */
export const restoreTabGroup = async (
  tabGroup: StoredBrowserTabGroup,
): Promise<BrowserTabGroup | null> => {
  console.debug(
    `restoreTabGroup called! [tabGroup: ${JSON.stringify(tabGroup)}]`,
  );
  try {
    // タブグループに属するタブを取得する
    const tabs = tabGroup.tabs;
    if (!tabs) {
      return null;
    }
    // タブグループに属するタブを復元する
    const createdTabs = [];
    for (const tab of tabs) {
      const createdTab = await chrome.tabs.create({
        url: tab.url,
        active: false,
      });
      createdTabs.push(createdTab);
    }
    // タブグループを作成する
    const groupId = await chrome.tabs.group({
      tabIds: createdTabs.map((tab) => tab.id!),
    });
    // タブグループ名などを設定する
    const group = await chrome.tabGroups.update(groupId, {
      title: tabGroup.title,
      color: tabGroup.color,
    });
    // 拡張機能設定を取得する
    const options = await getExtensionOptions();
    if (options.openInNewWindow) {
      // 新しいウィンドウを開く
      const newWindow = await chrome.windows.create({
        focused: true,
      });
      // 新しいウィンドウへタブグループを移動する
      await chrome.tabGroups.move(groupId, {
        index: 0,
        windowId: newWindow.id!,
      });
    }
    if (options.removeSavedTabGroupWhenRestore) {
      // タブグループをストレージから削除する
      await removeTabGroup(tabGroup);
    }
    const restoredGroup = new BrowserTabGroup(group);
    const restoredTabs = await getTabsInTabGroup(restoredGroup);
    restoredGroup.setTabs(restoredTabs);
    return restoredGroup;
  } catch (error) {
    console.error(error);
    throw new TabGroupsSaveError(`タブグループの復元に失敗しました。`);
  }
};
