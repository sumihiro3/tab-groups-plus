type ColorEnum = chrome.tabGroups.ColorEnum;
import { BrowserTab, BrowserTabGroup } from '.';

describe('BrowserTabGroup', () => {
  describe('contains', () => {
    test('正常系：タイトルのみ検索', () => {
      // setup
      const group = createBrowserTabGroups('グループA');
      const tabA = createBrowserTab('タブA', 'https://example.com', group.id);
      const tabB = createBrowserTab('タブB', 'https://example.com', group.id);
      group.setTabs([tabA, tabB]);
      group.isUnGrouped = jest.fn().mockReturnValue(false);

      // execute
      const result = group.contains('グループ');

      // assert
      expect(result).not.toBeNull();
      expect(result?.tabs?.length).toEqual(0);
    });

    test('正常系：タイトルとURLを検索：URLでタブが2つ一致', () => {
      // setup
      const group = createBrowserTabGroups('グループA');
      const tabA = createBrowserTab('タブA', 'https://example-a.com', group.id);
      const tabB = createBrowserTab('タブB', 'https://example-b.com', group.id);
      group.setTabs([tabA, tabB]);
      group.isUnGrouped = jest.fn().mockReturnValue(false);

      // execute
      const result = group.contains('example', true);

      // assert
      expect(result).not.toBeNull();
      expect(result?.tabs?.length).toEqual(2);
    });

    test('正常系：タイトルとURLを検索：URLでタブが一つ一致', () => {
      // setup
      const group = createBrowserTabGroups('グループA');
      const tabA = createBrowserTab('タブA', 'https://example-a.com', group.id);
      const tabB = createBrowserTab('タブB', 'https://example-b.com', group.id);
      group.setTabs([tabA, tabB]);
      group.isUnGrouped = jest.fn().mockReturnValue(false);

      // execute
      const result = group.contains('example-a', true);

      // assert
      expect(result).not.toBeNull();
      expect(result?.tabs?.length).toEqual(1);
    });

    test('正常系：タイトルとURLを検索：タブグループタイトルのみ一致', () => {
      // setup
      const group = createBrowserTabGroups('グループA');
      const tabA = createBrowserTab('タブA', 'https://example-a.com', group.id);
      const tabB = createBrowserTab('タブB', 'https://example-b.com', group.id);
      group.setTabs([tabA, tabB]);
      group.isUnGrouped = jest.fn().mockReturnValue(false);

      // execute
      const result = group.contains('グループ', true);

      // assert
      expect(result).not.toBeNull();
      expect(result?.tabs?.length).toEqual(0);
    });

    test('正常系：タイトルとURLを検索：タブのタイトルが1つのみ一致', () => {
      // setup
      const group = createBrowserTabGroups('グループA');
      const tabA = createBrowserTab('タブA', 'https://example-a.com', group.id);
      const tabB = createBrowserTab('タブB', 'https://example-b.com', group.id);
      group.setTabs([tabA, tabB]);
      group.isUnGrouped = jest.fn().mockReturnValue(false);

      // execute
      const result = group.contains('タブA', true);

      // assert
      expect(result).not.toBeNull();
      expect(result?.tabs?.length).toEqual(1);
    });

    test('正常系：タイトルとURLを検索：一致なし', () => {
      // setup
      const group = createBrowserTabGroups('グループA');
      const tabA = createBrowserTab('タブA', 'https://example-a.com', group.id);
      const tabB = createBrowserTab('タブB', 'https://example-b.com', group.id);
      group.setTabs([tabA, tabB]);
      group.isUnGrouped = jest.fn().mockReturnValue(false);

      // execute
      const result = group.contains('not-found', true);

      // assert
      expect(result).toBeNull();
    });
  });
});

/**
 * タブグループオブジェクトを生成する
 * @param title タブグループのタイトル
 * @returns タブグループオブジェクト
 */
function createBrowserTabGroups(title: string): BrowserTabGroup {
  const tabGroupObject = {
    id: 1,
    collapsed: true,
    color: 'red' as ColorEnum,
    title: title,
    windowId: 0,
  };
  const tabGroup = new BrowserTabGroup(tabGroupObject);
  return tabGroup;
}

/**
 * タブオブジェクトを生成する
 * @param title タブのタイトル
 * @param url タブの URL
 * @param groupId タブグループの ID
 * @returns タブオブジェクト
 */
function createBrowserTab(
  title: string,
  url: string,
  groupId: number,
): BrowserTab {
  const tabObject = {
    id: 1,
    groupId,
    title: title,
    url: url,
    index: 1,
    windowId: 0,
    pinned: false,
    highlighted: false,
    active: false,
    incognito: false,
    selected: false,
    discarded: false,
    autoDiscardable: false,
  };
  const tab = new BrowserTab(tabObject);
  return tab;
}
