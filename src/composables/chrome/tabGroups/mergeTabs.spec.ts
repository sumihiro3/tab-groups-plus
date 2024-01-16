import * as tabGroups from './index';
import { BrowserTab } from '../../../types';

/**
 * テスト用のタブ一覧を作成する
 */
const createTabs = (): BrowserTab[] => {
  const tabs = [
    {
      id: 1,
      index: 0,
      windowId: 1,
      groupId: 1,
      title: 'タブ1',
      url: 'https://example.com/1',
      active: true,
      highlighted: true,
      pinned: false,
      discarded: false,
      incognito: false,
    },
    {
      id: 2,
      index: 1,
      windowId: 1,
      groupId: 1,
      title: 'タブ2',
      url: 'https://example.com/2',
      active: true,
      highlighted: true,
      pinned: false,
      discarded: false,
      incognito: false,
    },
    {
      id: 3,
      index: 2,
      windowId: 1,
      groupId: 2,
      title: 'タブ3',
      url: 'https://example.com/3',
      active: true,
      highlighted: true,
      pinned: false,
      discarded: false,
      incognito: false,
    },
  ];
  return tabs;
};

describe('mergeTabs', () => {
  test('正常系：同じURLをもつタブが存在しない場合', () => {
    // setup
    const tabList1 = createTabs();
    const tabList2 = [
      {
        id: 4,
        index: 2,
        windowId: 2,
        groupId: 2,
        title: 'タブ4',
        url: 'https://example.com/4',
        active: true,
        highlighted: true,
        pinned: false,
        discarded: false,
        incognito: false,
      },
      {
        id: 1,
        index: 0,
        windowId: 1,
        groupId: 1,
        title: 'タブ5',
        url: 'https://example.com/5',
        active: true,
        highlighted: true,
        pinned: false,
        discarded: false,
        incognito: false,
      },
    ];
    // execute
    const result = tabGroups.mergeTabs(tabList1, tabList2);
    // assert
    expect(result.length).toEqual(tabList1.length + tabList2.length);
    expect(result).toEqual([...tabList1, ...tabList2]);
  });

  test('正常系：同じURLを持つタブが存在する場合', () => {
    // setup
    const tabList1 = createTabs();
    const tabList2 = [
      {
        id: 4,
        index: 2,
        windowId: 2,
        groupId: 2,
        title: 'タブ4',
        url: 'https://example.com/4',
        active: true,
        highlighted: true,
        pinned: false,
        discarded: false,
        incognito: false,
      },
      {
        id: 1,
        index: 0,
        windowId: 1,
        groupId: 1,
        title: 'タブ1111',
        url: 'https://example.com/1',
        active: true,
        highlighted: true,
        pinned: false,
        discarded: false,
        incognito: false,
      },
    ];
    // execute
    const result = tabGroups.mergeTabs(tabList1, tabList2);
    // assert
    expect(result.length).toEqual(tabList1.length + tabList2.length - 1);
    // tabList2 の内容で上書きされているはず
    expect(result).toEqual([tabList1[1], tabList1[2], ...tabList2]);
  });
});
