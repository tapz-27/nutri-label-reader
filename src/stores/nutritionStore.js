import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNutritionStore = defineStore('nutrition', () => {
  const scannedItems = ref([])

  function addLog(data) {
    scannedItems.value.push(data)
  }

  return { scannedItems, addLog }
})
