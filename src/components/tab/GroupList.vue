<template>
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
        @selectTabToDelete="onSelectedTabToOpen"
      />
    </TabGroupListItem>
  </v-list>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { BrowserTab, BrowserTabGroup } from '../../types';
import { onMounted } from 'vue';
import TabGroupListItem from '../../components/tab/GroupListItem.vue';
import TabListItem from '../../components/tab/ListItem.vue';
import { onBeforeMount } from 'vue';
import { watch } from 'vue';

const props = defineProps({
  /** リストへ表示するタブグループ */
  tabGroups: Array as () => BrowserTabGroup[],
  expandTabGroupList: Array as () => string[],
});

/** 親コンポーネントへの Emit */
const emit = defineEmits<{
  /**
   * リスト中でアクティブになったアイテムが変更された時のイベント
   * @param listItem タブグループ
   */
  (event: 'onChangedActiveListItem'): void;
}>();

const currentTabGroups = ref<BrowserTabGroup[]>(props.tabGroups!);

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

onBeforeMount(() => {
  console.debug(`TabGroupListItem.onBeforeMount called!`);
});

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
 * キーが押された時のイベントハンドラー
 * @param e キーイベント
 */
const keyDownEventHandler = (e: KeyboardEvent) => {
  if (e.isComposing || e.key === 'Process' || e.keyCode === 229) {
    // IME入力中は無視する
    return;
  }
  if (e.shiftKey && e.key === 'Enter') {
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
  // 選択されたグループのタブをハイライトする
  // await onTabGroupSelectToOpen(selectedTabGroupIndex.value);
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
  console.debug(`activeListItemElementId: ${activeListItemElementId.value}`);
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
};

/**
 * タブグループを保存するために選択された時のイベントハンドラー
 * @param tabGroup タブグループ
 */
const onSelectedTabGroupToSave = async (tabGroup: BrowserTabGroup) => {
  console.debug(
    `onSelectedTabGroupToSave called! [tabGroup: ${tabGroup.title}]`,
  );
};

/**
 * タブグループを削除するために選択された時のイベントハンドラー
 * @param tabGroup タブグループ
 */
const onSelectedTabGroupToDelete = async (tabGroup: BrowserTabGroup) => {
  console.debug(
    `onSelectedTabGroupToDelete called! [tabGroup: ${tabGroup.title}]`,
  );
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
};
</script>
