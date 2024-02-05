<template>
  <v-tooltip location="bottom">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        :color="p.color"
        :class="p.class"
        @click="emit('click')"
        :size="p.size"
        :elevation="p.elevation"
        icon
        flat
        density="compact"
      >
        <v-icon :color="p.iconColor">{{ p.icon }}</v-icon>
      </v-btn>
    </template>
    <span>{{ p.tooltip }}</span>
  </v-tooltip>
</template>

<script setup lang="ts">
/** コンポーネントのプロパティ */
export interface Props {
  tooltip: string;
  icon: string;
  size?: string;
  color?: string;
  iconColor?: string;
  class?: string;
  elevation?: number;
}

/** プロパティとデフォルト値 */
const p = withDefaults(defineProps<Props>(), {
  tooltip: '',
  icon: '',
  size: 'small',
  color: 'teal',
  iconColor: 'white',
  class: '',
  elevation: 1,
});

const emit = defineEmits<{
  (event: 'click'): void;
}>();
</script>
