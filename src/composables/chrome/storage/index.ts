import {
  BrowserTabGroup,
  BrowserTabGroupDto,
  BrowserTabGroupMetadata,
} from '../../../types';

/**
 * タブグループのメタデータを Storage に保存する際のキー
 */
const TAG_GROUP_METADATA_KEY = 'TAG_GROUP_METADATA';

/**
 * タブグループを Storage に保存する際のキーのプレフィックス
 */
const TAG_GROUP_KEY_PREFIX = 'TAG_GROUP_';

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
 * @param tabGroup タブグループ
 */
export const setTabGroupValueToSyncStorage = async (
  key: string,
  tabGroup: BrowserTabGroup,
): Promise<void> => {
  console.debug(
    `setTabGroupValueToSyncStorage called! [key: ${key}, group: ${tabGroup}]`,
  );
  const dto = new BrowserTabGroupDto(tabGroup);
  key = TAG_GROUP_KEY_PREFIX + key;
  await chrome.storage.sync.set({ [key]: dto });
};

/**
 * キーを指定してストレージからタブグループを取得する
 * @param key キー（タブグループ名）
 * @returns タブグループ
 */
export const getTabGroupValueFromSyncStorage = async (
  key: string,
): Promise<BrowserTabGroup | null> => {
  console.debug(`getTabGroupValueFromSyncStorage called! [key: ${key}]`);
  key = TAG_GROUP_KEY_PREFIX + key;
  const result = await chrome.storage.sync.get(key);
  const dto = result[key] as BrowserTabGroupDto;
  if (!dto) {
    // キーが存在しない場合は空のオブジェクトを返す
    return null;
  }
  return BrowserTabGroup.fromDto(dto);
};
