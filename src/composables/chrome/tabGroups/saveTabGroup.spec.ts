import * as tabGroups from './index';
import * as storage from '../storage';
import * as options from '../../options';
import {
  BrowserTab,
  BrowserTabGroup,
  BrowserTabGroupMetadata,
} from '../../../types';
import { TabGroupsSaveError } from '../../../types/errors';

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

/**
 * テスト用のタブ一覧を作成する（マージ用）
 */
const createMergedTabs = (): BrowserTab[] => {
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
    {
      id: 4,
      index: 2,
      windowId: 3,
      groupId: 2,
      title: 'タブ4',
      url: 'https://example.com/4',
      active: true,
      highlighted: true,
      pinned: false,
      discarded: false,
      incognito: false,
    },
  ];
  return tabs;
};

afterEach(() => {
  jest.clearAllMocks();
});

describe('saveTabGroup', () => {
  test('正常系：対象タブグループのタイトルは保存されていない場合', async () => {
    // setup mock
    // メタデータ取得
    const mockGetTabGroupMetadataFromSyncStorage = jest.spyOn(
      storage,
      'getTabGroupMetadataFromSyncStorage',
    );
    const savedTabGroupMetadata = new BrowserTabGroupMetadata();
    savedTabGroupMetadata.upsertRecord('タブグループ1', 2);
    savedTabGroupMetadata.upsertRecord('タブグループ2', 1);
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
      'saveTabGroupValueToSyncStorage',
    );
    const savedItemCount = 3;
    mockSetTabGroupValueToSyncStorage.mockResolvedValue(savedItemCount);
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
    // タブグループのメタデータを取得しているはず
    expect(mockGetTabGroupMetadataFromSyncStorage).toHaveBeenCalled();
    targetTabGroup.setTabs(testTabs);
    // メタデータにタイトルが追加されているはず
    // const updatedTabGroupMetadata = {
    //   titleList: ['タブグループ1', 'タブグループ2', 'タブグループ999'],
    // };
    // タイトルをキーにしてストレージに保存しているはず
    expect(mockSetTabGroupValueToSyncStorage).toHaveBeenCalledWith(
      targetTabGroup,
    );
    // タブグループのメタデータを更新して保存しているはず
    expect(mockSetTabGroupMetadataToSyncStorage).toHaveBeenCalledTimes(1);
    // メタデータにストレージの項目数が保存されているはず
    const metadataRecord = savedTabGroupMetadata.getRecord(
      targetTabGroup.title!,
    );
    expect(metadataRecord).not.toBeNull();
    expect(metadataRecord!.count).toEqual(savedItemCount);
  });

  test('正常系：対象タブグループのタイトルがすでに保存されている場合（上書き保存）', async () => {
    const targetTabGroupName = 'タブグループ999';
    // setup mock
    // メタデータ取得
    const mockGetTabGroupMetadataFromSyncStorage = jest.spyOn(
      storage,
      'getTabGroupMetadataFromSyncStorage',
    );
    const savedTabGroupMetadata = new BrowserTabGroupMetadata();
    savedTabGroupMetadata.upsertRecord('タブグループ1', 2);
    savedTabGroupMetadata.upsertRecord('タブグループ2', 1);
    savedTabGroupMetadata.upsertRecord('タブグループ999', 1);
    mockGetTabGroupMetadataFromSyncStorage.mockResolvedValue(
      savedTabGroupMetadata,
    );
    // タブを取得
    const mockGetTabsInTabGroup = jest.spyOn(tabGroups, 'getTabsInTabGroup');
    const testTabs = createTabs();
    mockGetTabsInTabGroup.mockResolvedValue(testTabs);
    // 拡張機能オプション取得
    const mockGetExtensionOptions = jest.spyOn(options, 'getExtensionOptions');
    const extensionOptions = {
      reloadOnHighlight: false,
      overwriteTabGroup: true, // 上書き保存
    };
    mockGetExtensionOptions.mockResolvedValue(extensionOptions);
    // タブのマージ
    const mockMergeTabs = jest.spyOn(tabGroups, 'mergeTabs');
    // タブグループ保存
    const mockSetTabGroupValueToSyncStorage = jest.spyOn(
      storage,
      'saveTabGroupValueToSyncStorage',
    );
    const savedItemCount = 1;
    mockSetTabGroupValueToSyncStorage.mockResolvedValue(savedItemCount);
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
      title: targetTabGroupName,
      windowId: 1,
    });
    await tabGroups.saveTabGroup(targetTabGroup);

    // assert
    // タブグループのメタデータを取得しているはず
    expect(mockGetTabGroupMetadataFromSyncStorage).toHaveBeenCalled();
    // const updatedTabGroupMetadata = {
    //   titleList: ['タブグループ1', 'タブグループ2', targetTabGroupName],
    // };
    // タブのマージは行われないはず
    expect(mockMergeTabs).not.toHaveBeenCalled();
    targetTabGroup.setTabs(testTabs);
    // タイトルをキーにしてストレージに保存しているはず
    expect(mockSetTabGroupValueToSyncStorage).toHaveBeenCalledWith(
      targetTabGroup,
    );
    // タブグループのメタデータを更新して保存しているはず
    expect(mockSetTabGroupMetadataToSyncStorage).toHaveBeenCalledTimes(1);
    // メタデータにストレージの項目数が保存されているはず
    const metadataRecord = savedTabGroupMetadata.getRecord(
      targetTabGroup.title!,
    );
    expect(metadataRecord).not.toBeNull();
    expect(metadataRecord!.count).toEqual(savedItemCount);
  });

  test('正常系：対象タブグループのタイトルがすでに保存されている場合（マージ）', async () => {
    const targetTabGroupName = 'タブグループ999';
    // setup mock
    // メタデータ取得
    const mockGetTabGroupMetadataFromSyncStorage = jest.spyOn(
      storage,
      'getTabGroupMetadataFromSyncStorage',
    );
    const savedTabGroupMetadata = new BrowserTabGroupMetadata();
    savedTabGroupMetadata.upsertRecord('タブグループ1', 2);
    savedTabGroupMetadata.upsertRecord('タブグループ2', 1);
    savedTabGroupMetadata.upsertRecord(targetTabGroupName, 1);
    mockGetTabGroupMetadataFromSyncStorage.mockResolvedValue(
      savedTabGroupMetadata,
    );
    // タブを取得
    const mockGetTabsInTabGroup = jest.spyOn(tabGroups, 'getTabsInTabGroup');
    const testTabs = createTabs();
    mockGetTabsInTabGroup.mockResolvedValue(testTabs);
    // 拡張機能オプション取得
    const mockGetExtensionOptions = jest.spyOn(options, 'getExtensionOptions');
    const extensionOptions = {
      reloadOnHighlight: false,
      overwriteTabGroup: false, // マージして保存
    };
    mockGetExtensionOptions.mockResolvedValue(extensionOptions);
    // 保存されているタブグループの内容を取得する
    const mockGetTabGroupValueFromSyncStorage = jest.spyOn(
      storage,
      'getTabGroupValueFromSyncStorage',
    );
    // 保存されているタブグループの内容
    const savedTabGroup = new BrowserTabGroup({
      id: 999,
      collapsed: false,
      color: 'green',
      title: targetTabGroupName,
      windowId: 1,
    });
    const savedTabs = [testTabs[testTabs.length - 1]];
    savedTabGroup.setTabs(savedTabs);
    mockGetTabGroupValueFromSyncStorage.mockResolvedValue(savedTabGroup);
    // タブのマージ
    const mockMergeTabs = jest.spyOn(tabGroups, 'mergeTabs');
    const mergedTabs = createMergedTabs();
    mockMergeTabs.mockReturnValue(mergedTabs);
    // タブグループ保存
    const mockSetTabGroupValueToSyncStorage = jest.spyOn(
      storage,
      'saveTabGroupValueToSyncStorage',
    );
    const savedItemCount = 3;
    mockSetTabGroupValueToSyncStorage.mockResolvedValue(savedItemCount);
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
      title: targetTabGroupName,
      windowId: 1,
    });
    await tabGroups.saveTabGroup(targetTabGroup);

    // assert
    // タブグループのメタデータを取得しているはず
    expect(mockGetTabGroupMetadataFromSyncStorage).toHaveBeenCalled();
    // タブのマージが行われる
    expect(mockMergeTabs).toHaveBeenCalledWith(testTabs, savedTabs);
    targetTabGroup.setTabs(mergedTabs); // タブマージ後のタブグループ
    // タイトルをキーにしてストレージに保存しているはず
    expect(mockSetTabGroupValueToSyncStorage).toHaveBeenCalledWith(
      targetTabGroup,
    );
    // タブグループのメタデータを更新して保存しているはず
    expect(mockSetTabGroupMetadataToSyncStorage).toHaveBeenCalledTimes(1);
    // メタデータにストレージの項目数が保存されているはず
    const metadataRecord = savedTabGroupMetadata.getRecord(
      targetTabGroup.title!,
    );
    expect(metadataRecord).not.toBeNull();
    expect(metadataRecord!.count).toEqual(savedItemCount);
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

// describe('mergeTabs', () => {
//   test('正常系：同じURLをもつタブが存在しない場合', () => {
//     // setup
//     const tabList1 = createTabs();
//     const tabList2 = [
//       {
//         id: 4,
//         index: 2,
//         windowId: 2,
//         groupId: 2,
//         title: 'タブ4',
//         url: 'https://example.com/4',
//         active: true,
//         highlighted: true,
//         pinned: false,
//         discarded: false,
//         incognito: false,
//       },
//       {
//         id: 1,
//         index: 0,
//         windowId: 1,
//         groupId: 1,
//         title: 'タブ5',
//         url: 'https://example.com/5',
//         active: true,
//         highlighted: true,
//         pinned: false,
//         discarded: false,
//         incognito: false,
//       },
//     ];
//     // execute
//     const result = tabGroups.mergeTabs(tabList1, tabList2);
//     // assert
//     expect(result.length).toEqual(tabList1.length + tabList2.length);
//     expect(result).toEqual([...tabList1, ...tabList2]);
//   });

//   test('正常系：同じURLを持つタブが存在する場合', () => {
//     // setup
//     const tabList1 = createTabs();
//     const tabList2 = [
//       {
//         id: 4,
//         index: 2,
//         windowId: 2,
//         groupId: 2,
//         title: 'タブ4',
//         url: 'https://example.com/4',
//         active: true,
//         highlighted: true,
//         pinned: false,
//         discarded: false,
//         incognito: false,
//       },
//       {
//         id: 1,
//         index: 0,
//         windowId: 1,
//         groupId: 1,
//         title: 'タブ1111',
//         url: 'https://example.com/1',
//         active: true,
//         highlighted: true,
//         pinned: false,
//         discarded: false,
//         incognito: false,
//       },
//     ];
//     // execute
//     const result = tabGroups.mergeTabs(tabList1, tabList2);
//     // assert
//     expect(result.length).toEqual(tabList1.length + tabList2.length - 1);
//     // tabList2 の内容で上書きされているはず
//     expect(result).toEqual([tabList1[1], tabList1[2], ...tabList2]);
//   });
// });
