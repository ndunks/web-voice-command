<template>
  <v-app>
    <v-app-bar>
      <template v-slot:prepend>
        <VBtn @click="btnClick" v-if="isMicOk" :color="isRecording ? 'error' : 'success'">
          <VIcon :icon="isRecording ? 'mdi-stop' : 'mdi-record'"></VIcon>
          {{ isRecording ? 'Stop' : 'Record' }}
        </VBtn>
        <VAlert v-else v-text="waitingTxt"></VAlert>
      </template>
      <template v-slot:append>
        <VBtn :disabled="!canPlay" @click="audio?.paused ? audio.play() : audio?.pause()">
          <VIcon :icon="audio?.paused ? 'mdi-play' : 'mdi-pause'"></VIcon>
          Play
        </VBtn>
      </template>
    </v-app-bar>
    <v-main>
      <VContainer>
        <audio loop ref="audio"></audio>
      </VContainer>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue';
import { VBtn, VContainer } from 'vuetify/components';
const isMicOk = ref(false)
const isRecording = ref(false);
const waitingTxt = ref('Waiting microphone..')
const canPlay = computed(() => !isRecording.value && audio.value?.src)
const audio = shallowRef<HTMLAudioElement | null>(null)

let mr: MediaRecorder

var chunks: Blob[] = window.chunks = []

declare global {
  var chunks: Blob[]
}


navigator.mediaDevices.getUserMedia({ // <1>
  video: false,
  audio: true,
}).then(stream => {
  isMicOk.value = true
  setupRecorder(stream)
}).catch(e => {
  waitingTxt.value = 'Cannot access microphone.'
})

function btnClick() {
  if (isRecording.value) {
    mr.stop()
  } else {
    chunks.splice(0, chunks.length)
    mr.start()
  }
}

function setupRecorder(stream: MediaStream) {
  mr = new MediaRecorder(stream);
  let counter = 0

  mr.ondataavailable = (e => {
    console.timeLog('record', ++counter)
    chunks.push(e.data)
  })

  mr.onstart = () => {
    counter = 0
    console.time('record')
    console.timeLog('record', 'Start')
    isRecording.value = true
  }

  mr.onstop = (s) => {
    isRecording.value = false
    console.timeLog('record', 'End')
    console.timeEnd('record')
    let blob: Blob
    if (chunks.length < 1)
      return;
    else if (chunks.length == 1)
      blob = chunks[0]
    else
      blob = new Blob(chunks, { type: chunks[0].type })
    audio.value!.src = URL.createObjectURL(blob)
  }
}

//
</script>
