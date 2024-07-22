<template>
    <VCard variant="tonal">
        <VToolbar title="Audio Editor">
            <template #append>
                <VAlert v-if="state == 'off'" v-text="msg" />
                <template v-else>
                    <VBtn @click="state == 'recording' ? mr.stop() : mr.start()"
                        :color="state == 'recording' ? 'error' : 'success'">
                        <VIcon :icon="state == 'recording' ? 'mdi-stop' : 'mdi-record'"></VIcon>
                        {{ state == 'recording' ? 'Stop' : 'Record' }}
                    </VBtn>

                    <VBtn @click="onSave" :disabled="noData" class="ms-2">
                        <VIcon icon="mdi-content-save"></VIcon>
                        Save
                    </VBtn>
                </template>

            </template>
        </VToolbar>
        <VCardText>
            <Wavesurfer :url="mediaUrl" />
        </VCardText>
    </VCard>
</template>

<script setup lang="ts">
import { VAlert, VCardText } from 'vuetify/components';
import { computed, onMounted, ref, shallowRef, watch } from 'vue';
import { VBtn, VContainer } from 'vuetify/components';
import Wavesurfer from './Wavesurfer.vue';
import useAudioStorage from '@/utils/audio-storage';

const state = shallowRef<'off' | 'on' | 'recording' | 'paused' | 'playing'>('off')

const msg = shallowRef('Allow microphone to record');
const audioBuffer = shallowRef<AudioBuffer>()
const mediaBlob = shallowRef<Blob>()
const mediaUrl = shallowRef<string>()
const noData = computed(() => !mediaUrl.value)

let mr: MediaRecorder
let audioCtx: AudioContext
const audioBitsPerSecond = 8000
declare global {
    var mediaBlob: Blob
    var audioBuffer: AudioBuffer
}

const audioStorage = useAudioStorage()

function onSave() {
    if (mediaBlob.value) {
        audioStorage.saveBlob(mediaBlob.value)
    }
}

defineExpose({
    loadBlob(blob: Blob) {
        mediaBlob.value = blob
    }
})

watch(mediaBlob, (blob) => {

    if (!blob) return

    if (!audioCtx) {
        audioCtx = new AudioContext({
            sampleRate: audioBitsPerSecond
        });
    }
    // Playable URL
    mediaUrl.value = URL.createObjectURL(blob)
})

function setupRecorder(stream: MediaStream) {
    mr = new MediaRecorder(stream, { audioBitsPerSecond });
    let counter = 0
    const chunks: Blob[] = []

    mr.ondataavailable = (e => {
        console.timeLog('record', ++counter)
        chunks.push(e.data)
    })

    mr.onstart = () => {
        counter = 0
        console.time('record')
        state.value = 'recording'
        chunks.splice(0, chunks.length)
        // setTimeout(() => mr.stop(), 1000)
    }

    mr.onstop = (s) => {
        state.value = 'paused'
        // console.timeLog('record', 'End')
        console.timeEnd('record')

        if (chunks.length < 1)
            return;

        else if (chunks.length == 1)
            mediaBlob.value = window.mediaBlob = chunks[0]
        else
            mediaBlob.value = window.mediaBlob = new Blob(chunks, { type: chunks[0].type })
    }
    state.value = 'on'
}
navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
        setupRecorder(stream)
    }).catch(e => {
        msg.value = 'Cannot access microphone. Reload the page.'
    })
</script>