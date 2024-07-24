<template>
    <VSheet border rounded class="pa-2 text-center" color="grey-darken-3">
        <div class="text-caption">{{ sliderLabel }}</div>
        <VSlider direction="vertical" v-model="sliderValue" :min="1" :max="3000" :step="1">
            <template v-slot:append>
                <v-text-field step v-model="sliderValue" variant="solo" density="compact" style="width: 110px"
                    type="number" hide-details single-line>
                    <template #append-inner>Hz</template>
                </v-text-field>
            </template>
        </VSlider>
        <v-btn @click="$emit('update:state', !state)" :color="state ? 'success' : ''">
            {{ state ? 'ON' : 'off' }}
        </v-btn>
    </VSheet>
    <VSheet border rounded class="pa-2 text-center mt-4" color="grey-darken-3">
        <InputKnob v-model="knobValue" :label="knobLabel" />
    </VSheet>
</template>
<script setup lang="ts">
import InputKnob from '@/parts/InputKnob.vue';

const sliderValue = defineModel<number>("slider")
const knobValue = defineModel<number>("knob")
const state = defineModel<boolean>("state")

withDefaults(defineProps<{
    sliderLabel?: string,
    knobLabel?: string
}>(), {
    sliderLabel: 'Frequency',
    knobLabel: 'Energy'
})



</script>