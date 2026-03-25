<template>
  <div class="camera-capture w-100 h-100 d-flex justify-center align-center position-relative">
    <video 
      ref="videoElement" 
      autoplay 
      playsinline 
      class="w-100 h-100" 
      style="object-fit: cover; border-radius: 8px;"
    ></video>
    
    <!-- Hidden canvas for capturing frames -->
    <canvas ref="canvasElement" class="d-none"></canvas>
    
    <div v-if="error" class="position-absolute bg-error text-white pa-2 rounded text-center" style="z-index: 10;">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useCamera } from '../composables/useCamera'

const { videoStream, error, startCamera, stopCamera } = useCamera()
const videoElement = ref(null)
const canvasElement = ref(null)

// Hook up the stream to the HTML video element when available
watch(videoStream, (newStream) => {
  if (videoElement.value && newStream) {
    videoElement.value.srcObject = newStream
  }
})

// Expose a capture frame method for the parent ScannerView to call
const captureFrame = () => {
  if (!videoElement.value || !canvasElement.value) return null
  
  const video = videoElement.value
  const canvas = canvasElement.value
  
  // Set canvas dimensions to match video intrinsic dimensions
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  
  const ctx = canvas.getContext('2d')
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
  
  // Return the image data URL (base64 jpeg at 90% quality)
  return canvas.toDataURL('image/jpeg', 0.9)
}

// Expose explicitly for script setup
defineExpose({ captureFrame })

onMounted(() => {
  // Auto-start with no wind-up when the component loads
  startCamera()
})

onUnmounted(() => {
  // Cleanly shut down device camera when navigating away
  stopCamera()
})
</script>

<style scoped>
</style>
