<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
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

const iconUrl = chrome.runtime.getURL('/src/assets/icon/icon-128.png');

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
      if (e.isComposing || e.key === 'Process' || e.keyCode === 229) {
        // IME入力中は無視する
        return;
      }
      if (e.key === 'ArrowDown') {
        onDownKeyPressed();
      } else if (e.key === 'ArrowUp') {
        onUpKeyPressed();
      } else if (e.key === 'Enter') {
        onEnterKeyPressed();
      }
    });
    // 初期表示時に検索文字列の入力欄にフォーカスを当てる
    setFocusToQuery();
  } catch (error) {
    console.error(error);
  }
});

/**
 * タブグループ名でフィルタリングした結果を返す
 */
const filteredTabGroups = computed(() => {
  console.log('filteredTabGroups!');
  if (!query.value) {
    return tabGroups.value;
  }
  const q = query.value.toLowerCase();
  // 入力された文字列がタブグループ名に含まれているものに絞り込む
  const filtered = tabGroups.value.filter((tabGroup) => {
    const title = tabGroup.title!.toLowerCase();
    return title.indexOf(q) !== -1;
  });
  // 現在のインデックスがフィルタリング後の配列の範囲外になっている場合は、0にする
  if (selectedTabGroupIndex.value >= filtered.length) {
    selectedTabGroupIndex.value = 0;
  }
  return filtered;
});

/**
 * 検索文字列の入力欄にフォーカスを当てる
 */
const setFocusToQuery = () => {
  const input = document.getElementById('query');
  input?.focus();
};

/**
 * 上キーが押された時の処理
 */
const onUpKeyPressed = () => {
  console.log('onUpKeyPressed!');
  if (selectedTabGroupIndex.value === 0) {
    selectedTabGroupIndex.value = filteredTabGroups.value.length - 1;
  } else {
    selectedTabGroupIndex.value = selectedTabGroupIndex.value - 1;
  }
  setFocusToSelectedTabGroupItem(selectedTabGroupIndex.value);
};

/**
 * 下キーが押された時の処理
 */
const onDownKeyPressed = () => {
  console.log('onDownKeyPressed!');
  if (selectedTabGroupIndex.value === filteredTabGroups.value.length - 1) {
    selectedTabGroupIndex.value = 0;
  } else {
    selectedTabGroupIndex.value = selectedTabGroupIndex.value + 1;
  }
  setFocusToSelectedTabGroupItem(selectedTabGroupIndex.value);
};

/**
 * 選択されたタブグループのアイテムにフォーカスを当てる
 * @param index タブグループのインデックス
 */
const setFocusToSelectedTabGroupItem = (index: number) => {
  console.log(`setFocusToSelectedTabGroupItem [index: ${index}]`);
  selectedTabGroupIndex.value = index;
  const id = `tab-group-${index}`;
  window.location.hash = `#${id}`;
  setFocusToQuery();
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
    const selectedTabGroup = filteredTabGroups.value[index];
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
  <v-app>
    <v-app-bar density="compact">
      <!-- <v-app-bar-nav-icon></v-app-bar-nav-icon> -->
      <v-app-bar-title>
        <v-text-field
          id="query"
          v-model="query"
          :placeholder="tm('tabGroups.input_query')"
          hide-details
          single-line
        >
          <template v-slot:prepend>
            <v-avatar>
              <v-img :src="iconUrl" alt="TabGroups Plus"></v-img>
            </v-avatar>
          </template>
        </v-text-field>
      </v-app-bar-title>
    </v-app-bar>

    <v-main>
      <v-container fluid class="pa-0">
        <TabGroupList v-if="filteredTabGroups.length > 0" max-height="400">
          <TabGroupListItem
            v-for="(tabGroup, index) in filteredTabGroups"
            :key="index"
            :tabGroup="tabGroup"
            :index="index"
            :active="selectedTabGroupIndex === index"
            @selected="highlightTabGroup"
          />
        </TabGroupList>
        <div v-else class="mt-4">
          <v-chip variant="text" class="text-subtitle-1 font-weight-bold">
            {{ tm('tabGroups.no_matches') }}
          </v-chip>
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>
