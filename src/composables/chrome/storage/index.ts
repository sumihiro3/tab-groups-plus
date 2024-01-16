import { BrowserTabGroup, BrowserTabGroupMetadata } from '../../../types';

const TAG_GROUP_METADATA_KEY = 'TAG_GROUP_METADATA';

/**
 * キーを指定してストレージから Boolean 値を取得する
 * @param key キー
 * @returns Boolean 値
 */
export const getBooleanValueFromSyncStorage = async (
  key: string,
): Promise<boolean> => {
  console.debug(`getBooleanValueFromSyncStorage called! [key: ${key}]`);
  const result = await chrome.storage.sync.get(key);
  let value = result[key];
  if (value === undefined) {
    // 指定されたキーが存在しない場合は false を返す
    value = false;
  }
  return value;
};

/**
 * キーを指定してストレージに Boolean 値をセットする
 * @param key キー
 * @param value セットする Boolean 値
 */
export const setBooleanValueToSyncStorage = async (
  key: string,
  value: boolean,
): Promise<void> => {
  console.debug(
    `setBooleanValueToSyncStorage called! [key: ${key}, value: ${value}]`,
  );
  await chrome.storage.sync.set({ [key]: value });
};

/**
 * どのようなタブグループが保存されているかを表すメタデータオブジェクトを取得する
 */
export const getTabGroupMetadataFromSyncStorage =
  async (): Promise<BrowserTabGroupMetadata> => {
    console.debug('getTabGroupMetadataFromSyncStorage called!');
    const result = await chrome.storage.sync.get(TAG_GROUP_METADATA_KEY);
    let tabGroupMetadata = result[TAG_GROUP_METADATA_KEY];
    if (!tabGroupMetadata) {
      // キーが存在しない場合は空のオブジェクトを返す
      tabGroupMetadata = {
        titleList: [],
      };
    }
    return tabGroupMetadata;
  };

/**
 * どのようなタブグループが保存されているかを表すメタデータオブジェクトをストレージに保存する
 */
export const setTabGroupMetadataToSyncStorage = async (
  tabGroupMetadata: BrowserTabGroupMetadata,
): Promise<void> => {
  console.debug(
    `setTabGroupMetadataToSyncStorage called! [tabGroupMetadata: ${JSON.stringify(
      tabGroupMetadata,
    )}]`,
  );
  await chrome.storage.sync.set({
    [TAG_GROUP_METADATA_KEY]: tabGroupMetadata,
  });
};

/**
 * キーを指定してストレージからタブグループに保存する
 * @param key キー（タブグループ名）
 * @param value タブグループ
 */
export const setTabGroupValueToSyncStorage = async (
  key: string,
  value: BrowserTabGroup,
): Promise<void> => {
  console.debug(
    `setTabGroupValueToSyncStorage called! [key: ${key}, value: ${value}]`,
  );
  await chrome.storage.sync.set({ [key]: value });
};
