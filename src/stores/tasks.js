import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import tasksApi from '../api/tasksApi.js'

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref([])
  const loading = ref(false)
  const error = ref(null)

  const pendingTasks = computed(() => tasks.value.filter((t) => !t.done))
  const completedTasks = computed(() => tasks.value.filter((t) => t.done))

  async function fetchTasks() {
    loading.value = true
    error.value = null
    try {
      const response = await tasksApi.getAll()
      tasks.value = response.data
    } catch (err) {
      error.value = 'Erro ao carregar tarefas.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function addTask(payload) {
    if (!payload.title?.trim()) return
    error.value = null


    const body = {
      title: payload.title.trim(),
      latitude: payload.latitude ?? null,
      longitude: payload.longitude ?? null,
      geolocation_accuracy: payload.geolocation_accuracy ?? null,
      geolocation_timestamp: payload.geolocation_timestamp ?? null,
      location_label: payload.location_label ?? null,
    }

    if (payload.imgAttachmentKey != null) {
      body.img_attachment_key = payload.imgAttachmentKey
    }

    try {
      const response = await tasksApi.create(body)
      tasks.value.push(response.data)
    } catch (err) {
      error.value = 'Erro ao adicionar tarefa.'
      console.error(err)
    }
  }

  async function toggleTask(id) {
    const task = tasks.value.find((t) => t.id === id)
    if (!task) return
    error.value = null
    try {
      const response = await tasksApi.update(id, { done: !task.done })
      const index = tasks.value.findIndex((t) => t.id === id)
      if (index !== -1) tasks.value[index] = response.data
    } catch (err) {
      error.value = 'Erro ao atualizar tarefa.'
      console.error(err)
    }
  }

  async function removeTask(id) {
    error.value = null
    try {
      await tasksApi.remove(id)
      tasks.value = tasks.value.filter((t) => t.id !== id)
    } catch (err) {
      error.value = 'Erro ao remover tarefa.'
      console.error(err)
    }
  }

  async function updateTask(id, payload = {}) {
    if (payload.title !== undefined && !payload.title.trim()) return
    error.value = null

    const body = {}
    if (payload.title !== undefined) body.title = payload.title.trim()
    if (payload.imgAttachmentKey != null) body.img_attachment_key = payload.imgAttachmentKey


    if ('latitude' in payload) body.latitude = payload.latitude
    if ('longitude' in payload) body.longitude = payload.longitude
    if ('geolocation_accuracy' in payload) body.geolocation_accuracy = payload.geolocation_accuracy
    if ('geolocation_timestamp' in payload) body.geolocation_timestamp = payload.geolocation_timestamp
    if ('location_label' in payload) body.location_label = payload.location_label

    try {
      const response = await tasksApi.update(id, body)
      const index = tasks.value.findIndex((t) => t.id === id)
      if (index !== -1) tasks.value[index] = response.data
    } catch (err) {
      error.value = 'Erro ao editar tarefa.'
      console.error(err)
    }
  }

  return {
    tasks,
    loading,
    error,
    pendingTasks,
    completedTasks,
    fetchTasks,
    addTask,
    toggleTask,
    removeTask,
    updateTask,
  }
})
