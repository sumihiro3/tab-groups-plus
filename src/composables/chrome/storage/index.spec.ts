import { getBooleanValueFromSyncStorage } from './index';

// jest.spyOn(chrome.tabs, 'query').mockResolvedValue([
//   {
//     id: 3,
//     active: true,
//     windowId: 1,
//     index: 5,
//     pinned: false,
//     highlighted: true,
//     incognito: false,
//     discarded: false,
//     autoDiscardable: false,
//     selected: true,
//     groupId: -1,
//   },
// ]);

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
