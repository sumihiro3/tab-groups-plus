import {
  isOpenedBrowserTabGroup,
  isStoredBrowserTabGroup,
  isUnGroupedBrowserTabGroup,
} from '.';
import {
  BrowserTabGroup,
  StoredBrowserTabGroup,
  UnGroupedTabs,
} from '../../../types';

describe('Test suite', () => {
  describe('isOpenedBrowserTabGroup', () => {
    test('正常系：ブラウザーで開かれているタブグループ', () => {
      // setup
      const group = createBrowserTabGroup();

      // execute
      const result = isOpenedBrowserTabGroup(group);

      // verify
      expect(result).toBe(true);
    });

    test('正常系：保存されているタブグループの場合', () => {
      // setup
      const group = createStoredBrowserTabGroup();

      // execute
      const result = isOpenedBrowserTabGroup(group);

      // verify
      expect(result).toBe(false);
    });

    test('正常系：未分類のタブグループの場合', () => {
      // setup
      const group = createUnGroupedBrowserTabGroup();

      // execute
      const result = isOpenedBrowserTabGroup(group);

      // verify
      expect(result).toBe(false);
    });
  });

  describe('isStoredBrowserTabGroup', () => {
    test('正常系', () => {
      // setup
      const group = createStoredBrowserTabGroup();

      // execute
      const result = isStoredBrowserTabGroup(group);

      // verify
      expect(result).toBe(true);
    });

    test('正常系：保存されているタブグループではない場合', () => {
      // setup
      const group = createBrowserTabGroup();

      // execute
      const result = isStoredBrowserTabGroup(group);

      // verify
      expect(result).toBe(false);
    });

    test('正常系：未分類のタブグループの場合', () => {
      // setup
      const group = createUnGroupedBrowserTabGroup();

      // execute
      const result = isStoredBrowserTabGroup(group);

      // verify
      expect(result).toBe(false);
    });
  });

  describe('isUnGroupedBrowserTabGroup', () => {
    test('正常系', () => {
      // setup
      const group = createUnGroupedBrowserTabGroup();

      // execute
      const result = isUnGroupedBrowserTabGroup(group);

      // verify
      expect(result).toBe(true);
    });

    test('正常系：ブラウザーで開かれているタブグループの場合', () => {
      // setup
      const group = createBrowserTabGroup();

      // execute
      const result = isUnGroupedBrowserTabGroup(group);

      // verify
      expect(result).toBe(false);
    });

    test('正常系：保存されているタブグループの場合', () => {
      // setup
      const group = createStoredBrowserTabGroup();

      // execute
      const result = isUnGroupedBrowserTabGroup(group);

      // verify
      expect(result).toBe(false);
    });
  });
});
/**
 * テスト用のタブグループを作成する
 * @returns BrowserTabGroup
 */
function createBrowserTabGroup() {
  return new BrowserTabGroup({
    id: 1,
    title: 'タブグループ',
    color: 'red',
    collapsed: false,
    windowId: 1,
  });
}

/**
 * テスト用の保存されたタブグループを作成する
 * @returns StoredBrowserTabGroup
 */
function createStoredBrowserTabGroup() {
  return new StoredBrowserTabGroup({
    id: 1,
    title: 'タブグループ',
    color: 'red',
    collapsed: false,
    windowId: 1,
  });
}

/**
 * テスト用の未分類のタブグループを作成する
 * @returns UnGroupedTabs
 */
function createUnGroupedBrowserTabGroup() {
  return new UnGroupedTabs();
}
