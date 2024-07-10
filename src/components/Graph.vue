<template>
    <CanvasJSChart ref="chart" :options="options" />
</template>

<script setup lang="ts">
import { nextTick, onMounted, shallowRef, watch } from 'vue';

const options = {
    zoomEnabled: true,
    theme: 'dark1',
    title: {
        text: "Try Zooming & Panning"
    },
    axisY: {
        minimum: -1,
        maximum: 1
    },
    data: [] as any[]
}
const chart = shallowRef<any>()
const props = defineProps<{ buffer: AudioBuffer }>();

onMounted(() => {

})

watch(props, ({ buffer }) => {
    console.log('GBytes', buffer)
    if (!buffer) return
    const fa = buffer.getChannelData(0);
    const dataPoints = Array.prototype.map.call(fa, (y) => ({ y }))
    console.log('CH0', fa.BYTES_PER_ELEMENT, fa.byteLength, fa.length, dataPoints)

    chart.value.chart.options.data[0] = {
        type: "line",
        dataPoints
    }

    nextTick(() => chart.value.chart.render())
})


</script>