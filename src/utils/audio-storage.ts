import { shallowRef } from "vue"

const dbName = 'audio-storage'
const storeName = 'list'
export type AudiStorageRecord = {
    key: IDBValidKey,
    name: string,
    blob: Blob
}

class AudioStorage {
    hasSavedData = false
    audioLists = shallowRef<AudiStorageRecord[]>([])
    db?: IDBDatabase

    constructor() {
        if (typeof window['indexedDB'] == undefined) {
            console.debug('indexedDB not supported')
        } else {
            const openDB = indexedDB.open(dbName, 1);
            openDB.onerror = console.debug
            openDB.onsuccess = () => {
                this.db = openDB.result
                this.load()
            }
            openDB.onupgradeneeded = (e) => {
                this.db = (e.target as any).result

                if (!this.db) throw new Error('AudioStorage Not ready')
                this.db.createObjectStore(storeName, { autoIncrement: true })
            }
        }
    }

    private load() {

        return new Promise((r, j) => {

            if (!this.db) return j(new Error('AudioStorage Not ready'))

            const audioLists: AudiStorageRecord[] = []
            let transactionReq: IDBTransaction

            try {
                transactionReq = this.db.transaction(storeName, 'readonly')
            } catch (error) {
                console.debug('AudioStorage error', error)
                return r(this)
            }

            const cursorRequest = transactionReq.objectStore(storeName).openCursor()
            cursorRequest.onerror = ((e) => {
                console.debug('AudioStorage error', e)
                r(this)
            })
            cursorRequest.onsuccess = (e) => {
                const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result
                if (!cursor) {
                    return r(this.audioLists.value = audioLists)
                }

                audioLists.push({ key: cursor.key, ...cursor.value })
                cursor.continue()
            }
        })
    }

    delete(id: IDBValidKey) {
        return new Promise((r, j) => {
            if (!this.db) if (!this.db) return j(new Error('AudioStorage Not ready'))

            const transaction = this.db.transaction(storeName, 'readwrite');
            transaction.objectStore(storeName).delete(id);
            transaction.onerror = j
            // Report that the data item has been deleted
            transaction.oncomplete = () => {
                this.audioLists.value = this.audioLists.value.filter((v) => v.key != id)
                r(true)
            };
        })
    }

    saveUrl(url: string, name?: string) {
        return fetch(url)
            .then(r => r.blob())
            .then(v => this.saveBlob(v, name))
    }

    saveBlob(blob: Blob, name?: string) {
        const max = this.audioLists.value.length > 0 ?
         parseInt( this.audioLists.value[this.audioLists.value.length-1].key.toString() )
         : 0

        name = name || `Audio ${max + 1}`
        return new Promise((r, j) => {

            if (!this.db) return j(new Error('AudioStorage Not ready'))

            const transaction = this.db.transaction(storeName, 'readwrite')
            transaction.onerror = j
            transaction.oncomplete = (e) => {
                r(null)
            }
            const objectStore = transaction.objectStore(storeName)
            const objectStoreRequest = objectStore.add({
                name, blob
            })

            objectStoreRequest.onsuccess = (e) => {
                // add to list
                this.audioLists.value = [...this.audioLists.value, {
                    key: objectStoreRequest.result,
                    blob, name
                }]
            }
        })
    }
}

let instance: AudioStorage;

export default function useAudioStorage(): AudioStorage {
    return instance ? instance : (instance = new AudioStorage())
}