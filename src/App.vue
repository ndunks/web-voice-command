<template>
  <v-app>
    <v-app-bar>
    </v-app-bar>
    <v-main>
      <VContainer fluid>
        <VRow>
          <VCol cols="3">
            <!-- <AudioList @click:select="onSelected" /> -->
          </VCol>
          <VCol>
            <!-- <AudioEditor ref="editor" /> -->
             <Synthesiser/>
          </VCol>
        </VRow>
      </VContainer>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import AudioList from './views/AudioList.vue';
import AudioEditor from './views/AudioEditor.vue';
import type { AudiStorageRecord } from './utils/audio-storage';
import { shallowRef } from 'vue';
import Synthesiser from './views/Synthesiser.vue';

const editor = shallowRef<InstanceType<typeof AudioEditor>>()

function onSelected({ id: record }: { id: AudiStorageRecord }) {
  console.log("Selected", record)
  editor.value?.loadBlob(record.blob)
}

</script>
