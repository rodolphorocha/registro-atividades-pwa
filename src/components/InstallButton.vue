<template>
  <transition name="fade">
    <button
      v-if="deferredPrompt"
      class="install-btn"
      @click="installApp"
    >
      📲 Instalar App
    </button>
  </transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const deferredPrompt = ref(null)

onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt.value = e
  })

  window.addEventListener('appinstalled', () => {
    deferredPrompt.value = null
    console.log('PWA instalada com sucesso')
  })
})

const installApp = async () => {
  if (!deferredPrompt.value) return

  deferredPrompt.value.prompt()

  const { outcome } = await deferredPrompt.value.userChoice
  console.log('Resultado:', outcome)

  deferredPrompt.value = null
}
</script>

<style scoped>
.install-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;

  background: linear-gradient(135deg, #42b883, #2c3e50);
  color: white;

  border: none;
  border-radius: 12px;

  padding: 12px 18px;
  font-size: 14px;
  font-weight: 600;

  cursor: pointer;

  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  transition: all 0.25s ease;
}

.install-btn:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.install-btn:active {
  transform: scale(0.97);
}

/* animação suave */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
