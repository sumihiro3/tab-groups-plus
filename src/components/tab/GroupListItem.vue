<script setup lang="ts">
import { computed } from 'vue';
// import { useI18n } from 'vue-i18n';
import { BrowserTabGroup, StoredBrowserTabGroup } from '../../types';
import { ref } from 'vue';
import { watch } from 'vue';

// const { tm } = useI18n({ useScope: 'global' });

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
 * ストレージに保存されているタブグループかどうか
 */
const isStoredTabGroup = computed(() => {
  return currentTabGroup.value instanceof StoredBrowserTabGroup;
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

// /**
//  * タブグループを保存して閉じる
//  * @param tabGroup 保存するタブグループ
//  */
// const saveAndCloseTabGroup = async (tabGroup: BrowserTabGroup) => {
//   console.log(`saveAndClose [group: ${tabGroup.id}]`);
//   if (!tabGroup) {
//     console.error(`タブグループが不正です: ${tabGroup}`);
//     return;
//   }
//   emit('selectToSave', props.index!);
// };

// /**
//  * 保存されたタブグループを削除する
//  * @param tabGroup 削除するタブグループ
//  */
// const deleteTabGroup = async (tabGroup: StoredBrowserTabGroup) => {
//   console.log(`deleteTabGroup [group: ${tabGroup.id}]`);
//   if (!tabGroup) {
//     console.error(`タブグループが不正です: ${tabGroup}`);
//     return;
//   }
//   try {
//     // タブグループを削除する
//     await removeTabGroup(tabGroup);
//     console.log(`TabGroup deleted! [group: ${JSON.stringify(tabGroup)}]`);
//     emit('deleted');
//   } catch (error) {
//     console.error(error);
//   }
// };
</script>

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
          <div
            class="text-left"
            @click="emit('selectToOpenTabGroup', tabGroup!)"
          >
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
        <v-list-item-title
          class="text-left"
          @click="emit('selectToOpenTabGroup', tabGroup!)"
        >
        </v-list-item-title>
      </v-list-item>
    </template>
    <slot></slot>
  </v-list-group>
</template>

<style scoped>
.tab-group-list-item {
  opacity: 0.9;
}
</style>
