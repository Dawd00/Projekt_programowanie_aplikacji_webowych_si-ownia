<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Użytkownicy</h1>
        <v-btn color="primary" @click="openDialog" class="mb-4">Dodaj użytkownika</v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-data-table
          :headers="headers"
          :items="users"
          :loading="loading"
          :items-per-page="pagination.limit"
          :page="currentPage"
          @update:page="handlePageChange"
        >
          <template v-slot:item.actions="{ item }">
            <v-btn icon="mdi-pencil" size="small" @click="editUser(item)"></v-btn>
            <v-btn icon="mdi-delete" size="small" @click="deleteUser(item.id)"></v-btn>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <!-- Dialog for create/edit -->
    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title>{{ editingUser ? 'Edytuj użytkownika' : 'Dodaj użytkownika' }}</v-card-title>
        <v-card-text>
          <Form @submit="saveUser" :validation-schema="schema" v-slot="{ errors }">
            <v-text-field
              v-model="formData.email"
              label="Email"
              type="email"
              :error-messages="errors.email"
              required
            ></v-text-field>
            <v-text-field
              v-model="formData.firstName"
              label="Imię"
              :error-messages="errors.firstName"
              required
            ></v-text-field>
            <v-text-field
              v-model="formData.lastName"
              label="Nazwisko"
              :error-messages="errors.lastName"
              required
            ></v-text-field>
            <v-select
              v-model="formData.role"
              label="Rola"
              :items="roles"
              :error-messages="errors.role"
              required
            ></v-select>
            <v-text-field
              v-model="formData.phone"
              label="Telefon"
              :error-messages="errors.phone"
            ></v-text-field>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn @click="dialog = false">Anuluj</v-btn>
              <v-btn type="submit" color="primary">Zapisz</v-btn>
            </v-card-actions>
          </Form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Form } from 'vee-validate'
import * as yup from 'yup'
import api from '../services/api'

const users = ref([])
const loading = ref(false)
const dialog = ref(false)
const editingUser = ref(null)
const currentPage = ref(1)
const pagination = ref({ limit: 20, offset: 0, total: 0 })

const headers = [
  { title: 'Email', key: 'email' },
  { title: 'Imię', key: 'firstName' },
  { title: 'Nazwisko', key: 'lastName' },
  { title: 'Rola', key: 'role' },
  { title: 'Akcje', key: 'actions', sortable: false },
]

const roles = ['CLIENT', 'TRAINER', 'EMPLOYEE', 'ADMIN']

const schema = yup.object({
  email: yup.string().email('Nieprawidłowy format email').required('Email jest wymagany'),
  firstName: yup.string().required('Imię jest wymagane').min(2, 'Imię musi mieć min. 2 znaki'),
  lastName: yup.string().required('Nazwisko jest wymagane').min(2, 'Nazwisko musi mieć min. 2 znaki'),
  role: yup.string().required('Rola jest wymagana').oneOf(roles, 'Nieprawidłowa rola'),
  phone: yup.string().nullable().matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, 'Nieprawidłowy format telefonu'),
})

const formData = ref({
  email: '',
  firstName: '',
  lastName: '',
  role: 'CLIENT',
  phone: '',
})

const loadUsers = async () => {
  loading.value = true
  try {
    const response = await api.get('/users', {
      params: {
        limit: pagination.value.limit,
        offset: pagination.value.offset,
      },
    })
    users.value = response.data
    pagination.value = response.pagination
  } catch (error) {
    console.error('Error loading users:', error)
  } finally {
    loading.value = false
  }
}

const openDialog = () => {
  editingUser.value = null
  formData.value = {
    email: '',
    firstName: '',
    lastName: '',
    role: 'CLIENT',
    phone: '',
  }
  dialog.value = true
}

const editUser = (user) => {
  editingUser.value = user
  formData.value = { ...user }
  dialog.value = true
}

const saveUser = async (values) => {
  try {
    const dataToSave = editingUser.value ? { ...values } : { ...values, password: 'temp123' }
    if (editingUser.value) {
      await api.patch(`/users/${editingUser.value.id}`, dataToSave)
    } else {
      await api.post('/users', dataToSave)
    }
    dialog.value = false
    loadUsers()
  } catch (error) {
    console.error('Error saving user:', error)
    if (error.response?.data?.errors) {
      // Błędy walidacji z backendu będą wyświetlone przez Vee-Validate
    }
  }
}

const deleteUser = async (id) => {
  if (confirm('Czy na pewno chcesz usunąć tego użytkownika?')) {
    try {
      await api.delete(`/users/${id}`)
      loadUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }
}

const handlePageChange = (page) => {
  currentPage.value = page
  pagination.value.offset = (page - 1) * pagination.value.limit
  loadUsers()
}

onMounted(() => {
  loadUsers()
})
</script>

