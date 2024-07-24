<template>
    <div class="knob-wrapper" ref="wrapper">
        <div class="knob-rotator v-theme--dark bg-grey-darken-4 v-btn--density-default" :style="{
            width: size + 'px',
            height: size + 'px',
        }">
            <div class="knob-mark">▲</div>

        </div>
        <span class="knob-value">{{ value.toFixed(2) }}</span>
    </div>
    <span v-if="label">{{ label }}</span>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, ref, shallowRef } from 'vue';
import InputKnobHandler from './InputKnobHandler';


/**
 * From: https://github.com/GoogleChromeLabs/input-knob
 */
const wrapper = shallowRef<HTMLDivElement>()
const props = withDefaults(defineProps<{
    modelValue?: number,
    step?: number,
    min?: number,
    max?: number,
    size?: number,
    label?: string
}>(), {
    modelValue: 0,
    step: 1,
    min: 0,
    max: 100,
    size: 100,
    label: 'Power'
})
let knob: InputKnobHandler
const value = ref(props.modelValue)
const emits = defineEmits<{(event: 'update:modelValue', value: number)}>()

onMounted(() => {
    knob = new InputKnobHandler(wrapper.value, value.value, 0)
    knob.onChange = emits.bind(this, 'update:modelValue')
})

onUnmounted(() => knob.destroy())

// onBeforeMount(() => {
//     rotator.value.style.width = rotator.value.style.height = `${props.size}px`
// })
</script>
<style lang="css">
.knob-wrapper {
    display: inline-block;
    position: relative;
}

.knob-value {
    position: absolute;
    margin: 0px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.knob-rotator {
    display: inline-block;
    touch-action: none;
    user-select: none;
    cursor: pointer;
    display: block;
    --angle: 0rad;
    transform: rotate(var(--angle));
    will-change: transform;
    height: 100%;
    width: 100%;
    box-sizing: border-box;
    /* background: lightblue; */
    /* border: 2px dashed blue; */
    border-radius: 100%;
    /* width: 100px;
    height: 100px; */
}

.knob-mark {
    display: inline-block;
    width: 100%;
    text-align: center;
    font: bold 200% monospace;
    color: white;
}
</style>