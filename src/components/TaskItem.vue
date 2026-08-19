<template>
  <div class="task-item-card" :class="{ done: task.done }">
    <div class="task-item">
      <img
        v-if="task.img_url"
        :src="task.img_url"
        class="task-thumbnail"
        alt="Imagem da tarefa"
      />

      <div class="task-content">
        <label class="task-label">
          <input type="checkbox" :checked="task.done" @change="$emit('toggle', task.id)" />
          <span class="task-title">{{ task.title }}</span>
        </label>


        <span
          v-if="task.location_label"
          class="task-location-tag"
          :title="task.location_label"
        >
          📍 {{ task.location_label }}
        </span>
      </div>

      <div class="task-actions">
        <!-- Atividade 4: Botão de expandir detalhes/mapa -->
        <button
          v-if="task.latitude && task.longitude"
          type="button"
          class="task-expand"
          @click="isExpanded = !isExpanded"
        >
          {{ isExpanded ? 'Ocultar Mapa' : 'Ver Mapa' }}
        </button>

        <button class="task-edit" @click="$emit('edit', task)">Editar</button>
        <button class="task-remove" @click="$emit('remove', task.id)">Remover</button>
      </div>
    </div>


    <div v-if="isExpanded && task.latitude && task.longitude" class="task-location">
      <div class="location-card">
        <h3>Localização Capturada:</h3>
        <ul>
          <li v-if="task.location_label">
            <strong>Endereço / Rua:</strong> {{ task.location_label }}
          </li>
          <li><strong>Latitude:</strong> {{ task.latitude }}</li>
          <li><strong>Longitude:</strong> {{ task.longitude }}</li>
          <li v-if="task.geolocation_accuracy">
            <strong>Precisão:</strong> {{ Number(task.geolocation_accuracy).toFixed(1) }} metros
          </li>
          <li v-if="task.geolocation_timestamp">
            <strong>Data/Hora:</strong> {{ new Date(task.geolocation_timestamp).toLocaleString() }}
          </li>
        </ul>

        <TaskLocationMap
          :location="{
            latitude: task.latitude,
            longitude: task.longitude,
            accuracy: task.geolocation_accuracy,
            label: task.location_label
          }"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TaskLocationMap from './TaskLocationMap.vue'

defineProps({
  task: {
    type: Object,
    required: true,
  },
})

defineEmits(['toggle', 'remove', 'edit'])


const isExpanded = ref(false)
</script>

<style scoped>
.task-item-card {
  background-color: white;
  border-radius: 8px;
  margin-bottom: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: opacity 0.2s;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  gap: 10px;
}

.task-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.task-thumbnail {
  width: 44px;
  height: 44px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #eee;
  flex-shrink: 0;
}

.task-item-card.done {
  opacity: 0.6;
}

.task-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.task-label input[type='checkbox'] {
  width: 20px;
  height: 20px;
  accent-color: #4a90d9;
}

.task-title {
  font-size: 1rem;
}

.task-item-card.done .task-title {
  text-decoration: line-through;
  color: #999;
}


.task-location-tag {
  font-size: 0.75rem;
  color: #27ae60;
  background-color: #eafaf1;
  padding: 2px 6px;
  border-radius: 4px;
  max-width: fit-content;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-actions {
  display: flex;
  gap: 4px;
  align-items: center;
}

.task-expand {
  background: none;
  border: 1px solid #27ae60;
  color: #27ae60;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
  padding: 3px 6px;
}

.task-expand:hover {
  background-color: #27ae60;
  color: white;
}

.task-remove {
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 4px 8px;
}

.task-remove:hover {
  text-decoration: underline;
}

.task-edit {
  background: none;
  border: none;
  color: #4a90d9;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 4px 8px;
}

.task-edit:hover {
  text-decoration: underline;
}

.task-location {
  padding: 0 12px 12px 12px;
  border-top: 1px solid #f0f0f0;
}

.location-card {
  background-color: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  border-left: 4px solid #41b883;
  margin-top: 8px;
  text-align: left;
}

.location-card h3 {
  margin: 0 0 8px 0;
  font-size: 0.95rem;
  color: #333;
}

.location-card ul {
  list-style: none;
  padding: 0;
  margin: 0 0 10px 0;
}

.location-card li {
  margin-bottom: 4px;
  font-size: 0.85rem;
  color: #444;
}
</style>
