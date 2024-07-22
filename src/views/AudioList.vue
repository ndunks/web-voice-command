<template>
    <VCard title="Saved Audio">
        <VList v-bind="$attrs" :items="storage.audioLists.value" item-title="name" return-object item-value="key">
            <template #append="{ item }">
                <VIcon icon="mdi-close" @click="removeItem(item)" />
            </template>
        </VList>
    </VCard>
</template>
<script setup lang="ts">
import useAudioStorage, { type AudiStorageRecord } from '@/utils/audio-storage';

const storage = useAudioStorage()
function removeItem(item: AudiStorageRecord) {
    if (!confirm(`Remove ${item.name} ?`))
        return;
    storage.delete(item.key)
}
</script>