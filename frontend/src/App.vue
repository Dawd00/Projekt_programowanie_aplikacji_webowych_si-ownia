<template>
  <v-app>
    <v-app-bar color="primary" prominent>
      <v-app-bar-title>Panel Siłowni</v-app-bar-title>
      <v-spacer></v-spacer>
      <template v-if="isAuthenticated">
        <v-btn to="/" variant="text">Strona główna</v-btn>
        <v-btn to="/users" variant="text">Użytkownicy</v-btn>
        <v-btn to="/passes" variant="text">Karnety</v-btn>
        <v-btn to="/bookings" variant="text">Rezerwacje</v-btn>
        <v-btn to="/employees" variant="text">Pracownicy</v-btn>
        <v-btn @click="handleLogout" variant="text">Wyloguj</v-btn>
      </template>
      <template v-else>
        <v-btn to="/login" variant="text">Zaloguj</v-btn>
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
import { useRouter } from 'vue-router'
import { useToast } from './composables/useToast'

const router = useRouter()
const { snackbar, showSuccess, showError, showInfo } = useToast()

// Provide toast functions to all child components
provide('toast', { showSuccess, showError, showInfo })

const user = ref(null)

const isAuthenticated = computed(() => {
  return !!localStorage.getItem('token')
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

