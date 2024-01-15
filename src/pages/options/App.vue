<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { tm } = useI18n({ useScope: 'global' });

const iconUrl = chrome.runtime.getURL('/src/assets/icon/icon-128.png');

/**
 * タブグループを選択した際に、そのタブグループのタブをリロードするかどうか
 */
const reloadOnHighlight = ref(false);

/**
 * onMounted
 */
onMounted(async () => {
  console.log('onMounted!');
  reloadOnHighlight.value = true;
});
</script>

<template>
  <v-app>
    <v-app-bar density="compact">
      <v-app-bar-nav-icon>
        <img :src="iconUrl" height="24" />
      </v-app-bar-nav-icon>
      <v-app-bar-title>TabGroups Plus </v-app-bar-title>
    </v-app-bar>
    <!-- Form -->
    <v-main>
      <v-container fluid class="pa-0">
        <v-form>
          <v-container fluid class="pa-0">
            <v-row>
              <v-col cols="4" sm="1"></v-col>
              <v-col cols="4" sm="10">
                <v-card class="mx-auto">
                  <v-card-item>
                    <v-card-title>{{ tm('options.title') }}</v-card-title>
                  </v-card-item>
                  <v-card-text>
                    <v-switch
                      v-model="reloadOnHighlight"
                      hide-details
                      inset
                      color="teal"
                      :label="`${tm('options.reloadOnHighlight')}`"
                    ></v-switch>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer />
                    <v-btn
                      color="teal"
                      variant="tonal"
                      prepend-icon="mdi-floppy"
                      size="large"
                      class="pa-2"
                      >{{ tm('save') }}</v-btn
                    >
                    <v-spacer />
                  </v-card-actions>
                </v-card>
              </v-col>
              <v-col cols="4" sm="1"></v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-container>
    </v-main>
  </v-app>
</template>
