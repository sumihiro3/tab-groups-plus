<template>
  <v-list-group
    v-if="currentTabGroup"
    :value="currentTabGroup.title"
    :active="props.active"
    :fluid="true"
    :class="tabGroupColor"
    class="tab-group-list-item"
  >
    <template v-slot:activator="{ props }">
      <v-list-item v-bind="props" elevation="1">
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
          <!-- タブグループを開く・ハイライトする -->
          <TooltipButton
            :tooltip="`${getI18nMessage('tabGroups_open')} (Enter)`"
            :icon="mdiOpenInApp"
            color="rgba(0, 0, 0, 0.0)"
            iconColor="teal"
            class="mb-1"
            @click="emit('selectToOpenTabGroup', tabGroup!)"
          />
          <!-- タブグループを保存して閉じる -->
          <TooltipButton
            :tooltip="`${getI18nMessage('tabGroups_save_and_close')} (Shift + Enter)`"
            :icon="mdiContentSave"
            color="rgba(0, 0, 0, 0.0)"
            iconColor="teal"
            class="ml-1 mb-1"
            @click="emit('selectToSaveTabGroup', tabGroup!)"
          />
          <!-- タブグループを閉じる -->
          <TooltipButton
            :tooltip="getI18nMessage('tabGroups_close')"
            :icon="mdiClose"
            color="rgba(0, 0, 0, 0.0)"
            iconColor="teal"
            class="ml-1 mb-1"
            @click="emit('selectToCloseTabGroup', tabGroup!)"
          />
        </template>
        <!-- 保存されているタブグループ用のボタン群 -->
        <template v-slot:append v-else-if="isStoredTabGroup">
          <!-- 保存されたタブグループを復元する -->
          <TooltipButton
            :tooltip="getI18nMessage('tabGroups_restore')"
            :icon="mdiRestore"
            color="rgba(0, 0, 0, 0.0)"
            iconColor="teal"
            class="mb-1"
            @click="emit('selectToOpenTabGroup', tabGroup!)"
          />
          <!-- 保存されたタブグループを削除する -->
          <TooltipButton
            :tooltip="getI18nMessage('tabGroups_delete')"
            :icon="mdiTrashCan"
            color="rgba(0, 0, 0, 0.0)"
            iconColor="teal"
            class="ml-1 mb-1"
            @click="emit('selectToDeleteTabGroup', tabGroup!)"
          />
        </template>
        <template v-slot:append v-else-if="isUngroupedTabGroup">
          <!-- 未分類の場合、ショートカットボタンは表示しない -->
        </template>
      </v-list-item>
    </template>
    <slot></slot>
  </v-list-group>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { BrowserTabGroup } from '../../types';
import TooltipButton from '../button/WithTooltip.vue';
import {
  isStoredBrowserTabGroup,
  isOpenedBrowserTabGroup,
  isUnGroupedBrowserTabGroup,
} from '../../composables/chrome';
import { getI18nMessage } from '../../composables/chrome/i18n';
import {
  mdiContentSave,
  mdiCircle,
  // @ts-ignore 6133 何故か 'mdiRestore' is declared but its value is never read. が出るので無視するように追加
  mdiRestore,
  // @ts-ignore 6133 何故か 'mdiTrashCan' is declared but its value is never read. が出るので無視するように追加
  mdiTrashCan,
  mdiOpenInApp,
  mdiClose,
} from '@mdi/js';

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
// @ts-ignore 6133 何故か ''isUngroupedTabGroup' が宣言されていますが、その値が読み取られることはありません。 が出るので無視するように追加
const isUngroupedTabGroup = computed(() => {
  return isUnGroupedBrowserTabGroup(currentTabGroup.value);
});

/**
 * タブグループの背景色
 */
const tabGroupColor = computed(() => {
  const tabGroup = currentTabGroup.value;
  let className = '';
  if (!tabGroup.color) {
    className = `tab-group-bg-default`;
  } else {
    className = `tab-group-bg-${tabGroup.color}`;
  }
  return className;
});

/**
 * タブグループの種類に応じたアイコン名を返す
 */
const tabGroupIcon = computed(() => {
  if (isStoredTabGroup.value) {
    return mdiContentSave;
  } else {
    return mdiCircle;
  }
});
</script>

<style scoped>
.tab-group-list-item {
  color: #ffffff;
}

.tab-group-bg-default {
  color: #2d2d2d;
  background-color: #ffffff;
}
.tab-group-bg-grey {
  background-color: #5f6368;
}
.tab-group-bg-blue {
  background-color: #1a73e8;
}
.tab-group-bg-red {
  background-color: #d93025;
}
.tab-group-bg-yellow {
  color: #2d2d2d;
  background-color: #f9ab00;
}
.tab-group-bg-green {
  background-color: #188038;
}
.tab-group-bg-pink {
  background-color: #d01884;
}
.tab-group-bg-purple {
  background-color: #a142f4;
}
.tab-group-bg-cyan {
  background-color: #007b83;
}
.tab-group-bg-orange {
  color: #2d2d2d;
  background-color: #fa903e;
}

/* ダークモード用定義 */
@media (prefers-color-scheme: dark) {
  .tab-group-list-item {
    color: #202125;
  }

  .tab-group-bg-default {
    background-color: #ffffff;
  }
  .tab-group-bg-grey {
    background-color: #dadce0;
  }
  .tab-group-bg-blue {
    background-color: #8ab4f8;
  }
  .tab-group-bg-red {
    background-color: #f28b82;
  }
  .tab-group-bg-yellow {
    background-color: #fdd663;
  }
  .tab-group-bg-green {
    background-color: #81c995;
  }
  .tab-group-bg-pink {
    background-color: #ff8bcb;
  }
  .tab-group-bg-purple {
    background-color: #c58af9;
  }
  .tab-group-bg-cyan {
    background-color: #78d9ec;
  }
  .tab-group-bg-orange {
    background-color: #fcad70;
  }
}
</style>
