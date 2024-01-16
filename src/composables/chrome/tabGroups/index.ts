import {
  getTabGroupMetadataFromSyncStorage,
  setTabGroupMetadataToSyncStorage,
  setTabGroupValueToSyncStorage,
} from '..';
import { BrowserTab, BrowserTabGroup } from '../../../types';
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
  // 保存対象のタブグループのタイトルが既に存在するかどうかを確認する
  const index = tabGroupMetadata.titleList.indexOf(tabGroup.title);
  if (index === -1) {
    // 保存対象のタイトルが存在しない場合は、タイトルを追加する
    tabGroupMetadata.titleList.push(tabGroup.title);
  }
  // タブグループに属するタブを取得する
  const tabs = await getTabsInTabGroup(tabGroup);
  // タブグループに属するタブを設定する
  tabGroup.setTabs(tabs);
  // タブグループを保存する
  await setTabGroupValueToSyncStorage(tabGroup.title, tabGroup);
  // タブグループのメタデータを保存する
  await setTabGroupMetadataToSyncStorage(tabGroupMetadata);
};
