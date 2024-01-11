<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { TabGroupColorEnum } from '../../types';
type TabGroup = chrome.tabGroups.TabGroup;

/**
 * コンポーネントのプロパティ
 */
const props = defineProps({
  tabGroup: Object as () => TabGroup,
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
  const tabs = await chrome.tabs.query({ groupId: props.tabGroup.id });
  // タブの数を表示する
  subTitle.value = `${tabs.length} tabs`;
});

/**
 * グループ名のカラーを返す
 */
const tabGroupAvatarColor = computed(() => {
  let color = props.tabGroup ? props.tabGroup.color : 'grey';
  if (!color || !Object.values(TabGroupColorEnum).includes(color)) {
    // 未定義の場合はグレーにする
    color = 'grey';
  } else {
    color = props.tabGroup!.color;
  }
  return {
    'bg-gray-500': color === 'grey',
    'bg-blue-500': color === 'blue',
    'bg-red-500': color === 'red',
    'bg-yellow-500': color === 'yellow',
    'bg-green-500': color === 'green',
    'bg-pink-500': color === 'pink',
    'bg-purple-500': color === 'purple',
    'bg-cyan-500': color === 'cyan',
    'bg-orange-500': color === 'orange',
  };
});

/**
 * 最大幅で表示するためのプレースホルダーの文字列を返す
 */
const marginText = computed(() => {
  const maxLength = 32;
  const length = subTitle.value.length;
  if (length >= maxLength) {
    return '';
  }
  const margin = maxLength - length;
  return '-'.repeat(margin);
});
</script>

<template>
  <main v-if="props.tabGroup">
    <div
      class="pt-4 pb-4 pl-3 pr-3 flex w-full justify-between items-center border-t cursor-pointer hover:bg-gray-200"
      :class="{
        'bg-gray-200': props.active,
      }"
      @click="emit('selected', props.index!)"
    >
      <div class="flex items-center">
        <div class="avatar placeholder">
          <div
            :class="tabGroupAvatarColor"
            class="text-neutral-content rounded-full w-8"
          >
            <span class="text-xl"></span>
          </div>
        </div>
        <div class="ml-2 flex flex-col">
          <div class="leading-snug text-base text-gray-900 font-bold text-left">
            {{ props.tabGroup.title }}
          </div>
          <div class="leading-snug text-xs text-gray-600 text-left">
            {{ subTitle }}
            <span class="text-opacity-0 text-gray-600">{{ marginText }}</span>
          </div>
        </div>
      </div>
      <kbd class="kbd" v-if="props.active">Enter</kbd>
    </div>
  </main>
</template>
