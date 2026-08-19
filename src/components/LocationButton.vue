<script setup>
import { onMounted } from 'vue'
import { useGeolocation } from '@/composables/useGeolocation'
import TaskLocationMap from './TaskLocationMap.vue'

const {
  isSupported,
  permissionState,
  loadingLocation,
  locationError,
  location,
  readPermissionState,
  requestCurrentLocation,
  clearLocation
} = useGeolocation()

onMounted(() => {
  readPermissionState()
})

async function handleRequestLocation() {
  const result = await requestCurrentLocation()
  if (result) {
    console.log('Localização capturada com sucesso:', result)
  }
}
</script>

<template>
  <div class="geo-container">
    <h2>Teste de Geolocalização</h2>

    <p v-if="!isSupported" class="geo-error">
      Geolocalização não é suportada neste navegador.
    </p>

    <div v-else class="content">
      <p class="permission-status">
        Estado da permissão: <strong>{{ permissionState }}</strong>
      </p>

      <div class="actions">
        <button
          class="btn-primary"
          :disabled="loadingLocation"
          @click="handleRequestLocation"
        >
          {{ loadingLocation ? 'Buscando...' : 'Obter Localização' }}
        </button>

        <button
          v-if="location"
          class="btn-secondary"
          @click="clearLocation"
        >
          Limpar Localização
        </button>
      </div>

      <p v-if="locationError" class="geo-error">
        {{ locationError }}
      </p>

      <div v-if="location" class="location-card">
        <h3>Localização Capturada:</h3>
        <ul>
          <li v-if="location.label"><strong>Endereço / Rua:</strong> {{ location.label }}</li>
          <li><strong>Latitude:</strong> {{ location.latitude }}</li>
          <li><strong>Longitude:</strong> {{ location.longitude }}</li>
          <li><strong>Precisão:</strong> {{ location.accuracy }} metros</li>
          <li><strong>Data/Hora:</strong> {{ new Date(location.timestamp).toLocaleString() }}</li>
        </ul>

        <!-- Renderiza o mapa interativo do Leaflet -->
        <TaskLocationMap :location="location" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.geo-container {
  max-width: 450px;
  margin: 20px auto;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-family: sans-serif;
  background-color: #fff;
}

.permission-status {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 12px;
}

.actions {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

button {
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #41b883;
  color: white;
}

.btn-secondary {
  background-color: #e0e0e0;
  color: #333;
}

.geo-error {
  color: #d9534f;
  background-color: #fdf7f7;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #d9534f;
  margin-top: 10px;
}

.location-card {
  background-color: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  border-left: 4px solid #41b883;
  margin-top: 15px;
  text-align: left;
}

.location-card ul {
  list-style: none;
  padding: 0;
  margin: 8px 0 0 0;
}

.location-card li {
  margin-bottom: 6px;
  font-size: 0.95rem;
}
</style>
