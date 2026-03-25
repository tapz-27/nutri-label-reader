<template>
  <v-card variant="flat" class="bg-transparent w-100">
    <!-- Header with Copy Logic -->
    <div class="d-flex align-center justify-space-between mb-4">
      <h3 class="text-h6 text-white font-weight-bold">Mass Metrics</h3>
      <v-btn 
        variant="tonal" 
        size="small" 
        color="white" 
        prepend-icon="mdi-content-copy"
        @click="copyToClipboard"
      >
        Copy Data
      </v-btn>
    </div>

    <!-- Data Table -->
    <v-table theme="dark" class="bg-grey-darken-4 rounded-lg overflow-hidden border">
      <thead>
        <tr>
          <th class="text-left text-grey">Target Anchor</th>
          <th class="text-right text-grey">Amount</th>
          <th class="text-right text-grey">% DV</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(metric, key) in data" :key="key">
          <td class="text-capitalize font-weight-medium" :class="{'text-white': metric, 'text-grey-darken-1': !metric}">
            {{ formatKey(key) }}
          </td>
          <td class="text-right font-weight-bold" :class="metric ? 'text-white' : 'text-grey-darken-1'">
            {{ metric ? metric.value + metric.unit : '—' }}
          </td>
          <td class="text-right font-weight-bold" :class="metric && metric.percentDV ? 'text-white' : 'text-grey-darken-1'">
            {{ metric && metric.percentDV ? metric.percentDV + '%' : '—' }}
          </td>
        </tr>
      </tbody>
    </v-table>
  </v-card>
</template>

<script setup>
import { useToast } from "vue-toastification";

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

const toast = useToast()

const formatKey = (key) => {
  return key.replace(/([A-Z])/g, ' $1').trim()
}

const copyToClipboard = async () => {
  const text = Object.entries(props.data)
    .map(([key, metric]) => {
      const formattedKey = formatKey(key)
      if (!metric) return `${formattedKey}: Not found`
      
      const dv = metric.percentDV ? ` (${metric.percentDV}% DV)` : ''
      return `${formattedKey}: ${metric.value}${metric.unit}${dv}`
    })
    .join('\n')
  
  try {
    await navigator.clipboard.writeText(text)
    toast.success("Metrics copied to clipboard!")
  } catch (err) {
    toast.error("Failed to copy data.")
  }
}
</script>

<style scoped>
.v-table {
  border-color: #333 !important;
}
</style>
