<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card width="400">
      <v-card-title class="text-h5">Logowanie</v-card-title>
      <v-card-text>
        <Form @submit="handleLogin" :validation-schema="schema" v-slot="{ errors }">
          <v-text-field
            v-model="formData.email"
            label="Email"
            type="email"
            :error-messages="errors.email"
            required
          ></v-text-field>
          <v-text-field
            v-model="formData.password"
            label="Hasło"
            type="password"
            :error-messages="errors.password"
            required
          ></v-text-field>
          <v-btn type="submit" color="primary" block :loading="loading">Zaloguj</v-btn>
        </Form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'
import { Form } from 'vee-validate'
import * as yup from 'yup'
import api from '../services/api'

const router = useRouter()
const toast = inject('toast')
const loading = ref(false)

const schema = yup.object({
  email: yup.string().email('Nieprawidłowy format email').required('Email jest wymagany'),
  password: yup.string().required('Hasło jest wymagane').min(8, 'Hasło musi mieć min. 8 znaków'),
})

const formData = ref({
  email: '',
  password: '',
})

const handleLogin = async (values) => {
  loading.value = true
  try {
    const response = await api.post('/auth/login', values)
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      toast?.showSuccess('Zalogowano pomyślnie')
      router.push('/')
    }
  } catch (error) {
    console.error('Error logging in:', error)
    const errorMessage = error.response?.data?.message || 'Błąd logowania'
    toast?.showError(errorMessage)
  } finally {
    loading.value = false
  }
}
</script>

