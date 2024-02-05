<template>
  <v-list-item
    :value="props.tab"
    :active="props.active"
    @click="emit('selectTabToOpen', props.tabGroup!, props.tab!)"
    density="compact"
    class="tab-list-item"
  >
    <template v-slot:prepend>
      <!-- タブの favicon -->
      <v-avatar
        :image="props.tab!.favIconUrl"
        :size="faviconSize"
        :rounded="false"
      />
    </template>
    <!-- タブのタイトル -->
    <v-list-item-title class="text-left text-body-2">
      <!-- i: {{ props.tab!.displayIndex }} -->
      <span
        :class="{
          'font-weight-bold': props.active,
          'font-weight-medium': !props.active,
        }"
      >
        {{ props.tab!.title }}
      </span>
    </v-list-item-title>
    <template v-slot:append v-if="isOpenedTabGroup || isUnGroupedTabGroup">
      <!-- 開いているタブを閉じる -->
      <TooltipButton
        :tooltip="getI18nMessage('tabs_close')"
        icon="mdi-close"
        color="grey-lighten-2"
        :elevation="0"
        class="mb-1"
        @click="emit('selectTabToClose', props.tabGroup!, props.tab!)"
      />
    </template>
  </v-list-item>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import TooltipButton from '../button/WithTooltip.vue';
import { BrowserTab, BrowserTabGroup } from '../../types';
import {
  isOpenedBrowserTabGroup,
  isUnGroupedBrowserTabGroup,
} from '../../composables/chrome';
import { getI18nMessage } from '../../composables/chrome/i18n';

/**
 * コンポーネントのプロパティ
 */
const props = defineProps({
  tabGroup: Object as () => BrowserTabGroup,
  tab: Object as () => BrowserTab,
  active: Boolean,
});

/** 親コンポーネントへの Emit */
const emit = defineEmits<{
  /**
   * 開くためにタブが選択された時のイベント
   * @param tabGroup タブグループ
   * @param tab タブ
   */
  (event: 'selectTabToOpen', tabGroup: BrowserTabGroup, tab: BrowserTab): void;

  /**
   * 閉じるためにタブが選択された時のイベント
   * @param tabGroup タブグループ
   * @param tab タブ
   */
  (event: 'selectTabToClose', tabGroup: BrowserTabGroup, tab: BrowserTab): void;
}>();

/**
 * Favicon のサイズ
 */
const faviconSize = 20;

/**
 * ブラウザーで開かれているタブグループかどうか
 */
const isOpenedTabGroup = computed(() => {
  return isOpenedBrowserTabGroup(props.tabGroup!);
});

/**
 * 未分類のタブグループかどうか
 */
const isUnGroupedTabGroup = computed(() => {
  return isUnGroupedBrowserTabGroup(props.tabGroup!);
});
</script>

<style scoped>
.tab-list-item {
  color: #2d2d2d;
  background-color: #f4f4f4;
  opacity: 0.8;
}
</style>
