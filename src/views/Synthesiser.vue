<template>
    <VRow>
        <VCol v-for="(v, i) in generators" cols="auto" style="width: 170px;">
            <Generator v-model:slider="v[0].value" v-model:knob="v[1].value" v-model:state="v[2].value" />
        </VCol>
    </VRow>
    <div class="mt-3">
        <VBtn @click="add">Add</VBtn>
    </div>
</template>
<script setup lang="ts">
import Generator from '@/parts/Generator.vue';

import { onUnmounted, Ref, ref, shallowRef, unref, watch, WatchStopHandle } from 'vue';

const generators = shallowRef([])


const watchers: WatchStopHandle[] = []

function onChange(this: [Ref<number>, Ref<number>, Ref<boolean>]) {
    console.log(this.map(unref));

}

function add(freq = 200, power = 0, state = true) {
    const item = [ref(freq), ref(power), ref(state)];
    watchers.push(watch(item, onChange.bind(item)))
    generators.value = [...generators.value, item]
}

add();

onUnmounted(() => {
    watchers.forEach(v => v())
})

</script>