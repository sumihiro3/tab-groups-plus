<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  highlightTabGroup,
  getTabGroups,
  getStoredTabGroups,
  restoreTabGroup,
  saveTabGroup,
  closeTabGroup,
} from '../../composables/chrome';
import { BrowserTabGroup, StoredBrowserTabGroup, Snackbar } from '../../types';
import SnackbarView from '../../components/Snackbar.vue';
import TabGroupList from '../../components/tab/GroupList.vue';
import TabGroupListItem from '../../components/tab/GroupListItem.vue';

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
const optionsPageUrl = chrome.runtime.getURL('/src/pages/options/index.html');

/**
 * アイコンのURL
 */
const iconUrl = chrome.runtime.getURL('/src/assets/icon/icon-128.png');

/**
 * onMounted
 */
onMounted(async () => {
  console.log('onMounted!');
  try {
    // タブグループの一覧を更新する
    await refreshAllTabGroups();
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
    storedTabGroups.value = await getStoredTabGroups();
  } catch (error) {
    console.error(error);
  }
};

/**
 * タブグループ名でフィルタリングした結果を返す
 */
const filteredTabGroups = computed(() => {
  console.debug('filteredTabGroups called!');
  if (!query.value) {
    return openedTabGroups.value.concat(storedTabGroups.value);
  }
  const q = query.value.toLowerCase();
  // 入力された文字列がタブグループ名に含まれているものに絞り込む
  const filteredInOpened = openedTabGroups.value.filter((tabGroup) => {
    const title = tabGroup.title!.toLowerCase();
    return title.indexOf(q) !== -1;
  });
  const filteredInStored = storedTabGroups.value.filter((tabGroup) => {
    const title = tabGroup.title!.toLowerCase();
    return title.indexOf(q) !== -1;
  });
  const filtered = filteredInOpened.concat(filteredInStored);
  // 現在のインデックスがフィルタリング後の配列の範囲外になっている場合は、0にする
  if (selectedTabGroupIndex.value >= filteredInOpened.length) {
    selectedTabGroupIndex.value = 0;
  }
  return filtered;
});

/**
 * 検索文字列の入力欄にフォーカスを当てる
 */
const setFocusToQuery = () => {
  console.debug('setFocusToQuery called!');
  const input = document.getElementById('query');
  input?.focus();
};

/**
 * 上キーが押された時の処理
 */
const onUpKeyPressed = () => {
  console.debug('onUpKeyPressed called!');
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
  console.debug('onDownKeyPressed called!');
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
  console.debug(`setFocusToSelectedTabGroupItem called! [index: ${index}]`);
  selectedTabGroupIndex.value = index;
  const id = `tab-group-${index}`;
  window.location.hash = `#${id}`;
  setFocusToQuery();
};

/**
 * Enterキーが押された時の処理
 */
const onEnterKeyPressed = async () => {
  console.debug('onEnterKeyPressed called!');
  // 選択されたグループのタブをハイライトする
  await onTabGroupSelectToOpen(selectedTabGroupIndex.value);
};

/**
 * タブグループを開くために選択された時のイベントハンドラー
 * @param index タブグループのインデックス
 */
const onTabGroupSelectToOpen = async (index: number) => {
  console.debug(`onTabGroupSelectToOpen called! [index: ${index}]`);
  if (index < 0) {
    return;
  }
  // 選択中のタブグループを取得
  const selectedTabGroup = filteredTabGroups.value[index];
  if (selectedTabGroup instanceof StoredBrowserTabGroup) {
    // ストレージに保存されているタブグループの場合
    // 保存状態からブラウザーにタブグループを復元する
    console.debug(
      `StoredBrowserTabGroup selected! [title: ${selectedTabGroup.title}]`,
    );
    const restored = await restoreTabGroup(selectedTabGroup);
    if (restored) {
      await highlightTabGroup(restored);
    }
  } else {
    // 選択されたグループのタブをハイライトする
    await highlightSelectedTabGroup(index);
  }
  // ポップアップを閉じる
  window.close();
};

/**
 * タブグループを保存するために選択された時のイベントハンドラー
 * @param index タブグループのインデックス
 */
const onTabGroupSelectToSave = async (index: number) => {
  console.debug(`onTabGroupSelectToSave called! [index: ${index}]`);
  if (index < 0) {
    return;
  }
  // 選択中のタブグループを取得
  const selectedTabGroup = filteredTabGroups.value[index];
  if (selectedTabGroup instanceof StoredBrowserTabGroup) {
    // ストレージに保存されているタブグループの場合は何もしない
    return;
  }
  try {
    // タブグループを保存する
    await saveTabGroup(selectedTabGroup);
    // タブグループを閉じる
    await closeTabGroup(selectedTabGroup);
    // // タブグループの一覧を更新する
    refreshAllTabGroups();
    setFocusToQuery();
    // 完了のスナックバーを表示する
    showSnackbar.value = {
      show: true,
      timeout: 3000,
      color: 'success',
      message: tm('tabGroups.saved'),
    };
  } catch (error) {
    console.error(error);
    // エラーのスナックバーを表示する
    showSnackbar.value = {
      show: true,
      timeout: 3000,
      color: 'error',
      message: tm('tabGroups.save_failed'),
    };
  }
};

/**
 * 保存されたタブグループが削除された際のイベントハンドラー
 */
const onTabGroupDeleted = () => {
  console.debug('onTabGroupDeleted called!');
  // 検索文字列をクリアする
  query.value = '';
  // タブグループの一覧を更新する
  refreshAllTabGroups();
  setFocusToQuery();
  // 完了のスナックバーを表示する
  showSnackbar.value = {
    show: true,
    timeout: 3000,
    color: 'success',
    message: tm('tabGroups.deleted'),
  };
};

/**
 * 指定のタブグループをハイライトする
 * @param index タブグループのインデックス
 */
const highlightSelectedTabGroup = async (index: number) => {
  console.debug(`highlightTabGroup called! [index: ${index}]`);
  if (index < 0) {
    return;
  }
  try {
    // 選択中のタブグループを取得
    const selectedTabGroup = filteredTabGroups.value[index];
    if (!selectedTabGroup) {
      return;
    }
    // 指定タブグループのタブをハイライト状態にする
    await highlightTabGroup(selectedTabGroup);
  } catch (error) {
    console.error(`Error at highlightTabGroup: ${error}`);
  }
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
          <template v-slot:append>
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
        <TabGroupList v-if="filteredTabGroups.length > 0" max-height="400">
          <TabGroupListItem
            v-for="(tabGroup, index) in filteredTabGroups"
            :key="index"
            :id="`tab-group-${index}`"
            :tabGroup="tabGroup"
            :index="index"
            :active="selectedTabGroupIndex === index"
            @selectToOpen="onTabGroupSelectToOpen"
            @selectToSave="onTabGroupSelectToSave"
            @deleted="onTabGroupDeleted"
          />
        </TabGroupList>
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
