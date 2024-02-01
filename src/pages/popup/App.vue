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
import { onMounted, ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  // highlightTabGroup,
  getTabGroups,
  getStoredTabGroups,
  // restoreTabGroup,
  // saveTabGroup,
  // closeTabGroup,
} from '../../composables/chrome';
import { BrowserTabGroup, StoredBrowserTabGroup, Snackbar } from '../../types';
import SnackbarView from '../../components/Snackbar.vue';
import TabGroupList from '../../components/tab/GroupList.vue';
import { watch } from 'vue';

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
    // refreshAllTabGroups();
    return openedTabGroups.value.concat(storedTabGroups.value);
  }
  // 入力された文字列がタブグループ名か、タブグループ内のタブ名に含まれているものに絞り込む
  // ブラウザーで開かれているタブグループから抽出する
  const filteredInOpened = containsQueryInTabGroups(openedTabGroups.value);
  // 保存されているタブグループから抽出する
  const filteredInStored = containsQueryInTabGroups(storedTabGroups.value);
  // フィルタリング後の配列を結合する
  const filtered = filteredInOpened.concat(filteredInStored);
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
 * 選択されたタブグループのアイテムにフォーカスを当てる
 * @param index タブグループのインデックス
 */
// const setFocusToSelectedTabGroupItem = (index: number) => {
//   console.debug(`setFocusToSelectedTabGroupItem called! [index: ${index}]`);
//   selectedTabGroupIndex.value = index;
//   const id = `tab-group-${index}`;
//   window.location.hash = `#${id}`;
//   setFocusToQuery();
// };

/**
 * タブグループを開くために選択された時のイベントハンドラー
 * @param index タブグループのインデックス
 */
// const onTabGroupSelectToOpen = async (index: number) => {
//   console.debug(`onTabGroupSelectToOpen called! [index: ${index}]`);
//   if (index < 0) {
//     return;
//   }
//   // 選択中のタブグループを取得
//   const selectedTabGroup = filteredTabGroups.value[index];
//   if (selectedTabGroup instanceof StoredBrowserTabGroup) {
//     // ストレージに保存されているタブグループの場合
//     // 保存状態からブラウザーにタブグループを復元する
//     console.debug(
//       `StoredBrowserTabGroup selected! [title: ${selectedTabGroup.title}]`,
//     );
//     const restored = await restoreTabGroup(selectedTabGroup);
//     if (restored) {
//       await highlightTabGroup(restored);
//     }
//   } else {
//     // 選択されたグループのタブをハイライトする
//     await highlightSelectedTabGroup(index);
//   }
//   // ポップアップを閉じる
//   window.close();
// };

// /**
//  * タブグループを保存するために選択された時のイベントハンドラー
//  * @param index タブグループのインデックス
//  */
// const onTabGroupSelectToSave = async (index: number) => {
//   console.debug(`onTabGroupSelectToSave called! [index: ${index}]`);
//   if (index < 0) {
//     return;
//   }
//   // 選択中のタブグループを取得
//   const selectedTabGroup = filteredTabGroups.value[index];
//   if (selectedTabGroup instanceof StoredBrowserTabGroup) {
//     // ストレージに保存されているタブグループの場合は何もしない
//     return;
//   }
//   try {
//     // タブグループを保存する
//     await saveTabGroup(selectedTabGroup);
//     // タブグループを閉じる
//     await closeTabGroup(selectedTabGroup);
//     // タブグループの一覧を更新する
//     refreshAllTabGroups();
//     setFocusToQuery();
//     // 完了のスナックバーを表示する
//     showSnackbar.value = {
//       show: true,
//       timeout: 3000,
//       color: 'success',
//       message: tm('tabGroups.saved'),
//     };
//   } catch (error) {
//     console.error(error);
//     // エラーのスナックバーを表示する
//     showSnackbar.value = {
//       show: true,
//       timeout: 3000,
//       color: 'error',
//       message: tm('tabGroups.save_failed'),
//     };
//   }
// };

/**
 * 保存されたタブグループが削除された際のイベントハンドラー
 */
// const onTabGroupDeleted = () => {
//   console.debug('onTabGroupDeleted called!');
//   // 検索文字列をクリアする
//   query.value = '';
//   // タブグループの一覧を更新する
//   refreshAllTabGroups();
//   setFocusToQuery();
//   // 完了のスナックバーを表示する
//   showSnackbar.value = {
//     show: true,
//     timeout: 3000,
//     color: 'success',
//     message: tm('tabGroups.deleted'),
//   };
// };

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
