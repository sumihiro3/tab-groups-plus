<template>
  <div v-if="props.snackbar">
    <v-snackbar
      v-model="props.snackbar.show"
      :timeout="props.snackbar.timeout"
      :color="props.snackbar.color"
      location="top"
    >
      {{ props.snackbar.message }}
      <template v-slot:actions>
        <v-btn
          :color="props.snackbar.color"
          variant="text"
          @click="props.snackbar === undefined"
        >
          {{ getI18nMessage('close') }}
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { Snackbar } from '../types';
// import { useI18n } from 'vue-i18n';
import { getI18nMessage } from '../composables/chrome/i18n';

// const { tm } = useI18n({ useScope: 'global' });
/**
 * コンポーネントのプロパティ
 */
const props = defineProps({
  snackbar: Object as () => Snackbar,
});
</script>
