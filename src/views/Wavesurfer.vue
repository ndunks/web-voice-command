<template>
    <div id="wavesurfer-wrap"></div>
    <VAlert v-if="!$props.url">Choose or record a sound</VAlert>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, shallowRef, watch } from 'vue';
import WaveSurfer, { type WaveSurferOptions } from "@wavesurfer/wavesurfer";
import Regions, { type Region, type RegionEvents } from "@wavesurfer/plugins/regions";
import { calcPeakMinRms } from '@/utils/audio-utils';
import SpectrogramFFTPlugin from '@wavesurfer/plugins/spectrogram';

const props = defineProps<{
    url?: string
}>()

let instance: WaveSurfer | undefined
let regions: Regions
let sampleRate = 8000

function onRmsClick(this: Region, e: MouseEvent) {
    console.log('RMS', arguments)
}

function onRmsMove(this: Region) {
    console.log('MV', this)
    // calculate peak
    const ab = instance?.getDecodedData()
    const ofsStart = Math.round(sampleRate * this.start)
    const ofsEnd = Math.round(sampleRate * this.end)
    const buffers = ab?.getChannelData(0).slice(ofsStart, ofsEnd).map(v => Math.abs(v))

    const texts = [
        `Start: ${(this.start * 1000).toFixed(1)}`,
        `Length: ${((this.end - this.start) * 1000).toFixed(1)}ms`
    ]
    if (buffers?.length) {
        const result = calcPeakMinRms(buffers)
        Object.entries(result).forEach(([key, value]) => {
            texts.push(`${key}: ${value.toFixed(4)}`)
        })
    }

    console.log('buf', buffers);
    this.content!.innerHTML = texts.join('<br/>')

}

function onDecode(duration: number) {
    console.log('decode', arguments)
    const region = regions.addRegion({
        id: 'rms',
        start: 0,
        end: 0.1,
        content: 'RMS',
        drag: true,
        resize: true,
    })
    region.on('click', onRmsClick.bind(region))
    region.on('update-end', onRmsMove.bind(region))
    onRmsMove.apply(region);
}
function display(url?: string) {
    if (instance) {
        instance.destroy()
        instance = undefined
    }

    if (url) {
        // const spectogram = Spectrogram.create({
        //     labels: true,
        //     height: 300,
        //     splitChannels: true,
        //     windowFunc: 'bartlett',
        //     // labelsColor: 'red',
        //     frequencyMin: 0,
        //     frequencyMax: 1400
        // })

        regions = Regions.create()
        const fft = new SpectrogramFFTPlugin({
            scale: 'linear',
            colorMap: 'roseus',
            labels: true,
        });
        const fftM = new SpectrogramFFTPlugin({
            scale: 'mel',
            colorMap: 'roseus',
            labels: true,
        });

        instance = WaveSurfer.create({
            container: '#wavesurfer-wrap',
            waveColor: 'rgb(200, 0, 200)',
            url: url,
            mediaControls: true,
            sampleRate,
            plugins: [regions,, fftM, fft],
        })
        instance.on('decode', onDecode);

        (window as any)['wavesurfer'] = instance
    }

}

watch(props, ({ url }) => display(url))

onMounted(() => {
    console.log('Mounted', !!props.url, !!instance)
    display(props.url)
})
onUnmounted(() => {
    console.log('Unmount');
    instance?.destroy()
    instance = undefined
})

</script>
