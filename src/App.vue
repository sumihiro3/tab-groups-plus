<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import TabGroupList from './components/tab/GroupList.vue';
import TabGroupListItem from './components/tab/GroupListItem.vue';
// chromeの型定義ファイルを読み込む
type TabGroup = chrome.tabGroups.TabGroup;

const { tm } = useI18n({ useScope: 'global' });

/**
 * タブグループの一覧
 */
const tabGroups = ref<TabGroup[]>([]);

/**
 * 選択中のタブグループのインデックス
 */
const selectedTabGroupIndex = ref<number>(0);

/**
 * タブグループの検索用文字列
 */
const query = ref<string>('');

/**
 * onMounted
 */
onMounted(async () => {
  console.log('onMounted!');
  try {
    // すべてのタブグループの一覧を取得
    tabGroups.value = await chrome.tabGroups.query({});
    // キーが押された時のイベントを登録
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        onDownKeyPressed();
      } else if (e.key === 'ArrowUp') {
        onUpKeyPressed();
      } else if (e.key === 'Enter') {
        onEnterKeyPressed();
      }
    });
    // 初期表示時に検索文字列の入力欄にフォーカスを当てる
    const input = document.getElementById('query');
    input?.focus();
    // queryPlaceholder.value = tm('tabGroups.input_query');
  } catch (error) {
    console.error(error);
  }
});

/**
 * 上キーが押された時の処理
 */
const onUpKeyPressed = () => {
  console.log('onUpKeyPressed!');
  if (selectedTabGroupIndex.value === 0) {
    selectedTabGroupIndex.value = tabGroups.value.length - 1;
    return;
  }
  selectedTabGroupIndex.value = selectedTabGroupIndex.value - 1;
};

/**
 * 下キーが押された時の処理
 */
const onDownKeyPressed = () => {
  console.log('onDownKeyPressed!');
  if (selectedTabGroupIndex.value === tabGroups.value.length - 1) {
    selectedTabGroupIndex.value = 0;
    return;
  }
  selectedTabGroupIndex.value = selectedTabGroupIndex.value + 1;
};

/**
 * Enterキーが押された時の処理
 */
const onEnterKeyPressed = async () => {
  console.log('onEnterKeyPressed!');
  // 選択されたグループのタブをハイライトする
  await highlightTabGroup(selectedTabGroupIndex.value);
};

/**
 * 指定のタブグループをハイライトする
 * @param index タブグループのインデックス
 */
const highlightTabGroup = async (index: number) => {
  console.log(`highlightTabGroup [index: ${index}]`);
  try {
    // 選択中のタブグループを取得
    const selectedTabGroup = tabGroups.value[index];
    if (!selectedTabGroup) {
      return;
    }
    // タブグループに属する最初のタブを取得し、このタブをハイライト対象とする
    const tabs = await chrome.tabs.query({ groupId: selectedTabGroup.id });
    if (!tabs.length) {
      return;
    }
    const targetTab = tabs[0];
    // カレントウィンドウを取得
    const currentWindow = await chrome.windows.getCurrent();
    if (currentWindow.id !== targetTab.windowId) {
      // ハイライト対象タブが属するウィンドウがカレントウィンドウでない場合は、
      // タブが属するウィンドウをアクティブにする
      await chrome.windows.update(targetTab.windowId, { focused: true });
    }
    // 対象のタブをハイライトする
    await chrome.tabs.highlight({
      tabs: targetTab.index,
      windowId: targetTab.windowId,
    });
    // ポップアップを閉じる
    window.close();
  } catch (error) {
    console.error(`Error at highlightTabGroup: ${error}`);
  }
};
</script>

<template>
  <div class="min-w-md">
    <label class="form-control">
      <div class="label">
        <span class="label-text">{{ tm('tabGroups.search') }}</span>
      </div>
      <input
        type="text"
        id="query"
        v-model="query"
        :placeholder="tm('tabGroups.input_query')"
        class="input input-bordered w-full"
      />
    </label>
    <TabGroupList>
      <TabGroupListItem
        v-for="(tabGroup, index) in tabGroups"
        :key="index"
        :tabGroup="tabGroup"
        :index="index"
        :active="selectedTabGroupIndex === index"
        @selected="highlightTabGroup"
      />
    </TabGroupList>
  </div>
</template>
