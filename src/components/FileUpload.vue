<template>
  <div class="file-upload w-100 px-4">
    <v-file-input
      label="Select Label Image"
      variant="outlined"
      prepend-icon="mdi-camera-burst"
      accept="image/*"
      @change="handleFileChange"
      hide-details
      class="mb-4"
    ></v-file-input>
    
    <v-btn block variant="outlined" size="large" @click="$emit('cancel')">
      Back to Camera
    </v-btn>
  </div>
</template>

<script setup>
const emit = defineEmits(['image-selected', 'cancel'])

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    emit('image-selected', e.target.result)
  }
  reader.readAsDataURL(file)
}
</script>
