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
