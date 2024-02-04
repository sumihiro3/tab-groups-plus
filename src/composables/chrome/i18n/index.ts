/**
 * i18nメッセージを取得する
 * @param messageName メッセージ名
 * @param substitutions メッセージテンプレート内の置き換え文字列
 */
export const getI18nMessage = (
  messageName: string,
  substitutions?: string | string[],
): string => {
  console.debug(`getI18nMessage called! [messageName: ${messageName}]`);
  return chrome.i18n.getMessage(messageName, substitutions);
};
