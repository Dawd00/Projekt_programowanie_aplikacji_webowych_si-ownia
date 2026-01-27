<template>
  <v-app>
    <v-app-bar color="primary" prominent>
      <v-app-bar-title>
        <template v-if="isAuthenticated">Witaj {{ displayName }}!</template>
        <template v-else>Panel Siłowni</template>
      </v-app-bar-title>
      <v-spacer></v-spacer>
      <template v-if="isAuthenticated">
        <v-btn @click="handleLogout" variant="text">Wyloguj</v-btn>
      </template>
      <template v-else>
        <v-btn v-if="showLoginButton" to="/login" variant="text">Zaloguj</v-btn>
      </template>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>

    <!-- Global Snackbar for notifications -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
      location="top right"
    >
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">Zamknij</v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted, provide } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from './composables/useToast'

const router = useRouter()
const route = useRoute()
const { snackbar, showSuccess, showError, showInfo } = useToast()

// Provide toast functions to all child components
provide('toast', { showSuccess, showError, showInfo })

const user = ref(null)

const isAuthenticated = computed(() => {
  return !!localStorage.getItem('token')
})

const showLoginButton = computed(() => {
  return !isAuthenticated.value && route.path !== '/login'
})

const displayName = computed(() => {
  if (!user.value) return 'Użytkowniku'
  const firstName = user.value.firstName || ''
  const lastName = user.value.lastName || ''
  const fullName = `${firstName} ${lastName}`.trim()
  return fullName || user.value.email || 'Użytkowniku'
})

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  user.value = null
  showSuccess('Wylogowano pomyślnie')
  router.push('/login')
}

onMounted(() => {
  const userData = localStorage.getItem('user')
  if (userData) {
    try {
      user.value = JSON.parse(userData)
    } catch (e) {
      console.error('Error parsing user data:', e)
    }
  }
})
</script>

