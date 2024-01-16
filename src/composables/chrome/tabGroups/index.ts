import {
  getTabGroupMetadataFromSyncStorage,
  getTabGroupValueFromSyncStorage,
  setTabGroupMetadataToSyncStorage,
  setTabGroupValueToSyncStorage,
  removeTabGroup,
} from '..';
import {
  BrowserTab,
  BrowserTabGroup,
  StoredBrowserTabGroup,
} from '../../../types';
import { TabGroupsSaveError } from '../../../types/errors';
import { getExtensionOptions } from '../../options';

/**
 * すべてのタブグループを取得する
 */
export const getTabGroups = async (): Promise<BrowserTabGroup[]> => {
  console.debug('getTabGroups called!');
  const tabGroups = await chrome.tabGroups.query({});
  const result = tabGroups.map((tabGroup) => new BrowserTabGroup(tabGroup));
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
  const result = tabs.map((tab) => new BrowserTab(tab));
  return result;
};

/**
 * 指定タブグループのタブをハイライト状態にする
 * @param tabGroup タブグループ
 */
export const highlightTabGroup = async (
  tabGroup: BrowserTabGroup,
): Promise<void> => {
  console.debug('highlightTabGroup called!');
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
  const index = tabGroupMetadata.titleList.indexOf(tabGroup.title);
  if (index === -1) {
    // 保存対象のタイトルがメタデータに存在しない場合は、タイトルを追加する
    tabGroupMetadata.titleList.push(tabGroup.title);
    // タブグループのメタデータを保存する
    await setTabGroupMetadataToSyncStorage(tabGroupMetadata);
  } else {
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
  await setTabGroupValueToSyncStorage(tabGroup.title, tabGroup);
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
  const tabs = await getTabsInTabGroup(tabGroup);
  // 各タブを閉じる
  for (const tab of tabs) {
    await chrome.tabs.remove(tab.id!);
  }
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
  for (const title of tabGroupMetadata.titleList) {
    const tabGroup = await getTabGroupValueFromSyncStorage(title);
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
    const createdTabs = [];
    // タブグループに属するタブを復元する
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
    // タブグループをストレージから削除する
    await removeTabGroup(tabGroup);
    return new BrowserTabGroup(group);
  } catch (error) {
    console.error(error);
    throw new TabGroupsSaveError(`タブグループの復元に失敗しました。`);
  }
};
