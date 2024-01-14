<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
type TabGroup = chrome.tabGroups.TabGroup;

const { tm } = useI18n({ useScope: 'global' });

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
  subTitle.value = `${tm('tabs.count_prefix')} ${tabs.length} ${tm(
    'tabs.count_suffix',
  )}`;
});

// const saveAndClose = (index: number) => {
//   console.log(`saveAndClose [index:${index}]`);
// };
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
        icon="mdi-circle"
        :color="props.tabGroup!.color"
        @click="emit('selected', props.index!)"
      ></v-icon>
    </template>
    <template v-slot:append>
      <v-chip v-show="active" color="primary" size="small" flat class="ml-2"
        >Enter</v-chip
      >
      <!-- <v-menu>
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
              <v-icon icon="mdi-folder" />
            </template>
            <v-list-item-title>{{ tm('tabGroups.open') }}</v-list-item-title>
          </v-list-item>
          <v-list-item @click="saveAndClose(props.index!)">
            <template v-slot:prepend>
              <v-icon icon="mdi-floppy" />
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
      </v-menu> -->
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
