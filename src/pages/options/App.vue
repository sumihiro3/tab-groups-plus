<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  getExtensionOptions,
  setExtensionOptions,
} from '../../composables/options';
import { ExtensionOptions, DEFAULT_EXTENSION_OPTIONS } from '../../types';

const { tm } = useI18n({ useScope: 'global' });

/**
 * アイコンのURL
 */
const iconUrl = chrome.runtime.getURL('/src/assets/icon/icon-128.png');

/**
 * 拡張機能のオプション
 */
const options = ref<ExtensionOptions>(DEFAULT_EXTENSION_OPTIONS);

/**
 * 拡張機能のオプションの変更があったかどうか
 */
const isOptionsChanged = ref(false);

/**
 * beforeCreate
 */
(async () => {
  console.debug('Before create');
  options.value = await getExtensionOptions();
  console.debug('got options!');
})();

onMounted(async () => {
  console.debug('onMounted');
  isOptionsChanged.value = false;
});

/**
 * オプション値の変更を監視する
 */
watch(
  () => options.value,
  (_newValue, _oldValue) => {
    console.debug('options changed!');
    isOptionsChanged.value = true;
  },
  { deep: true },
);

/**
 * オプションの保存
 */
const saveOptions = async () => {
  console.debug('saveOptions called!');
  await setExtensionOptions(options.value);
  console.log('saved options!');
  isOptionsChanged.value = false;
};
</script>

<template>
  <v-app>
    <v-app-bar density="compact">
      <v-app-bar-nav-icon>
        <img :src="iconUrl" height="24" />
      </v-app-bar-nav-icon>
      <v-app-bar-title>
        <h2>TabGroups Plus</h2>
      </v-app-bar-title>
    </v-app-bar>
    <!-- Form -->
    <v-main>
      <v-container fluid class="pa-0">
        <v-form>
          <v-container fluid class="pa-0">
            <v-row>
              <v-col cols="12" md="2" lg="4"></v-col>
              <v-col cols="12" md="8" lg="4">
                <v-card class="mx-auto">
                  <v-card-item>
                    <v-card-title>{{ tm('options.title') }}</v-card-title>
                  </v-card-item>
                  <v-card-text>
                    <!-- reloadOnHighlight -->
                    <v-switch
                      v-model="options.reloadOnHighlight"
                      hide-details
                      inset
                      color="teal"
                      :label="`${tm('options.reloadOnHighlight')}`"
                    ></v-switch>
                    <!-- reloadOnHighlight -->
                    <v-switch
                      v-model="options.overwriteTabGroup"
                      hide-details
                      inset
                      color="teal"
                      :label="`${tm('options.overwriteTabGroup')}`"
                    ></v-switch>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer />
                    <!-- 更新ボタン -->
                    <v-btn
                      @click="saveOptions"
                      color="teal"
                      variant="tonal"
                      prepend-icon="mdi-floppy"
                      size="large"
                      class="pa-2"
                      :disabled="!isOptionsChanged"
                      >{{ tm('save') }}</v-btn
                    >
                    <v-spacer />
                  </v-card-actions>
                </v-card>
              </v-col>
              <v-col cols="12" md="2" lg="4"></v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-container>
    </v-main>
  </v-app>
</template>