<template>
    <div style="min-height: 182px;" ref="container"></div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, shallowRef, watch } from 'vue';
import WaveSurfer, { type WaveSurferOptions } from "@wavesurfer/wavesurfer";
import Spectrogram from "@wavesurfer/plugins/spectrogram";

const props = defineProps<{
    url?: string
}>()

const container = shallowRef<HTMLDivElement>()

let instance: WaveSurfer | undefined

watch(props, ({ url }) => {
    if (instance) {
        instance.destroy()
        instance = undefined
    }
    
    if (url) {
        const spectogram = Spectrogram.create({
            labels: true,
            height: 200,
            splitChannels: true
        })

        console.log('WaveSurfer.create')
        instance = WaveSurfer.create({
            container: container.value!,
            waveColor: 'rgb(200, 0, 200)',
            url: url,
            mediaControls: true,
            plugins: [spectogram]
        })
        // instance.registerPlugin(

        // )
    }

}, {
    immediate: true
})


</script>