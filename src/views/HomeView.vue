<script setup>
import { onMounted, ref, computed } from 'vue'
import TaskForm from '../components/TaskForm.vue'
import TaskItem from '../components/TaskItem.vue'
import InstallButton from '../components/InstallButton.vue'
//import LocationButton from '../components/LocationButton.vue'
import { useTasksStore } from '../stores/tasks.js'

const store = useTasksStore()
const editingTask = ref(null)
const onlyWithLocation = ref(false)

onMounted(() => {
  store.fetchTasks()
})

// Filtra as tarefas pendentes conforme o checkbox
const filteredPendingTasks = computed(() => {
  if (onlyWithLocation.value) {
    return store.pendingTasks.filter((t) => t.latitude != null)
  }
  return store.pendingTasks
})

// Filtra as tarefas concluídas conforme o checkbox
const filteredCompletedTasks = computed(() => {
  if (onlyWithLocation.value) {
    return store.completedTasks.filter((t) => t.latitude != null)
  }
  return store.completedTasks
})

function handleAdd(payload) {
  store.addTask(payload)
}

function handleUpdate(id, payload) {
  store.updateTask(id, payload)
  editingTask.value = null
}

function handleCancel() {
  editingTask.value = null
}

function handleEdit(task) {
  editingTask.value = task
}

function handleToggle(id) {
  store.toggleTask(id)
}

function handleRemove(id) {
  if (editingTask.value?.id === id) editingTask.value = null
  store.removeTask(id)
}
</script>

<template>
  <div>
    <p v-if="store.error" class="error-message">{{ store.error }}</p>

    <TaskForm
      :editing-task="editingTask"
      @add="handleAdd"
      @update="handleUpdate"
      @cancel="handleCancel"
    />

    <!-- Filtro de localização (Atividade 2) -->
    <div class="filters">
      <label class="filter-label">
        <input type="checkbox" v-model="onlyWithLocation" />
        Somente com localização
      </label>
    </div>

    <p v-if="store.loading" class="loading-message">Carregando tarefas...</p>

    <template v-else>
      <section v-if="filteredPendingTasks.length > 0">
        <h2 class="section-title">Pendentes ({{ filteredPendingTasks.length }})</h2>
        <TaskItem
          v-for="task in filteredPendingTasks"
          :key="task.id"
          :task="task"
          @toggle="handleToggle"
          @remove="handleRemove"
          @edit="handleEdit"
        />
      </section>

      <section v-if="filteredCompletedTasks.length > 0">
        <h2 class="section-title">Concluídas ({{ filteredCompletedTasks.length }})</h2>
        <TaskItem
          v-for="task in filteredCompletedTasks"
          :key="task.id"
          :task="task"
          @toggle="handleToggle"
          @remove="handleRemove"
          @edit="handleEdit"
        />
      </section>

      <p v-if="store.tasks.length === 0" class="empty-message">
        Nenhuma tarefa cadastrada. Adicione uma acima.
      </p>
      <p v-else-if="onlyWithLocation && filteredPendingTasks.length === 0 && filteredCompletedTasks.length === 0" class="empty-message">
        Nenhuma tarefa possui localização salva.
      </p>
    </template>

    <InstallButton />
  </div>
</template>

<style scoped>
.filters {
  margin: 12px 0;
  display: flex;
  align-items: center;
}

.filter-label {
  font-size: 0.9rem;
  color: #555;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  user-select: none;
}

.section-title {
  font-size: 1rem;
  color: #666;
  margin-bottom: 12px;
  margin-top: 20px;
}

.empty-message {
  text-align: center;
  color: #999;
  margin-top: 40px;
  font-size: 0.95rem;
}

.error-message {
  color: #c0392b;
  background-color: #fdecea;
  border: 1px solid #e74c3c;
  border-radius: 6px;
  padding: 10px 14px;
  margin-bottom: 12px;
  font-size: 0.9rem;
}

.loading-message {
  color: #666;
  font-size: 0.9rem;
  padding: 8px 0;
}
</style>
