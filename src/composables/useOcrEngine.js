import { ref } from 'vue'
import Tesseract from 'tesseract.js'
import { useToast } from "vue-toastification"

export function useOcrEngine() {
  const isProcessing = ref(false)
  const progress = ref(0)
  const status = ref('')
  const rawText = ref('')
  const error = ref(null)
  
  // Safe toast instance fetcher wrapper in case it's not setup fully globally yet
  const getToast = () => {
    try {
      return useToast()
    } catch {
      return { success: console.log, error: console.error }
    }
  }

  let worker = null

  const initializeWorker = async () => {
    try {
      worker = await Tesseract.createWorker('eng', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            progress.value = Math.floor(m.progress * 100)
            status.value = 'Reading nutrition facts...'
          } else {
            // "loading tesseract core", "initializing api", etc
            status.value = 'Preparing local analysis engine...'
          }
        }
      })
    } catch (err) {
      console.error(err)
      getToast().error("Failed to load OCR offline engine.")
      error.value = err
      throw err
    }
  }

  const recognizeText = async (processedImageBase64) => {
    if (!worker) await initializeWorker()
    
    isProcessing.value = true
    error.value = null
    progress.value = 0
    rawText.value = ''
    
    try {
      const { data: { text } } = await worker.recognize(processedImageBase64)
      rawText.value = text
      getToast().success("Scan complete!")
    } catch (err) {
      console.error("OCR Error:", err)
      getToast().error("Failed to read image pixels.")
      error.value = err
    } finally {
      isProcessing.value = false
      status.value = ''
    }
    
    return rawText.value
  }

  const terminateWorker = async () => {
    if (worker) {
      await worker.terminate()
      worker = null
    }
  }

  return {
    isProcessing,
    progress,
    status,
    rawText,
    error,
    recognizeText,
    terminateWorker
  }
}
