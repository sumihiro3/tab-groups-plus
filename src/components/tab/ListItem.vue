<script setup lang="ts">
import { BrowserTab, BrowserTabGroup } from '../../types';

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
   * 削除のためにタブが選択された時のイベント
   * @param tabGroup タブグループ
   * @param tab タブ
   */
  (
    event: 'selectTabToDelete',
    tabGroup: BrowserTabGroup,
    tab: BrowserTab,
  ): void;
}>();

const faviconSize = 20;
</script>

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
    <!-- 削除ボタン -->
    <template v-slot:append>
      <v-icon
        @click="emit('selectTabToDelete', props.tabGroup!, props.tab!)"
        color="grey"
        icon="mdi-close"
      />
    </template>
  </v-list-item>
</template>

<style scoped>
.tab-list-item {
  background-color: #f4f4f4;
  opacity: 0.9;
}
</style>
