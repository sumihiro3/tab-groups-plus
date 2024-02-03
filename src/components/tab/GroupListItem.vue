<template>
  <v-list-group
    v-if="currentTabGroup"
    :value="currentTabGroup.title"
    :active="props.active"
    :fluid="true"
    :style="tabGroupColor"
    class="tab-group-list-item"
  >
    <template v-slot:activator="{ props }">
      <v-list-item v-bind="props" rounded="xl">
        <template v-slot:default v-if="currentTabGroup">
          <div class="text-left">
            <!-- 保存されたタブグループの場合、それを表すアイコンを表示する -->
            <v-icon
              v-if="isStoredTabGroup"
              :icon="tabGroupIcon"
              :color="currentTabGroup.color"
              size="large"
            />
            <span class="text-body-2">
              <!-- i:{{ tabGroup!.displayIndex }} -->
              <!--  -->
              <!-- a:{{ currentTabActive }} -->
              <!--  -->
              [{{ tabGroup!.tabs!.length }}]&nbsp;
            </span>
            <span
              @click="emit('selectToOpenTabGroup', tabGroup!)"
              class="text-subtitle-1"
              :class="{
                'font-weight-black': currentTabActive,
                'font-weight-medium': !currentTabActive,
              }"
            >
              {{ tabGroup!.title }}
            </span>
          </div>
        </template>
        <!-- ブラウザーで開いているタブグループ用のボタン群 -->
        <template v-slot:append v-if="isOpenedTabGroup">
          <!-- タブグループを保存して閉じる -->
          <TooltipButton
            :tooltip="tm('tabGroups.save_and_close')"
            icon="mdi-content-save"
            color="teal"
            class="mb-1"
            @click="emit('selectToSaveTabGroup', tabGroup!)"
          />
          <!-- 開いているタブグループを閉じる -->
          <TooltipButton
            :tooltip="tm('tabGroups.close')"
            icon="mdi-close"
            color="teal"
            class="ml-1 mb-1"
            @click="emit('selectToCloseTabGroup', tabGroup!)"
          />
        </template>
        <!-- 保存されているタブグループ用のボタン群 -->
        <template v-slot:append v-else-if="isStoredTabGroup">
          <!-- 保存されたタブグループを復元する -->
          <TooltipButton
            :tooltip="tm('tabGroups.restore')"
            icon="mdi-restore"
            color="teal"
            class="mb-1"
            @click="emit('selectToOpenTabGroup', tabGroup!)"
          />
          <!-- 保存されたタブグループを削除する -->
          <TooltipButton
            icon="mdi-trash-can"
            :tooltip="tm('tabGroups.delete')"
            color="teal"
            class="ml-1 mb-1"
            @click="emit('selectToDeleteTabGroup', tabGroup!)"
          />
        </template>
        <template v-slot:append v-if="isUngroupedTabGroup"> </template>
      </v-list-item>
    </template>
    <slot></slot>
  </v-list-group>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { BrowserTabGroup } from '../../types';
import TooltipButton from '../button/WithTooltip.vue';
import {
  isStoredBrowserTabGroup,
  isOpenedBrowserTabGroup,
  isUnGroupedBrowserTabGroup,
} from '../../composables/chrome';

const { tm } = useI18n({ useScope: 'global' });

/**
 * コンポーネントのプロパティ
 */
const props = defineProps({
  tabGroup: Object as () => BrowserTabGroup,
  active: Boolean as () => boolean,
});

const currentTabGroup = ref<BrowserTabGroup>(props.tabGroup!);
const currentTabActive = ref<boolean>(props.active!);

/** 親コンポーネントへの Emit */
const emit = defineEmits<{
  /**
   * 開くためにタブグループが選択された時のイベント
   * @param tabGroup タブグループ
   */
  (event: 'selectToOpenTabGroup', tabGroup: BrowserTabGroup): void;

  /**
   * 閉じるためにタブグループが選択された時のイベント
   * @param tabGroup タブグループ
   */
  (event: 'selectToCloseTabGroup', tabGroup: BrowserTabGroup): void;

  /**
   * 保存するためにタブグループが選択された時のイベント
   * @param tabGroup タブグループ
   */
  (event: 'selectToSaveTabGroup', tabGroup: BrowserTabGroup): void;

  /**
   * 削除のためにタブグループが選択された時のイベント
   * @param tabGroup タブグループ
   */
  (event: 'selectToDeleteTabGroup', tabGroup: BrowserTabGroup): void;
}>();

/**
 * プロパティ [tabGroup] の変更を監視する
 */
watch(
  () => props.tabGroup,
  () => {
    console.debug(`watch [props.tabGroup] called!`);
    currentTabGroup.value = props.tabGroup!;
  },
);

/**
 * プロパティ [active] の変更を監視する
 */
watch(
  () => props.active,
  () => {
    console.debug(`watch [props.active] called!`);
    currentTabActive.value = props.active!;
  },
);

/**
 * ブラウザーで開かれているタブグループかどうか
 */
const isOpenedTabGroup = computed(() => {
  return isOpenedBrowserTabGroup(currentTabGroup.value);
});

/**
 * ストレージに保存されているタブグループかどうか
 */
const isStoredTabGroup = computed(() => {
  return isStoredBrowserTabGroup(currentTabGroup.value);
});

/**
 * 未分類のタブ群であるかどうか
 */
const isUngroupedTabGroup = computed(() => {
  return isUnGroupedBrowserTabGroup(currentTabGroup.value);
});

/**
 * タブグループの背景色
 */
const tabGroupColor = computed(() => {
  const tabGroup = currentTabGroup.value;
  const prefix = 'background-color:';
  let className = '';
  if (!tabGroup.color) {
    className = `${prefix} #ffffff`;
  } else {
    className = `${prefix} ${tabGroup.color}`;
  }
  return className;
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
</script>

<style scoped>
.tab-group-list-item {
  opacity: 0.9;
}
</style>
