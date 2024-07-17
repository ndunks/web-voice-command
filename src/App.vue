<template>
  <v-app>
    <v-app-bar>
    </v-app-bar>
    <v-main>
      <VContainer>
        <Recorder />
      </VContainer>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { VContainer } from 'vuetify/components';
import Recorder from './views/Recorder.vue';

</script>
