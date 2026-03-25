<template>
  <v-container class="d-flex flex-column align-center justify-center fill-height pa-4 mx-auto" style="max-width: 450px;">
    
    <!-- Main Scanner/Cropper Area -->
    <div class="w-100 position-relative bg-grey-darken-4 elevation-6" style="aspect-ratio: 3/4; border-radius: 16px; overflow: hidden; border: 2px solid #333;">
      
      <CameraCapture 
        ref="cameraCaptureRef"
        v-if="currentStep === 'camera' && isCameraActive" 
        class="position-absolute align-center justify-center w-100 h-100" 
      />
      
      <div v-else-if="currentStep === 'camera' && !isCameraActive" class="position-absolute w-100 h-100 d-flex flex-column justify-center align-center">
        <v-icon icon="mdi-camera-off" size="x-large" class="mb-4 text-grey"></v-icon>
        <p class="text-grey font-weight-medium">Camera is Off</p>
      </div>
      
      <!-- File Upload View -->
      <div v-else-if="currentStep === 'upload'" class="position-absolute w-100 h-100 d-flex flex-column justify-center align-center bg-grey-darken-4">
        <FileUpload @image-selected="handleImageSelected" @cancel="handleRetake" />
      </div>
      
      <!-- Image Cropper Step -->
      <ImageCropper 
        v-else-if="currentStep === 'cropper'" 
        :imageUrl="rawImage" 
        @cropped="handleCroppedImage"
        @retake="handleRetake"
        class="position-absolute w-100 h-100"
      />

      <!-- OCR Processing Loader -->
      <div v-else-if="currentStep === 'processing'" class="position-absolute w-100 h-100 d-flex flex-column justify-center align-center bg-grey-darken-4 px-6 text-center">
        <!-- Circular Progress simulating Tesseract internal progress logger -->
        <h1 class="text-white mb-4 text-h3 font-weight-black">{{ progress }}%</h1>
        <h3 class="text-white">{{ status }}</h3>
        <p class="text-grey-lighten-1 mt-2">Running offline local text analysis. This may take a few seconds on older phones.</p>
      </div>

      <!-- Results Step -->
      <div v-else-if="currentStep === 'results'" class="position-absolute w-100 h-100 d-flex flex-column bg-grey-darken-4 pa-4 overflow-y-auto w-100">
        <ResultsTable :data="parsedData" />

        <!-- Debug Raw Toggle -->
        <v-btn variant="text" size="small" density="compact" class="text-grey mt-4" @click="showRaw = !showRaw">
          {{ showRaw ? 'Hide Raw OCR Text' : 'Show Raw OCR Text' }}
        </v-btn>
        
        <v-card v-if="showRaw" class="bg-black pa-2 mt-2" style="border: 1px solid #333; max-height: 100px; overflow-y: auto;">
          <pre class="text-grey" style="font-size: 0.7rem; white-space: pre-wrap;">{{ extractedText }}</pre>
        </v-card>

        <v-btn block color="white" class="mt-4 text-black font-weight-bold" size="large" @click="handleRetake">New Scan</v-btn>
      </div>

    </div>

    <!-- Controls Area: Tightly packed flex row without grid padding -->
    <div v-if="currentStep === 'camera' || currentStep === 'upload'" class="d-flex w-100 align-center justify-space-between mt-6" style="gap: 16px;">
      
      <!-- Camera Toggle Button -->
      <v-btn 
        variant="outlined" 
        @click="toggleCamera"
        class="flex-shrink-0 px-0"
        style="min-width: 68px; height: 68px; border-radius: 14px; border-width: 2px;"
      >
        <v-icon size="x-large">{{ isCameraActive ? 'mdi-camera-off' : 'mdi-camera' }}</v-icon>
      </v-btn>
      
      <!-- Main Capture Button -->
      <v-btn 
        variant="flat"
        color="white"
        class="flex-grow-1 text-black font-weight-bold" 
        style="height: 68px; font-size: 1.15rem; border-radius: 14px;"
        :disabled="!isCameraActive || currentStep !== 'camera'"
        @click="handleCapture"
      >
        Capture Photo
      </v-btn>

      <!-- Upload File Button -->
      <v-btn 
        variant="outlined" 
        class="flex-shrink-0 px-0"
        style="min-width: 68px; height: 68px; border-radius: 14px; border-width: 2px;"
        @click="currentStep = 'upload'"
      >
        <v-icon size="x-large">mdi-image-multiple</v-icon>
      </v-btn>
      
    </div>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import CameraCapture from './CameraCapture.vue'
import FileUpload from './FileUpload.vue'
import ImageCropper from './ImageCropper.vue'
import ResultsTable from './ResultsTable.vue'
import { useImageProcessor } from '../composables/useImageProcessor'
import { useOcrEngine } from '../composables/useOcrEngine'
import { useNutritionParser } from '../composables/useNutritionParser'

const { processForOcr } = useImageProcessor()
const { isProcessing, progress, status, recognizeText, terminateWorker } = useOcrEngine()
const { parseText } = useNutritionParser()

// State to manage which component is currently active
const currentStep = ref('camera') // 'camera', 'upload', 'cropper', 'processing', 'results'
const isCameraActive = ref(true)

// Results state
const extractedText = ref('')
const parsedData = ref({})
const showRaw = ref(false)

// Holds the raw captured image (base64)
const rawImage = ref(null)

// Reference to access child component methods
const cameraCaptureRef = ref(null)

const toggleCamera = () => {
  isCameraActive.value = !isCameraActive.value
}

const handleImageSelected = (base64) => {
  rawImage.value = base64
  isCameraActive.value = false
  currentStep.value = 'cropper'
}

const handleCapture = () => {
  if (cameraCaptureRef.value) {
    const rawDataUrl = cameraCaptureRef.value.captureFrame()
    if (rawDataUrl) {
      rawImage.value = rawDataUrl
      isCameraActive.value = false // Gracefully stop camera
      currentStep.value = 'cropper' // Transition to cropper step
    }
  }
}

// Emitted from ImageCropper when user finalizes crop
const handleCroppedImage = async (croppedDataUrl) => {
  // Switch immediately to processing loader
  currentStep.value = 'processing'
  
  try {
    // 1. Convert cropped bounding box to high-contrast B&W for OCR
    const optimizedImage = await processForOcr(croppedDataUrl)
    
    // 2. Pass strictly black-and-white matrix to Tesseract Worker
    const textBlob = await recognizeText(optimizedImage)
    extractedText.value = textBlob
    
    // 3. Regex Analysis to extract values
    parsedData.value = parseText(textBlob)
    
    // 4. Clear the massive WASM worker from memory to stop memory leaks
    await terminateWorker()
    
    // Move to final Results view
    currentStep.value = 'results'
    
  } catch (error) {
    console.error("Pipeline failed", error)
    handleRetake() // fallback to camera on failure
  }
}

// User wants to discard and retake photo or scan again
const handleRetake = () => {
  extractedText.value = ''
  rawImage.value = null
  currentStep.value = 'camera'
  isCameraActive.value = true
}
</script>

<style scoped>
</style>
