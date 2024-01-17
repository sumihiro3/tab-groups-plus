import { BrowserTab } from '../../../types';

/**
 * タブを新しく作成する
 * @returns Tab
 */
export const createNewTab = async (): Promise<BrowserTab> => {
  console.debug('createNewTab called!');
  const tab = await chrome.tabs.create({});
  return new BrowserTab(tab);
};

/**
 * 指定のタブをハイライトする
 * @param tab タブ
 */
export const highlightTab = async (tab: BrowserTab): Promise<void> => {
  console.debug(`highlightTab called! [tab: ${JSON.stringify(tab)}]`);
  await chrome.tabs.highlight({
    tabs: tab.index,
    windowId: tab.windowId,
  });
};

/**
 * 指定のタブを閉じる
 * @param tab タブ
 */
export const closeTab = async (tab: BrowserTab): Promise<void> => {
  console.debug(`closeTab called! [tab: ${JSON.stringify(tab)}]`);
  await chrome.tabs.remove(tab.id!);
};
