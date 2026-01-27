<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card width="400">
      <v-card-title class="text-h5">Logowanie</v-card-title>
      <v-card-text>
        <form @submit.prevent="handleLogin">
          <v-text-field
            v-model="formData.email"
            label="Email"
            type="email"
            name="email"
            required
          ></v-text-field>
          <v-text-field
            v-model="formData.password"
            label="Hasło"
            type="password"
            name="password"
            required
          ></v-text-field>
          <v-btn type="submit" color="primary" block :loading="loading">Zaloguj</v-btn>
        </form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, inject, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()
const toast = inject('toast')
const loading = ref(false)

const formData = ref({
  email: '',
  password: '',
})

const handleLogin = async () => {
  const payload = { ...formData.value }
  console.log('handleLogin called with values:', payload)
  loading.value = true
  console.log('Starting login with:', payload.email)
  try {
    const response = await api.post('/auth/login', payload)
    console.log('Login response received:', response)
    console.log('Response type:', typeof response)
    console.log('Response keys:', Object.keys(response || {}))
    
    // Interceptor zwraca response.data, więc response już zawiera { data: { token, user } }
    // Backend zwraca { data: { token, user } }, więc po interceptorze response = { data: { token, user } }
    const token = response?.data?.token
    const user = response?.data?.user
    
    console.log('Extracted token:', token ? 'Token exists' : 'No token')
    console.log('Extracted user:', user ? 'User exists' : 'No user')
    console.log('Full response structure:', JSON.stringify(response, null, 2))
    
    if (token && user) {
      console.log('Saving to localStorage...')
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      console.log('Token saved, checking localStorage:', localStorage.getItem('token') ? 'OK' : 'FAILED')
      
      toast?.showSuccess('Zalogowano pomyślnie')
      
      // Użyj nextTick aby upewnić się, że localStorage jest zapisany przed przekierowaniem
      await nextTick()
      console.log('Navigating to /')
      
      // Sprawdź czy guard nie blokuje
      const currentToken = localStorage.getItem('token')
      console.log('Token before navigation:', currentToken ? 'Exists' : 'Missing')
      
      // Użyj window.location.href dla pewności, że strona się przeładuje i guard zobaczy token
      setTimeout(() => {
        window.location.href = '/'
      }, 100)
    } else {
      console.error('Brak tokenu lub użytkownika w odpowiedzi')
      console.error('Response structure:', JSON.stringify(response, null, 2))
      toast?.showError('Błąd logowania - brak tokenu w odpowiedzi')
    }
  } catch (error) {
    console.error('Error logging in:', error)
    console.error('Error details:', error.response?.data || error.message)
    const errorMessage = error.response?.data?.message || error.message || 'Błąd logowania'
    toast?.showError(errorMessage)
  } finally {
    loading.value = false
    console.log('Login process finished')
  }
}
</script>

