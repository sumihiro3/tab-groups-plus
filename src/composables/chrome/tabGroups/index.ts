import { BrowserTab, BrowserTabGroup } from '../../../types';
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
