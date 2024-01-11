/**
 * 最大幅で表示するためのプレースホルダーの文字列を返す
 */
export const marginText = (displayText: string, maxLength: number) => {
  const length = displayText.length;
  if (length >= maxLength) {
    return '';
  }
  const margin = maxLength - length;
  return '-'.repeat(margin);
};
