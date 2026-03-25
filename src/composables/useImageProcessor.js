export function useImageProcessor() {
  /**
   * Applies aggressive grayscale and strict binary contrast to a Base64 image
   * to optimize it heavily for Tesseract.js OCR.
   * @param {String} base64String - The cropped image from vue-cropper
   * @returns {Promise<String>} - The processed high-contrast Base64 image
   */
  const processForOcr = (base64String) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        canvas.width = img.width
        canvas.height = img.height
        
        // Draw original
        ctx.drawImage(img, 0, 0)
        
        // Get pixel data safely
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data
        
        // Binary threshold cutoff (adjust between 100-150 depending on lighting)
        const threshold = 120 
        
        for (let i = 0; i < data.length; i += 4) {
          // Calculate true grayscale value per pixel
          const avg = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114)
          
          // Force pixel to be either pure black or pure white (maximum contrast)
          const bwValue = avg > threshold ? 255 : 0
          
          data[i]     = bwValue // Red
          data[i + 1] = bwValue // Green
          data[i + 2] = bwValue // Blue
          // Alpha left untouched at data[i + 3]
        }
        
        // Push processed pixels back to canvas
        ctx.putImageData(imageData, 0, 0)
        
        // Export high contrast jpeg
        resolve(canvas.toDataURL('image/jpeg', 1.0))
      }
      img.onerror = reject
      img.src = base64String
    })
  }

  return { processForOcr }
}
