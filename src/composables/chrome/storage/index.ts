import {
  BrowserTabGroup,
  BrowserTabGroupDtoForStore,
  BrowserTabGroupMetadata,
  BrowserTabGroupMetadataRecord,
  StoredBrowserTabGroup,
} from '../../../types';
import {
  TabGroupStorageCapacityExceededError,
  TabGroupsCompressError,
  TabGroupsSaveError,
} from '../../../types/errors';
import { byteCountFor } from '../../compress';

/**
 * タブグループのメタデータを Storage に保存する際のキー
 */
const TAG_GROUP_METADATA_KEY = 'TAG_GROUP_METADATA';

/**
 * タブグループを Storage に保存する際のキーのプレフィックス
 */
const TAG_GROUP_KEY_PREFIX = 'TAG_GROUP_';

/**
 * 一つのタブグループの保存に利用できる最大ストレージ項目数
 */
const MAX_ITEM_COUNT_PER_GROUP = 20;

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
    const obj = result[TAG_GROUP_METADATA_KEY];
    const records = obj as BrowserTabGroupMetadataRecord[];
    let tabGroupMetadata: BrowserTabGroupMetadata;
    if (!records) {
      // タブグループレコードが存在しない場合は空のオブジェクトを返す
      tabGroupMetadata = new BrowserTabGroupMetadata();
    } else {
      tabGroupMetadata = BrowserTabGroupMetadata.fromRecords(records);
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
    [TAG_GROUP_METADATA_KEY]: tabGroupMetadata.getRecords(),
  });
};

/**
 * キーを指定してストレージからタブグループに保存する
 * @param tabGroup タブグループ
 * @return 保存に利用したストレージの項目数
 */
export const saveTabGroupValueToSyncStorage = async (
  tabGroup: BrowserTabGroup,
): Promise<number> => {
  console.debug(`setTabGroupValueToSyncStorage called! [group: ${tabGroup}]`);
  try {
    const dto = new BrowserTabGroupDtoForStore(tabGroup);
    // タブグループ内容を sync ストレージに収まるサイズに分割して保存する
    // - 文字列にして圧縮する
    const compressedString = await dto.compress();
    const byteCount = byteCountFor(compressedString);
    console.debug(`圧縮後の文字列のバイト数: ${byteCount}`);
    // 圧縮文字列を分割する
    // - 1つのタブグループのサイズは 8KB まで
    const splittedString = compressedString.match(/.{1,8000}/g);
    if (!splittedString) {
      // 圧縮文字列が分割できなかった場合はエラーを投げる
      console.error(`タブグループの圧縮処理ができませんでした`);
      throw new TabGroupsCompressError(
        '保存するタブグループの圧縮処理に失敗しました',
      );
    }
    const length = splittedString.length;
    console.debug(`分割後の文字列の数: ${length}`);
    if (length > MAX_ITEM_COUNT_PER_GROUP) {
      // 保存に利用するストレージの項目数が上限を超えた場合はエラーを投げる
      const errorMessage = `タブグループ保存最大サイズを超過しました`;
      console.error(
        `${errorMessage} [length: ${length}] [byteCount: ${byteCount}]`,
      );
      throw new TabGroupStorageCapacityExceededError(errorMessage);
    }
    // 文字列を分割して保存する
    for (const [index, str] of splittedString?.entries()) {
      const key = generateStorageKey(tabGroup.title!, index);
      await chrome.storage.sync.set({ [key]: str });
    }
    // 保存に利用したストレージの項目数を返す
    return length;
  } catch (error) {
    console.error(`タブグループ保存時にエラーが発生しました`);
    if (error instanceof Error) {
      console.error(error.message);
      console.error(error.stack);
    }
    throw new TabGroupsSaveError('タブグループ保存時にエラーが発生しました', {
      cause: error,
    });
  }
};

/**
 * ストレージのキー文字列を生成する
 * @param tabGroupName タブグループ名
 * @param count 保存にするストレージ順番
 * @return ストレージのキー文字列
 */
const generateStorageKey = (tabGroupName: string, count: number): string => {
  return `${TAG_GROUP_KEY_PREFIX}${tabGroupName}_${count}`;
};

/**
 * タブグループ名を指定してストレージからタブグループを取得する
 * @param tabGroupName タブグループ名
 * @param count 保存に利用されているストレージ項目数
 * @returns タブグループ
 */
export const getTabGroupValueFromSyncStorage = async (
  tabGroupName: string,
  count: number = 1,
): Promise<StoredBrowserTabGroup | null> => {
  console.debug(
    `getTabGroupValueFromSyncStorage called! [tabGroupName: ${tabGroupName}, count: ${count}]`,
  );
  const compressedStringList: string[] = [];
  // ストレージ項目から圧縮文字列を取得する
  for (let i = 0; i < count; i++) {
    const key = generateStorageKey(tabGroupName, i);
    console.debug(`key: ${key}`);
    const result = await chrome.storage.sync.get(key);
    const compressedString = result[key];
    if (!compressedString) {
      // キーが存在しない場合は null を返す
      return null;
    }
    compressedStringList.push(compressedString);
  }
  // 圧縮文字列から BrowserTabGroupDto を復元する
  const dto = await decompress(compressedStringList);
  const group = StoredBrowserTabGroup.fromDto(dto);
  return group;
};

/**
 * 圧縮文字列から BrowserTabGroupDto を復元する
 * @param compressed 圧縮文字列
 */
export const decompress = async (
  compressedStringList: string[],
): Promise<BrowserTabGroupDtoForStore> => {
  console.debug(`decompress called!`);
  // 圧縮文字列を結合する
  const compressedString = compressedStringList.join('');
  const dto = await BrowserTabGroupDtoForStore.decompress(compressedString);
  return dto;
};

/**
 * 指定の保存されたタブグループを削除する
 * @param tabGroup タブグループ
 */
export const removeTabGroup = async (
  tabGroup: BrowserTabGroup,
): Promise<void> => {
  console.debug(`removeTabGroup called! [tabGroup: ${tabGroup.title!}]`);
  // タブグループのメタデータを取得する
  const tabGroupMetadata = await getTabGroupMetadataFromSyncStorage();
  const record = tabGroupMetadata.getRecord(tabGroup.title!);
  if (!record) {
    // タブグループのメタデータが存在しない場合は何もしない
    return;
  }
  // タブグループの保存された内容を削除する
  for (let i = 0; i < record.count; i++) {
    const key = generateStorageKey(tabGroup.title!, i);
    await chrome.storage.sync.remove(key);
  }
  // タブグループのメタデータからタブグループ名を削除する
  tabGroupMetadata.removeRecord(tabGroup.title!);
  await setTabGroupMetadataToSyncStorage(tabGroupMetadata);
};
