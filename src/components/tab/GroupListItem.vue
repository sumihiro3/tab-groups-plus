<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { BrowserTabGroup, StoredBrowserTabGroup } from '../../types';
import {
  saveTabGroup,
  closeTabGroup,
  removeTabGroup,
} from '../../composables/chrome';

const { tm } = useI18n({ useScope: 'global' });

/**
 * コンポーネントのプロパティ
 */
const props = defineProps({
  tabGroup: Object as () => BrowserTabGroup,
  index: Number,
  active: Boolean,
});

/** 親コンポーネントへの Emit */
const emit = defineEmits<{
  /**
   * タブグループが選択された時のイベント
   * @param index タブグループのインデックス
   */
  (event: 'selected', index: number): void;

  /**
   * タブグループが閉じられた時のイベント
   */
  (event: 'closed'): void;
}>();

/**
 * List のサブタイトル
 */
const subTitle = ref('');

/**
 * onMounted
 */
onMounted(async () => {
  if (!props.tabGroup) {
    return;
  }
  // リストのサブタイトルを設定する
  if (props.tabGroup instanceof StoredBrowserTabGroup) {
    // 保存されているタブグループの場合
    // - 保存状態であることを表示する
    // - タブの数を表示する
    subTitle.value = `${tm('tabGroups.stored')}: ${tm('tabs.count_prefix')} ${
      props.tabGroup.tabs!.length
    } ${tm('tabs.count_suffix')}`;
  } else {
    // ブラウザーで開かれているタブグループの場合、API でタブを取得する
    const tabs = await chrome.tabs.query({ groupId: props.tabGroup.id });
    // - タブの数を表示する
    subTitle.value = `${tm('tabs.count_prefix')} ${tabs.length} ${tm(
      'tabs.count_suffix',
    )}`;
  }
});

/**
 * ストレージに保存されているタブグループかどうか
 */
const isStoredTabGroup = computed(() => {
  return props.tabGroup instanceof StoredBrowserTabGroup;
});

/**
 * タブグループの種類に応じたアイコン名を返す
 */
const tabGroupIcon = computed(() => {
  if (isStoredTabGroup.value) {
    return 'mdi-content-save';
  } else {
    return 'mdi-circle';
  }
});

/**
 * タブグループを保存して閉じる
 * @param tabGroup 保存するタブグループ
 */
const saveAndCloseTabGroup = async (tabGroup: BrowserTabGroup) => {
  console.log(`saveAndClose [group: ${tabGroup.id}]`);
  if (!tabGroup) {
    console.error(`タブグループが不正です: ${tabGroup}`);
    return;
  }
  try {
    // タブグループを保存する
    await saveTabGroup(tabGroup);
    console.log(`TabGroup saved! [group: ${JSON.stringify(tabGroup)}]`);
    // タブグループを閉じる
    await closeTabGroup(tabGroup);
    // TODO 完了のスナックバーを表示する
    emit('closed');
  } catch (error) {
    console.error(error);
    // TODO エラーのスナックバーを表示する
  }
};

/**
 * 保存されたタブグループを削除する
 * @param tabGroup 削除するタブグループ
 */
const deleteTabGroup = async (tabGroup: StoredBrowserTabGroup) => {
  console.log(`deleteTabGroup [group: ${tabGroup.id}]`);
  if (!tabGroup) {
    console.error(`タブグループが不正です: ${tabGroup}`);
    return;
  }
  try {
    // タブグループを削除する
    await removeTabGroup(tabGroup);
    console.log(`TabGroup deleted! [group: ${JSON.stringify(tabGroup)}]`);
    // TODO 完了のスナックバーを表示する
    emit('closed');
  } catch (error) {
    console.error(error);
    // TODO エラーのスナックバーを表示する
  }
};
</script>

<template>
  <v-list-item
    :value="props.tabGroup"
    color="primary"
    rounded="xl"
    :active="props.active"
  >
    <template v-slot:prepend>
      <v-icon
        :icon="tabGroupIcon"
        :color="props.tabGroup!.color"
        size="large"
        @click="emit('selected', props.index!)"
      />
    </template>
    <template v-slot:append>
      <v-chip v-show="active" color="primary" size="small" flat class="ml-2"
        >Enter</v-chip
      >
      <!-- タブグループごとのサブメニュ -->
      <v-menu v-if="isStoredTabGroup">
        <!-- ストレージに保存されているタブグループの場合のメニュ -->
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            icon="mdi-dots-vertical"
            density="compact"
            size="small"
            flat
            class="ml-2"
          >
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="emit('selected', props.index!)">
            <template v-slot:prepend>
              <v-icon icon="mdi-restore" />
            </template>
            <v-list-item-title>{{ tm('tabGroups.restore') }}</v-list-item-title>
          </v-list-item>
          <v-list-item @click="deleteTabGroup(props.tabGroup!)">
            <template v-slot:prepend>
              <v-icon icon="mdi-delete" />
            </template>
            <v-list-item-title>{{ tm('tabGroups.delete') }}</v-list-item-title>
          </v-list-item>
          <v-list-item @click="!props">
            <template v-slot:prepend>
              <v-icon icon="mdi-close" />
            </template>
            <v-list-item-title>{{ tm('cancel') }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-menu v-else>
        <!-- ブラウザーで開かれているタブグループの場合のメニュ -->
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            icon="mdi-dots-vertical"
            density="compact"
            size="small"
            flat
            class="ml-2"
          >
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="emit('selected', props.index!)">
            <template v-slot:prepend>
              <v-icon icon="mdi-open-in-app" />
            </template>
            <v-list-item-title>{{ tm('tabGroups.open') }}</v-list-item-title>
          </v-list-item>
          <v-list-item @click="saveAndCloseTabGroup(props.tabGroup!)">
            <template v-slot:prepend>
              <v-icon icon="mdi-content-save" />
            </template>
            <v-list-item-title>{{
              tm('tabGroups.save_and_close')
            }}</v-list-item-title>
          </v-list-item>
          <v-list-item @click="!props">
            <template v-slot:prepend>
              <v-icon icon="mdi-close" />
            </template>
            <v-list-item-title>{{ tm('cancel') }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>

    <v-list-item-title
      class="text-left text-subtitle-1 font-weight-bold"
      v-text="props.tabGroup!.title"
      @click="emit('selected', props.index!)"
    />
    <v-list-item-subtitle
      @click="emit('selected', props.index!)"
      v-text="subTitle"
      class="text-left text-body-2"
    />
  </v-list-item>
</template>
