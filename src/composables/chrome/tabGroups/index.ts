import { BrowserTab, BrowserTabGroup } from '../../../types';

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
