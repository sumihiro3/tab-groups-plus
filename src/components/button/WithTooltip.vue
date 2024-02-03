<template>
  <v-tooltip location="bottom">
    <template v-slot:activator="{ isActive, props }">
      <v-btn
        v-bind="props"
        v-on="isActive"
        :color="p.color"
        :class="p.class"
        @click="emit('click')"
        size="small"
        icon
        flat
        density="compact"
      >
        <v-icon>{{ p.icon }}</v-icon>
      </v-btn>
    </template>
    <span>{{ p.tooltip }}</span>
  </v-tooltip>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

const p = defineProps({
  tooltip: String,
  icon: String,
  color: String,
  class: String,
});

const emit = defineEmits<{
  (event: 'click'): void;
}>();
</script>
