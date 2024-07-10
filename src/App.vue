<template>
  <v-app>
    <v-app-bar>
      <template v-slot:prepend>
        <VBtn @click="isRecording ? mr.stop() : mr.start()" v-if="isMicOk" :color="isRecording ? 'error' : 'success'">
          <VIcon :icon="isRecording ? 'mdi-stop' : 'mdi-record'"></VIcon>
          {{ isRecording ? 'Stop' : 'Record' }}
        </VBtn>
        <VAlert color="warning" v-else v-text="waitingTxt"></VAlert>
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
        <Graph :buffer="audioBuffer" />
      </VContainer>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue';
import { VBtn, VContainer } from 'vuetify/components';

const isMicOk = ref(false)
const isRecording = ref(false);
const waitingTxt = ref('...')
const canPlay = computed(() => !isRecording.value && audio.value?.src)
const audio = shallowRef<HTMLAudioElement | null>(null)

const audioBuffer = shallowRef<AudioBuffer>()
const mediaBlob = shallowRef<Blob>()

let mr: MediaRecorder
let audioCtx: AudioContext

declare global {
  var mediaBlob: Blob
  var audioBuffer: AudioBuffer
}
watch(mediaBlob, (blob) => {

  if (!blob) return

  if (!audioCtx) {
    audioCtx = new AudioContext({
      sampleRate: mr.audioBitsPerSecond
    });
  }
  // Playable URL
  audio.value!.src = URL.createObjectURL(blob)

  // Decode audio
  blob.arrayBuffer().then(arrayBuffer => {
    console.log('mediaBlob', arrayBuffer)
    audioCtx.decodeAudioData(arrayBuffer)
      .then((buffer) => {
        audioBuffer.value = window.audioBuffer = buffer

        console.log('audioBuffer', buffer)
        // const az = audioCtx.createAnalyser()
        // console.log('Analizer', az.frequencyBinCount, az.channelCount, az.fftSize)

      }).catch(
        e => {
          console.error(e)
        }
      )
  })
})

function setupRecorder(stream: MediaStream) {
  mr = new MediaRecorder(stream, { audioBitsPerSecond: 16000 });
  let counter = 0
  const chunks: Blob[] = []

  mr.ondataavailable = (e => {
    console.timeLog('record', ++counter)
    chunks.push(e.data)
  })

  mr.onstart = () => {
    counter = 0
    console.time('record')
    isRecording.value = true
    chunks.splice(0, chunks.length)
    setTimeout(() => mr.stop(), 1000)
  }

  mr.onstop = (s) => {
    isRecording.value = false
    // console.timeLog('record', 'End')
    console.timeEnd('record')

    if (chunks.length < 1)
      return;

    else if (chunks.length == 1)
      mediaBlob.value = window.mediaBlob = chunks[0]
    else
      mediaBlob.value = window.mediaBlob = new Blob(chunks, { type: chunks[0].type })
  }
}

navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    isMicOk.value = true
    setupRecorder(stream)
  }).catch(e => {
    waitingTxt.value = 'Cannot access microphone.'
  })

</script>
