<template>
  <v-container>
    <v-list
      class="w-50"
      elevation="2"
      :opened="expandGroups"
      open-strategy="multiple"
    >
      <v-list-item title="Osaka"> </v-list-item>
      <v-list-item title="Nagoya"> </v-list-item>
      <v-list-group value="Kansai">
        <template v-slot:activator="{ props, isOpen }">
          <v-list-item v-bind="props" title="Kansai">{{ isOpen }}</v-list-item>
        </template>
        <v-list-item title="Osaka"></v-list-item>
        <v-list-item title="Hyogo"></v-list-item>
        <v-list-item title="Kyoto"></v-list-item>
        <v-list-item title="Nara"></v-list-item>
        <v-list-item title="Wakayama"></v-list-item>
        <v-list-item title="Shiga"></v-list-item>
      </v-list-group>
      <v-list-group value="Kyushu">
        <template v-slot:activator="{ props, isOpen }">
          <v-list-item v-bind="props" title="Kyushu">{{ isOpen }}</v-list-item>
        </template>
        <v-list-item title="Fukuoka"></v-list-item>
        <v-list-item title="Kumamoto"></v-list-item>
        <v-list-item title="Kagoshima"></v-list-item>
        <v-list-item title="Saga"></v-list-item>
        <v-list-item title="Nagasaki"></v-list-item>
        <v-list-item title="Oita"></v-list-item>
      </v-list-group>
    </v-list>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const expandGroups = ref<string[]>(['Kyushu', 'Kansai']);
</script>
