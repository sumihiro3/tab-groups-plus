<template>
  <v-app>
    <!-- Header -->
    <v-app-bar density="compact">
      <v-app-bar-title>
        <!-- Tab or Tab group query text field -->
        <v-text-field
          id="query"
          v-model="query"
          :placeholder="tm('tabGroups.input_query')"
          hide-details
          single-line
        >
          <template v-slot:append>
            <!-- Logo -->
            <v-avatar class="mr-2">
              <v-img :src="iconUrl" alt="TabGroups Plus"></v-img>
            </v-avatar>
          </template>
        </v-text-field>
      </v-app-bar-title>
    </v-app-bar>
    <!-- Snackbar -->
    <SnackbarView :snackbar="showSnackbar" />
    <!-- TabGroup List -->
    <v-main>
      <v-container fluid class="pa-0">
        <TabGroupList
          v-if="filteredTabGroups.length > 0"
          :tabGroups="filteredTabGroups"
          :expandTabGroupList="expandTabGroupList"
          @onChangedActiveListItem="onChangedActiveListItem"
          @onChangedListItem="onChangedListItem"
        />
        <!-- max-height="400" -->
        <v-layout v-else height="100dvh">
          <v-chip variant="text" class="mt-4 text-subtitle-1 font-weight-bold">
            {{ tm('tabGroups.no_matches') }}
          </v-chip>
        </v-layout>
      </v-container>
      <!-- Footer -->
      <v-container fluid class="pa-0">
        <v-footer app class="pa-0">
          <div class="bg-teal d-flex w-100 align-center px-4">
            <strong>TagGroups Plus</strong>
            <v-spacer></v-spacer>
            <v-btn
              @click="openOptionsPage"
              class="mx-4"
              icon="mdi-cog"
              variant="plain"
              size="small"
            ></v-btn>
          </div>
        </v-footer>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  getTabGroups,
  getUnGroupedTabs,
  getStoredTabGroups,
} from '../../composables/chrome';
import {
  BrowserTabGroup,
  StoredBrowserTabGroup,
  Snackbar,
  UnGroupedTabs,
} from '../../types';
import SnackbarView from '../../components/Snackbar.vue';
import TabGroupList from '../../components/tab/GroupList.vue';

const { tm } = useI18n({ useScope: 'global' });

/**
 * スナックバー表示用オブジェクト
 */
const showSnackbar = ref<Snackbar | undefined>();

/**
 * ブラウザーで開かれているタブグループの一覧
 */
const openedTabGroups = ref<BrowserTabGroup[]>([]);

/**
 * 未分類のタブ群
 */
const unGroupedTabs = ref<UnGroupedTabs>();

/**
 * ストレージに保存されているタブグループの一覧
 */
const storedTabGroups = ref<StoredBrowserTabGroup[]>([]);

/**
 * 選択中のタブグループのインデックス
 */
const selectedTabGroupIndex = ref<number>(0);

/**
 * タブグループの検索用文字列
 */
const query = ref<string>('');

/**
 * オプションページのURL
 */
const optionsPageUrl = chrome.runtime
  ? chrome.runtime.getURL('/src/pages/options/index.html')
  : '';

/**
 * アイコンのURL
 */
const iconUrl = chrome.runtime
  ? chrome.runtime.getURL('/src/assets/icon/icon-128.png')
  : '';

const expandTabGroupList = ref<string[]>([]);

/**
 * onMounted
 */
onMounted(async () => {
  console.log('onMounted!');
  try {
    // タブグループの一覧を更新する
    await refreshAllTabGroups();
    // 初期表示時に検索文字列の入力欄にフォーカスを当てる
    setFocusToQuery();
    // リストで展開するタブグループを更新する（すべてのタブグループを展開する）
    refreshExpandTabGroupList();
  } catch (error) {
    console.error(error);
  }
});

/**
 * タブグループ名でフィルタリングした結果を返す
 */
const filteredTabGroups = computed(() => {
  console.debug(`filteredTabGroups called!: ${query.value}`);
  if (!query.value) {
    const unGrouped =
      unGroupedTabs.value && unGroupedTabs.value.tabs!.length > 0
        ? [unGroupedTabs.value]
        : [];
    const list: BrowserTabGroup[] = openedTabGroups.value
      .concat(unGrouped)
      .concat(storedTabGroups.value);
    console.debug(
      `filteredTabGroups [${list.length}]: ${JSON.stringify(list)}`,
    );
    return list;
  }
  // 入力された文字列がタブグループ名か、タブグループ内のタブ名に含まれているものに絞り込む
  // ブラウザーで開かれているタブグループから抽出する
  const filteredInOpened = containsQueryInTabGroups(openedTabGroups.value);
  // 未分類のタブ群から抽出する
  const filteredInUnGrouped = containsQueryInTabGroups([unGroupedTabs.value!]);
  // 保存されているタブグループから抽出する
  const filteredInStored = containsQueryInTabGroups(storedTabGroups.value);
  // フィルタリング後の配列を結合する
  const filtered = filteredInOpened
    .concat(filteredInUnGrouped)
    .concat(filteredInStored);
  // 現在のインデックスがフィルタリング後の配列の範囲外になっている場合は、0にする
  if (selectedTabGroupIndex.value >= filteredInOpened.length) {
    selectedTabGroupIndex.value = 0;
  }
  console.debug(`filteredTabGroups: ${JSON.stringify(filtered)}`);
  return filtered;
});

/**
 * [filteredTabGroups] の変更を監視する
 */
watch(
  () => filteredTabGroups.value,
  () => {
    console.debug(`filteredTabGroups.value changed!: ${query.value}`);
    // 展開するタブグループの一覧を更新する
    refreshExpandTabGroupList();
  },
);

/**
 * タブグループの一覧を更新する
 */
const refreshAllTabGroups = async () => {
  console.debug('refreshAllTabGroups called!');
  try {
    // 検索文字列をクリアする
    query.value = '';
    // ブラウザーで開かれているタブグループの一覧を取得
    openedTabGroups.value = await getTabGroups();
    // 未分類のタブ群を取得
    unGroupedTabs.value = await getUnGroupedTabs(tm('tabGroups.un_grouped'));
    // ストレージに保存されているタブグループの一覧を取得
    const storedGroup = await getStoredTabGroups();
    /**
     * ストレージに保存されているタブグループの一覧に、
     * ブラウザーで開かれているグループと同名のタブグループがあった場合は
     * ブラウザーで開かれているタブグループを優先する
     * そのため、ストレージに保存されているタブグループの一覧から、
     * ブラウザーで開かれているタブグループと同名のタブグループを削除する
     */
    storedTabGroups.value = storedGroup.filter((stored) => {
      return !openedTabGroups.value.some((opened) => {
        return stored.title === opened.title;
      });
    });
  } catch (error) {
    console.error(error);
  }
};

/**
 * リストグループで展開するタブグループの一覧を更新する
 */
const refreshExpandTabGroupList = () => {
  console.debug('refreshExpandTabGroupList called!');
  expandTabGroupList.value = [];
  for (const g of filteredTabGroups.value) {
    expandTabGroupList.value.push(g.title!);
  }
};

/**
 * 検索文字列が指定のタブグループ一覧に含まれているかどうかを返す
 * @param tabGroups タブグループの一覧
 * @returns 検索文字列が含まれている場合はタブグループを返す
 */
const containsQueryInTabGroups = (tabGroups: BrowserTabGroup[]) => {
  console.debug(`containsQueryInTabGroups called!: ${query.value}`);
  if (!query.value) {
    return [];
  }
  const filtered = [];
  for (const g of tabGroups) {
    const contains = g.contains(query.value);
    console.debug(`contains [${contains}] in [${g.title}]`);
    if (contains) {
      filtered.push(contains);
    }
  }
  return filtered;
};

/**
 * 検索文字列の入力欄にフォーカスを当てる
 */
const setFocusToQuery = () => {
  console.debug('setFocusToQuery called!');
  const input = document.getElementById('query');
  input?.focus();
};

/**
 * TabGroupList でアクティブになったアイテムが更新された時のイベントハンドラー
 */
const onChangedActiveListItem = () => {
  console.debug(`onChangedActiveListItem called!`);
  setFocusToQuery();
};

/**
 * TabGroupList 内でアイテムが更新された時のイベントハンドラー
 */
const onChangedListItem = () => {
  console.debug(`onChangedListItem called!`);
  // タブグループの一覧を更新する
  refreshAllTabGroups();
  setFocusToQuery();
};

/**
 * オプションページを開く
 */
const openOptionsPage = () => {
  console.debug('openOptionsPage called!');
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(optionsPageUrl);
  }
};
</script>
