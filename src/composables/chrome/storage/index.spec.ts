import {
  BrowserTab,
  BrowserTabGroup,
  BrowserTabGroupDtoForStore,
} from '../../../types';
import {
  getBooleanValueFromSyncStorage,
  getTabGroupValueFromSyncStorage,
} from './index';
import * as storage from './index';

/**
 * テスト用のタブグループを作成する
 */
const createTabGroup = (): BrowserTabGroup => {
  const group = new BrowserTabGroup({
    id: 1,
    collapsed: false,
    color: 'red',
    title: 'TabGroup1',
    windowId: 1,
  });
  const tabs: BrowserTab[] = [
    new BrowserTab({
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
      selected: true,
      autoDiscardable: false,
    }),
    new BrowserTab({
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
      selected: true,
      autoDiscardable: false,
    }),
  ];
  group.setTabs(tabs);
  return group;
};

/**
 * chrome.storage.sync.get のモックを作成する
 */
const createChromeStorageSyncGetMock = () => {
  return jest.spyOn(chrome.storage.sync, 'get') as jest.SpyInstance<
    | Promise<{
        [key: string]: any;
      }>
    | undefined
  >;
};

afterEach(() => {
  jest.clearAllMocks();
});

describe('getBooleanValueFromSyncStorage', () => {
  test('正常系：true が設定されている', async () => {
    const res: object = { reloadOnHighlight: true };
    const mock = createChromeStorageSyncGetMock();
    mock.mockResolvedValue(res);
    const result = await getBooleanValueFromSyncStorage('reloadOnHighlight');
    expect(result).toBe(true);
  });

  test('正常系：false が設定されている', async () => {
    const res: object = { reloadOnHighlight: false };
    const mock = createChromeStorageSyncGetMock();
    mock.mockResolvedValue(res);
    const result = await getBooleanValueFromSyncStorage('reloadOnHighlight');
    expect(result).toBe(false);
  });

  test('正常系：項目が設定されていない場合は false が返る', async () => {
    const res: object = { reloadOnHighlight: false };
    const mock = createChromeStorageSyncGetMock();
    mock.mockResolvedValue(res);
    const result = await getBooleanValueFromSyncStorage('notDefined');
    expect(result).toBe(false);
  });
});

describe('getTabGroupValueFromSyncStorage', () => {
  test('正常系：指定のキーに保存されている場合', async () => {
    // setup mock
    const tabGroup = createTabGroup();
    const tabGroupName = tabGroup.title!;
    const tabDto = new BrowserTabGroupDtoForStore(tabGroup);
    const mock = createChromeStorageSyncGetMock();
    mock.mockResolvedValue({
      TAG_GROUP_TabGroup1_0: 'some-compressed-string-1',
      TAG_GROUP_TabGroup1_1: 'some-compressed-string-2',
    });
    // 圧縮文字列からの復元をモックする
    const mockDecompress = jest.spyOn(storage, 'decompress');
    mockDecompress.mockResolvedValue(tabDto);

    // execute
    const result = await getTabGroupValueFromSyncStorage(tabGroupName, 2);

    // assert
    expect(mock).toHaveBeenCalledTimes(2);
    expect(result).not.toBeNull();
    expect(result).not.toBeUndefined();
    expect(result).toBeInstanceOf(BrowserTabGroup);
    expect(result!.title).toBe(tabGroupName);
    expect(result!.color).toBe(tabGroup.color);
    expect(result!.tabs?.length).toBe(tabGroup.tabs?.length);
    expect(result!.tabs?.[0]).toBeInstanceOf(BrowserTab);
    expect(result!.tabs?.[0].title).toBe(tabGroup.tabs?.[0].title);
    expect(result!.tabs?.[0].url).toBe(tabGroup.tabs?.[0].url);
    expect(result!.tabs?.[1]).toBeInstanceOf(BrowserTab);
    expect(result!.tabs?.[1].title).toBe(tabGroup.tabs?.[1].title);
    expect(result!.tabs?.[1].url).toBe(tabGroup.tabs?.[1].url);
  });

  test('正常系：指定のキーに保存されていない場合（保存項目数を省略）', async () => {
    // setup mock
    const tabGroupName = `notStored`;
    const mock = createChromeStorageSyncGetMock();
    mock.mockResolvedValue([]);

    // execute
    const result = await getTabGroupValueFromSyncStorage(tabGroupName);

    // assert
    const key = `TAG_GROUP_${tabGroupName}_0`;
    expect(mock).toHaveBeenCalledWith(key);
    expect(result).toBeNull(); // null が返るはず
  });

  test('正常系：指定のキーに保存されていない場合（保存項目数を指定）', async () => {
    // setup mock
    const tabGroupName = `notStored`;
    const mock = createChromeStorageSyncGetMock();
    mock.mockResolvedValue([]);

    // execute
    const result = await getTabGroupValueFromSyncStorage(tabGroupName, 2);

    // assert
    const key = `TAG_GROUP_${tabGroupName}_0`;
    expect(mock).toHaveBeenCalledWith(key);
    expect(result).toBeNull(); // null が返るはず
  });
});
