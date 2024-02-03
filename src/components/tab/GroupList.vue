<template>
  <!-- Snackbar -->
  <SnackbarView :snackbar="showSnackbar" />
  <v-list
    :lines="false"
    :opened="props.expandTabGroupList"
    open-strategy="multiple"
    density="compact"
    max-height="400"
    class="overflow-y-auto"
  >
    <!-- Tab groups -->
    <TabGroupListItem
      v-for="tabGroup in currentTabGroups"
      :key="tabGroup.displayIndex"
      :id="getTabGroupListItemElementId(tabGroup)"
      :tabGroup="tabGroup"
      :active="
        activeListItemElementId === getTabGroupListItemElementId(tabGroup)
      "
      @selectToOpenTabGroup="onSelectedTabGroupToOpen"
      @selectToCloseTabGroup="onSelectedTabGroupToClose"
      @selectToSaveTabGroup="onSelectedTabGroupToSave"
      @selectToDeleteTabGroup="onSelectedTabGroupToDelete"
    >
      <!-- Tabs in tab groups -->
      <TabListItem
        v-for="tab in tabGroup.tabs"
        :key="tab.displayIndex"
        :id="getTabListItemElementId(tabGroup, tab)"
        :tabGroup="tabGroup"
        :tab="tab"
        :active="
          activeListItemElementId === getTabListItemElementId(tabGroup, tab)
        "
        @selectTabToOpen="onSelectedTabToOpen"
        @selectTabToClose="onSelectedTabToClose"
      />
    </TabGroupListItem>
  </v-list>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  BrowserTab,
  BrowserTabGroup,
  StoredBrowserTabGroup,
  Snackbar,
} from '../../types';
import TabGroupListItem from '../../components/tab/GroupListItem.vue';
import TabListItem from '../../components/tab/ListItem.vue';
import SnackbarView from '../../components/Snackbar.vue';
import {
  closeTabGroup,
  highlightTab,
  highlightTabGroup,
  isOpenedBrowserTabGroup,
  isStoredBrowserTabGroup,
  removeTabGroup,
  restoreTabGroup,
  saveTabGroup,
  closeTab,
  isUnGroupedBrowserTabGroup,
} from '../../composables/chrome';

const props = defineProps({
  /** リストへ表示するタブグループ */
  tabGroups: Array as () => BrowserTabGroup[],
  expandTabGroupList: Array as () => string[],
});

/** 親コンポーネントへの Emit */
const emit = defineEmits<{
  /**
   * リスト中でアクティブになったアイテムが変更された時のイベント
   */
  (event: 'onChangedActiveListItem'): void;

  /**
   * リスト内のアイテム（タブグループまたはタブ）に変更があった時のイベント
   */
  (event: 'onChangedListItem'): void;
}>();

const { tm } = useI18n({ useScope: 'global' });

/**
 * リストに表示するタブグループ一覧
 */
const currentTabGroups = ref<BrowserTabGroup[]>(props.tabGroups!);

/**
 * スナックバー表示用オブジェクト
 */
const showSnackbar = ref<Snackbar | undefined>();

/**
 * リストに表示されるアイテム一覧
 */
const listItems = ref<Array<BrowserTabGroup | BrowserTab>>([]);

/**
 * アクティブなアイテム一覧中の位置
 */
const activeListItemIndex = ref<number>(0);

/**
 * アクティブ（カーソルが合っている）状態のタブグループまたは、アクティブなタブが属するタブグループ
 */
const activeTabGroup = ref<BrowserTabGroup>();

/**
 * アクティブ（カーソルが合っている）状態のタブ
 */
const activeTab = ref<BrowserTab>();

/**
 * アクティブなリストアイテムのID
 */
const activeListItemElementId = ref<string>();

onMounted(() => {
  console.debug(`TabGroupListItem.onMounted called!`);
  // キーが押された時のイベントを登録
  document.addEventListener('keydown', keyDownEventHandler);
});

/**
 * プロパティ [tabGroups] の変更を監視する
 */
watch(
  () => props.tabGroups,
  () => {
    console.debug(`watch [props.tabGroups] called!`);
    currentTabGroups.value = props.tabGroups!;
    updateDisplayIndexOfListItems();
    // 最初のアイテム（タブグループ）をアクティブにする
    setActiveToSelectedListGroupItem(0);
  },
);

/**
 * リストで選択されているアイテムを取得する
 * @returns リストで選択されているアイテム（タブグループまたはタブ）
 */
const selectedListItem = computed((): BrowserTabGroup | BrowserTab => {
  return listItems.value[activeListItemIndex.value];
});

/**
 * キーが押された時のイベントハンドラー
 * @param e キーイベント
 */
const keyDownEventHandler = (e: KeyboardEvent) => {
  if (e.isComposing || e.key === 'Process' || e.keyCode === 229) {
    // IME入力中は無視する
    return;
  }
  if (e.shiftKey && e.key === 'Enter') {
    onShiftEnterKeyPressed();
    // タブグループが選択されていた場合、Shift + Enter でタブグループを保存する
    // onTabGroupSelectToSave(selectedTabGroupIndex.value);
  } else if (e.key === 'ArrowDown') {
    onDownKeyPressed();
  } else if (e.key === 'ArrowUp') {
    onUpKeyPressed();
  } else if (e.key === 'Enter') {
    onEnterKeyPressed();
  }
};

/**
 * 上キーが押された時の処理
 */
const onUpKeyPressed = () => {
  console.debug('onUpKeyPressed called!');
  if (activeListItemIndex.value === 0) {
    // 最初のアイテムがアクティブであった場合は、最後のアイテムをアクティブにする
    activeListItemIndex.value = listItems.value.length - 1;
  } else {
    // それ以外の場合は、一つ前のアイテムをアクティブにする
    activeListItemIndex.value = activeListItemIndex.value - 1;
  }
  setActiveToSelectedListGroupItem(activeListItemIndex.value);
};

/**
 * 下キーが押された時の処理
 */
const onDownKeyPressed = () => {
  console.debug('onDownKeyPressed called!');
  if (activeListItemIndex.value === listItems.value.length - 1) {
    // 最後のアイテムがアクティブであった場合は、最初のアイテムをアクティブにする
    activeListItemIndex.value = 0;
  } else {
    // それ以外の場合は、一つ後のアイテムをアクティブにする
    activeListItemIndex.value++;
  }
  setActiveToSelectedListGroupItem(activeListItemIndex.value);
};

/**
 * Enterキーが押された時の処理
 */
const onEnterKeyPressed = async () => {
  console.debug('onEnterKeyPressed called!');
  const item = selectedListItem.value;
  if (item instanceof BrowserTabGroup) {
    // タブグループが選択されている場合
    await onSelectedTabGroupToOpen(item);
  } else if (item instanceof BrowserTab) {
    // タブが選択されている場合
    await onSelectedTabToOpen(activeTabGroup.value!, item);
  }
};

/**
 * Shift + Enter キーが押された時の処理
 */
const onShiftEnterKeyPressed = () => {
  console.debug('onShiftEnterKeyPressed called!');
  const item = selectedListItem.value;
  // 選択されたアイテムがタブグループである場合のみ処理する
  if (item instanceof BrowserTabGroup) {
    // タブグループを保存する
    onSelectedTabGroupToSave(item);
  }
};

/**
 * 成功のスナックバーを表示する
 * @param message スナックバーに表示するメッセージ
 */
const showSuccessSnackbar = (message: string) => {
  showSnackbar.value = {
    show: true,
    timeout: 3000,
    color: 'success',
    message,
  };
};

/**
 * エラーのスナックバーを表示する
 * @param message スナックバーに表示するメッセージ
 */
const showErrorSnackbar = (message: string) => {
  showSnackbar.value = {
    show: true,
    timeout: 3000,
    color: 'error',
    message,
  };
};

/**
 * リストに表示するアイテムの表示位置を更新する
 */
const updateDisplayIndexOfListItems = () => {
  const items = [];
  // リストに表示するアイテム一覧を作成
  for (const g of currentTabGroups.value!) {
    items.push(g);
    if (g.tabs && g.tabs.length > 0) {
      for (const t of g.tabs) {
        items.push(t);
      }
    }
  }
  listItems.value = items;
  // リストに表示するタブグループとタブの表示位置を設定する
  for (const [i, tabGroup] of currentTabGroups.value.entries()) {
    tabGroup.setDisplayIndex(i);
    if (tabGroup.tabs && tabGroup.tabs.length > 0) {
      for (const [j, tab] of tabGroup.tabs.entries()) {
        tab.setDisplayIndex(j);
        tab.setGroupDisplayIndex(i);
      }
    }
  }
};

/**
 * アクティブになったリストアイテムを設定する
 * @param nextIndex アクティブになったリストアイテムのインデックス
 */
const setActiveListItem = (nextIndex: number) => {
  console.debug(`setActiveListItem called! [nextIndex: ${nextIndex}]`);
  activeListItemIndex.value = nextIndex;
  const item = listItems.value[nextIndex];
  if (item instanceof BrowserTabGroup) {
    // アクティブになったアイテムがタブグループの場合
    // そのタブグループ設定し、タブは未設定にする
    activeTabGroup.value = item;
    activeTab.value = undefined;
  } else if (item instanceof BrowserTab) {
    // アクティブになったアイテムがタブの場合は、そのタブとタブグループを設定する
    activeTab.value = item;
    activeTabGroup.value = currentTabGroups.value[item.tabGroupDisplayIndex!];
  }
  return { activeTabGroup: activeTabGroup.value, activeTab: activeTab.value };
};

/**
 * 選択されたリストアイテムをアクティブ状態（カーソルが合っている）にする
 * @param index アクティブにするリストアイテムのインデックス
 */
const setActiveToSelectedListGroupItem = (index: number) => {
  console.debug(`setFocusToSelectedTabGroupItem called! [index: ${index}]`);
  const { activeTabGroup, activeTab } = setActiveListItem(index);
  let elementId = '';
  if (activeTab && activeTabGroup) {
    // アクティブになったアイテムがタブの場合はタブの id を取得する
    elementId = getTabListItemElementId(activeTabGroup, activeTab);
  } else if (!activeTab && activeTabGroup) {
    // アクティブになったアイテムがタブグループの場合はタブグループの id を取得する
    elementId = getTabGroupListItemElementId(activeTabGroup);
  }
  activeListItemElementId.value = elementId;
  console.debug(
    `Active list item changed [elementId: ${activeListItemElementId.value}]`,
  );
  // アクティブになった要素をフォーカスする
  window.location.hash = `#${elementId}`;
  // 親コンポーネントへアクティブになったアイテムが更新されたことを通知する
  emit('onChangedActiveListItem');
};

/**
 * TabGroupListItem 要素の id を取得する
 */
const getTabGroupListItemElementId = (tabGroup: BrowserTabGroup) => {
  return `tab-group-${tabGroup.displayIndex}`;
};

/**
 * TabListItem 要素の id を取得する
 */
const getTabListItemElementId = (
  tabGroup: BrowserTabGroup,
  tab: BrowserTab,
) => {
  return `tab-${tabGroup.displayIndex}-${tab.displayIndex}`;
};

/**
 * タブグループを開くために選択された時のイベントハンドラー
 * @param tabGroup タブグループ
 */
const onSelectedTabGroupToOpen = async (tabGroup: BrowserTabGroup) => {
  console.debug(
    `onSelectedTabGroupToOpen called! [tabGroup: ${tabGroup.title}]`,
  );
  if (isStoredBrowserTabGroup(tabGroup)) {
    // ストレージに保存されているタブグループの場合
    // 保存状態からブラウザーにタブグループを復元する
    console.debug(`StoredBrowserTabGroup selected! [title: ${tabGroup.title}]`);
    const restored = await restoreTabGroup(tabGroup);
    if (restored) {
      await highlightTabGroup(restored);
    }
    // ポップアップを閉じる
    window.close();
  } else if (isOpenedBrowserTabGroup(tabGroup)) {
    // 選択されたグループのタブをハイライトする
    await highlightTabGroup(tabGroup);
    // ポップアップを閉じる
    window.close();
  }
};

/**
 * タブグループを閉じるために選択された時のイベントハンドラー
 * @param tabGroup タブグループ
 */
const onSelectedTabGroupToClose = async (tabGroup: BrowserTabGroup) => {
  console.debug(
    `onSelectedTabGroupToClose called! [tabGroup: ${tabGroup.title}]`,
  );
  if (isOpenedBrowserTabGroup(tabGroup)) {
    // 選択されたグループのタブを閉じる
    await closeTabGroup(tabGroup);
  }
  // ポップアップを閉じる
  window.close();
};

/**
 * タブグループを保存するために選択された時のイベントハンドラー
 * @param tabGroup タブグループ
 */
const onSelectedTabGroupToSave = async (tabGroup: BrowserTabGroup) => {
  console.debug(
    `onSelectedTabGroupToSave called! [tabGroup: ${tabGroup.title}]`,
  );
  try {
    if (isOpenedBrowserTabGroup(tabGroup)) {
      // 開かれているタブグループであれば、その状態を保存する
      // タブグループを保存する
      await saveTabGroup(tabGroup);
      // タブグループを閉じる
      await closeTabGroup(tabGroup);
      // 完了のスナックバーを表示する
      showSuccessSnackbar(tm('tabGroups.saved'));
      // 親コンポーネントへアイテムが更新されたことを通知する
      emit('onChangedListItem');
    }
  } catch (error) {
    console.error(`タブグループの保存に失敗しました: ${error}`);
    // エラーのスナックバーを表示する
    showErrorSnackbar(tm('tabGroups.save_failed'));
  }
};

/**
 * タブグループを削除するために選択された時のイベントハンドラー
 * @param tabGroup タブグループ
 */
const onSelectedTabGroupToDelete = async (tabGroup: BrowserTabGroup) => {
  console.debug(
    `onSelectedTabGroupToDelete called! [tabGroup: ${tabGroup.title}]`,
  );
  try {
    if (isStoredBrowserTabGroup(tabGroup)) {
      // 保存されたタブグループであれば、ストレージから削除する
      // ストレージからタブグループを削除する
      removeTabGroup(tabGroup);
      // 完了のスナックバーを表示する
      showSuccessSnackbar(tm('tabGroups.deleted'));
      // 親コンポーネントへアイテムが更新されたことを通知する
      emit('onChangedListItem');
    }
  } catch (error) {
    console.error(`タブグループの削除に失敗しました: ${error}`);
    // エラーのスナックバーを表示する
    showErrorSnackbar(tm('tabGroups.delete_failed'));
  }
};

/**
 * タブを開くために選択された時のイベントハンドラー
 * @param tabGroup タブグループ
 * @param tab タブ
 */
const onSelectedTabToOpen = async (
  tabGroup: BrowserTabGroup,
  tab: BrowserTab,
) => {
  console.debug(
    `onSelectedTabToOpen called! [tabGroup: ${tabGroup.title}, tab: ${tab.title}]`,
  );
  if (tabGroup instanceof StoredBrowserTabGroup) {
    // ストレージに保存されているタブグループの場合
    // 保存状態からブラウザーにタブグループを復元する
    console.debug(`StoredBrowserTabGroup selected! [title: ${tabGroup.title}]`);
    const restored = await restoreTabGroup(tabGroup);
    // await sleep(500);
    if (restored && restored.tabs && restored.tabs.length > 0) {
      console.debug(`restored tabs: ${restored.tabs.length}`);
      // 復元したタブグループから、選択されたタブを取得する
      const selectedTab = restored.tabs!.find((t) => t.url === tab.url);
      console.debug(`selected tab: ${selectedTab}`);
      // タブをハイライトする
      if (selectedTab) {
        await highlightTab(selectedTab);
      }
    }
  } else {
    // 選択されたタブをハイライトする
    await highlightTab(tab);
  }
  // ポップアップを閉じる
  window.close();
};

/**
 * タブを閉じるために選択された時のイベントハンドラー
 * @param tabGroup タブグループ
 * @param tab タブ
 */
const onSelectedTabToClose = async (
  tabGroup: BrowserTabGroup,
  tab: BrowserTab,
) => {
  console.debug(
    `onSelectedTabToClose called! [tabGroup: ${tabGroup.title}, tab: ${tab.title}]`,
  );
  if (
    isOpenedBrowserTabGroup(tabGroup) ||
    isUnGroupedBrowserTabGroup(tabGroup)
  ) {
    // 選択されたタブを閉じる
    await closeTab(tab);
    // ポップアップを閉じる
    window.close();
  }
};
</script>
