<template>
  <form class="task-form" @submit.prevent="handleSubmit">
    <div class="task-row">
      <input
        v-model="newTask"
        type="text"
        placeholder="Nova tarefa..."
        class="task-input"
      />
      <button type="submit" class="task-button" :disabled="uploading">
        {{ editingTask ? 'Alterar' : 'Adicionar' }}
      </button>
      <button
        v-if="editingTask"
        type="button"
        class="task-button-cancel"
        @click="handleCancel"
      >
        Cancelar
      </button>
    </div>


    <div class="image-section">
      <img
        v-if="previewUrl || editingTask?.img_url"
        :src="previewUrl || editingTask?.img_url"
        class="image-preview"
        alt="Imagem da tarefa"
      />

      <label class="image-label" :class="{ disabled: uploading }">
        <span v-if="uploading" class="upload-status">Enviando...</span>
        <span v-else>Adicionar imagem</span>
        <input
          type="file"
          accept="image/jpeg,image/png"
          capture="environment"
          class="image-input"
          :disabled="uploading"
          @change="handleImageChange"
        />
      </label>

      <button
        type="button"
        class="task-button-secondary"
        @click="showCameraCapture = !showCameraCapture"
      >
        {{ showCameraCapture ? 'Fechar câmera' : 'Abrir preview ao vivo' }}
      </button>

      <CameraCapture
        v-if="showCameraCapture"
        @captured="handleCameraCapture"
      />
    </div>

    <!-- Seção de Geolocalização -->
    <div class="location-section">
      <div class="location-actions">
        <button
          type="button"
          class="btn-geo"
          :disabled="loadingLocation"
          @click="handleGetLocation"
        >
          {{ loadingLocation ? 'Buscando...' : 'Obter Localização' }}
        </button>

        <button
          v-if="location"
          type="button"
          class="btn-clear"
          @click="clearLocation"
        >
          Remover Localização
        </button>
      </div>

      <p v-if="locationError" class="geo-error">{{ locationError }}</p>

      <div v-if="location" class="location-preview">

        <span v-if="accuracyLevel" :class="`accuracy-badge accuracy-badge--${accuracyLevel}`">
          Precisão {{ accuracyLevel }}
        </span>

        <p v-if="location.label"><strong>Endereço:</strong> {{ location.label }}</p>
        <p class="coords">
          <small>Lat: {{ location.latitude }} | Lng: {{ location.longitude }}</small>
        </p>


        <label class="privacy-option">
          <input type="checkbox" v-model="useApproximateLocation" />
          Salvar localização aproximada (privacidade)
        </label>

        <TaskLocationMap :location="displayLocation" />

        <p class="location-mode-info">
          {{ useApproximateLocation ? 'Exibindo: Localização aproximada (~1km)' : 'Exibindo: Localização exata' }}
        </p>
      </div>
    </div>
  </form>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import tasksApi from '../api/tasksApi.js'
import CameraCapture from './CameraCapture.vue'
import TaskLocationMap from './TaskLocationMap.vue'
import { useGeolocation } from '../composables/useGeolocation.js'
import geocodingApi from '../api/geocodingApi.js'
import { classifyAccuracy, roundCoordinate, buildLocationPayload } from '../utils/location.js'

const showCameraCapture = ref(false)
const useApproximateLocation = ref(false)

const props = defineProps({
  editingTask: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['add', 'update', 'cancel'])
const newTask = ref('')
const previewUrl = ref(null)
const imgAttachmentKey = ref(null)
const uploading = ref(false)

const {
  loadingLocation,
  locationError,
  location,
  requestCurrentLocation,
  clearLocation,
  setLocationFromTask,
  setLocationLabel
} = useGeolocation()


const accuracyLevel = computed(() => classifyAccuracy(location.value?.accuracy))


const displayLocation = computed(() => {
  if (!location.value) return null
  if (!useApproximateLocation.value) return location.value

  return {
    ...location.value,
    latitude: roundCoordinate(location.value.latitude),
    longitude: roundCoordinate(location.value.longitude),
  }
})

watch(
  () => props.editingTask,
  (task) => {
    newTask.value = task ? task.title : ''
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
    imgAttachmentKey.value = null

    if (task) {
      setLocationFromTask(task)
    } else {
      clearLocation()
    }
  },
)

async function handleImageChange(event) {
  const file = event.target.files[0]
  if (!file) return
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = URL.createObjectURL(file)
  uploading.value = true
  try {
    const response = await tasksApi.uploadImage(file)
    imgAttachmentKey.value = response.data.attachment_key
  } catch (err) {
    console.error('Erro ao fazer upload da imagem', err)
    previewUrl.value = null
    imgAttachmentKey.value = null
  } finally {
    uploading.value = false
  }
}

async function handleGetLocation() {
  const captured = await requestCurrentLocation()
  if (!captured) return

  try {
    const address = await geocodingApi.reverse(
      captured.latitude,
      captured.longitude
    )
    setLocationLabel(address?.label)
  } catch {
    locationError.value = 'Localização obtida, mas não foi possível identificar a rua.'
  }
}

function handleSubmit() {
  if (!newTask.value.trim()) return


  const payload = {
    title: newTask.value.trim(),
    ...buildLocationPayload(displayLocation.value)
  }

  if (imgAttachmentKey.value) {
    payload.imgAttachmentKey = imgAttachmentKey.value
  }

  if (props.editingTask) {
    emit('update', props.editingTask.id, payload)
  } else {
    emit('add', payload)
  }

  newTask.value = ''
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = null
  imgAttachmentKey.value = null
  useApproximateLocation.value = false
  clearLocation()
}

function handleCancel() {
  newTask.value = ''
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = null
  imgAttachmentKey.value = null
  useApproximateLocation.value = false
  clearLocation()
  emit('cancel')
}

function handleCameraCapture(file) {
  previewUrl.value = URL.createObjectURL(file)
  uploading.value = true
  tasksApi
    .uploadImage(file)
    .then((response) => {
      imgAttachmentKey.value = response.data.attachment_key
    })
    .catch((err) => {
      console.error(err)
      previewUrl.value = null
    })
    .finally(() => {
      uploading.value = false
    })
}
</script>

<style scoped>
.task-form {
  margin-bottom: 24px;
}

.task-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.task-input {
  flex: 1;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}

.task-input:focus {
  border-color: #4a90d9;
}

.task-button {
  padding: 12px 20px;
  background-color: #4a90d9;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.task-button:hover:not(:disabled) {
  background-color: #357abd;
}

.task-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.task-button-cancel {
  padding: 12px 16px;
  background-color: transparent;
  color: #666;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: border-color 0.2s;
}

.task-button-cancel:hover {
  border-color: #aaa;
}

.task-button-secondary {
  padding: 8px 12px;
  background-color: #f0f0f0;
  color: #333;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
}

.image-section {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px dashed #ccc;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.image-preview {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #ddd;
  flex-shrink: 0;
}

.image-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: white;
  border: 1.5px solid #4a90d9;
  color: #4a90d9;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.image-label:hover:not(.disabled) {
  background: #eaf2fb;
}

.image-label.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.image-input {
  display: none;
}

.upload-status {
  color: #888;
}

.location-section {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #eee;
}

.location-actions {
  display: flex;
  gap: 10px;
}

.btn-geo {
  background-color: #27ae60;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
}

.btn-geo:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-clear {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
}

.location-preview {
  margin-top: 10px;
  font-size: 0.9rem;
}

.coords {
  color: #666;
  margin: 4px 0 8px 0;
}

.geo-error {
  color: #c0392b;
  font-size: 0.85rem;
  margin-top: 8px;
}


.accuracy-badge {
  display: inline-block;
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: bold;
  margin-bottom: 6px;
}
.accuracy-badge--boa { background: #d4edda; color: #155724; }
.accuracy-badge--moderada { background: #fff3cd; color: #856404; }
.accuracy-badge--baixa { background: #f8d7da; color: #721c24; }


.privacy-option {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  margin-bottom: 10px;
  color: #444;
  cursor: pointer;
}

.location-mode-info {
  font-size: 0.75rem;
  color: #666;
  margin-top: 4px;
  font-style: italic;
}
</style>
