import * as tabGroups from './index';
import * as storage from '../storage';
import { BrowserTab, BrowserTabGroup } from '../../../types';
import { TabGroupsSaveError } from '../../../types/errors';

/**
 * テスト用のタブグループを作成する
 */
// const createTabGroups = (): BrowserTabGroup[] => {
//   const tabGroups = [
//     new BrowserTabGroup({
//       id: 1,
//       collapsed: false,
//       color: 'red',
//       title: 'タブグループ1',
//       windowId: 1,
//     }),
//     new BrowserTabGroup({
//       id: 2,
//       collapsed: false,
//       color: 'blue',
//       title: 'タブグループ2',
//       windowId: 1,
//     }),
//   ];
//   return tabGroups;
// };

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

describe('saveTabGroup', () => {
  test('正常系：対象タブグループのタイトルは保存されていない場合', async () => {
    // setup mock
    // メタデータ取得
    const mockGetTabGroupMetadataFromSyncStorage = jest.spyOn(
      storage,
      'getTabGroupMetadataFromSyncStorage',
    );
    const savedTabGroupMetadata = {
      titleList: ['タブグループ1', 'タブグループ2'],
    };
    mockGetTabGroupMetadataFromSyncStorage.mockResolvedValue(
      savedTabGroupMetadata,
    );
    // タブを取得
    const mockGetTabsInTabGroup = jest.spyOn(tabGroups, 'getTabsInTabGroup');
    const testTabs = createTabs();
    mockGetTabsInTabGroup.mockResolvedValue(testTabs);
    // タブグループ保存
    const mockSetTabGroupValueToSyncStorage = jest.spyOn(
      storage,
      'setTabGroupValueToSyncStorage',
    );
    mockSetTabGroupValueToSyncStorage.mockResolvedValue();
    // メタデータ保存
    const mockSetTabGroupMetadataToSyncStorage = jest.spyOn(
      storage,
      'setTabGroupMetadataToSyncStorage',
    );
    mockSetTabGroupMetadataToSyncStorage.mockResolvedValue();

    // execute
    const targetTabGroup = new BrowserTabGroup({
      id: 999,
      collapsed: false,
      color: 'green',
      title: 'タブグループ999',
      windowId: 1,
    });
    await tabGroups.saveTabGroup(targetTabGroup);

    // assert
    expect(mockGetTabGroupMetadataFromSyncStorage).toHaveBeenCalled(); // タブグループのメタデータを取得しているはず
    const updatedTabGroupMetadata = {
      titleList: ['タブグループ1', 'タブグループ2', 'タブグループ999'],
    };
    targetTabGroup.setTabs(testTabs);
    expect(mockSetTabGroupValueToSyncStorage).toHaveBeenCalledWith(
      targetTabGroup.title,
      targetTabGroup,
    ); // タイトルをキーにしてストレージに保存しているはず
    expect(mockSetTabGroupMetadataToSyncStorage).toHaveBeenCalledWith(
      updatedTabGroupMetadata,
    ); // タブグループのメタデータを更新して保存しているはず
  });

  test('異常系：対象タブグループのタイトルが未設定の場合', async () => {
    // execute
    const targetTabGroup = new BrowserTabGroup({
      id: 999,
      collapsed: false,
      color: 'green',
      title: undefined,
      windowId: 1,
    });
    try {
      await tabGroups.saveTabGroup(targetTabGroup);
      fail('例外が発生しなかったためテスト失敗');
    } catch (error) {
      if (error instanceof TabGroupsSaveError) {
        // 正しい例外が発生した場合はテスト成功
      } else {
        fail('発生例外が想定外であったためテスト失敗');
      }
    }
  });
});
