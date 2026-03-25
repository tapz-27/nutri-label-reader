<template>
  <div class="image-cropper w-100 h-100 d-flex flex-column bg-black pb-4">
    <div class="flex-grow-1 w-100 position-relative">
      <VueCropper
        ref="cropperRef"
        :img="imageUrl"
        :outputType="'jpeg'"
        :autoCrop="true"
        :autoCropWidth="250"
        :autoCropHeight="350"
        :fixed="false"
        :centerBox="true"
        :infoTrue="true"
        mode="contain"
      />
    </div>

    <!-- Cropper Controls -->
    <v-row class="flex-grow-0 mt-4 px-4" justify="center">
      <v-col cols="6">
        <v-btn block variant="outlined" size="x-large" @click="$emit('retake')">Retake</v-btn>
      </v-col>
      <v-col cols="6">
        <v-btn block size="x-large" @click="confirmCrop">Crop</v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import 'vue-cropper/dist/index.css'
import { VueCropper }  from 'vue-cropper'

const props = defineProps({
  imageUrl: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['cropped', 'retake'])
const cropperRef = ref(null)

const confirmCrop = () => {
  if (cropperRef.value) {
    // Extract cropped image as Base64 dataURL
    cropperRef.value.getCropData((data) => {
      // (Future phase: Apply grayscale canvas contrast enhancements here using useImageProcessor)
      emit('cropped', data)
    })
  }
}
</script>

<style scoped>
/* Ensures cropper takes exact parent dimensions */
.vue-cropper {
  position: absolute !important;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100% !important;
  height: 100% !important;
}
</style>
