import { ref } from 'vue'

export function useCamera() {
  const videoStream = ref(null)
  const error = ref(null)

  const startCamera = async () => {
    error.value = null
    try {
      // Prefer the rear camera for scanning labels
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      })
      videoStream.value = stream
    } catch (err) {
      console.error("Error accessing camera:", err)
      error.value = "Failed to access camera. Please check device permissions."
    }
  }

  const stopCamera = () => {
    if (videoStream.value) {
      videoStream.value.getTracks().forEach(track => track.stop())
      videoStream.value = null
    }
  }

  return { 
    videoStream, 
    error, 
    startCamera, 
    stopCamera 
  }
}
