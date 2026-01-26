<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Rezerwacje</h1>
        <v-btn color="primary" @click="openDialog" class="mb-4">Dodaj rezerwację</v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-data-table
          :headers="headers"
          :items="bookings"
          :loading="loading"
          :items-per-page="pagination.limit"
          :page="currentPage"
          @update:page="handlePageChange"
        >
          <template v-slot:item.actions="{ item }">
            <v-btn icon="mdi-pencil" size="small" @click="editBooking(item)"></v-btn>
            <v-btn icon="mdi-delete" size="small" @click="deleteBooking(item.id)"></v-btn>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <!-- Dialog for create/edit -->
    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title>{{ editingBooking ? 'Edytuj rezerwację' : 'Dodaj rezerwację' }}</v-card-title>
        <v-card-text>
          <Form @submit="saveBooking" :validation-schema="schema" v-slot="{ errors }">
            <v-text-field
              v-model="formData.userId"
              label="ID Użytkownika"
              :error-messages="errors.userId"
              required
            ></v-text-field>
            <v-text-field
              v-model="formData.sessionId"
              label="ID Sesji"
              :error-messages="errors.sessionId"
              required
            ></v-text-field>
            <v-select
              v-model="formData.status"
              label="Status"
              :items="statuses"
              :error-messages="errors.status"
              required
            ></v-select>
            <v-textarea
              v-model="formData.notes"
              label="Notatki"
              :error-messages="errors.notes"
            ></v-textarea>
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
import { ref, onMounted, inject } from 'vue'
import { Form } from 'vee-validate'
import * as yup from 'yup'
import api from '../services/api'

const toast = inject('toast')

const bookings = ref([])
const loading = ref(false)
const dialog = ref(false)
const editingBooking = ref(null)
const currentPage = ref(1)
const pagination = ref({ limit: 20, offset: 0, total: 0 })

const headers = [
  { title: 'ID Użytkownika', key: 'userId' },
  { title: 'ID Sesji', key: 'sessionId' },
  { title: 'Status', key: 'status' },
  { title: 'Data utworzenia', key: 'createdAt' },
  { title: 'Akcje', key: 'actions', sortable: false },
]

const statuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']

const schema = yup.object({
  userId: yup.string().required('ID Użytkownika jest wymagane').uuid('Nieprawidłowy format UUID'),
  sessionId: yup.string().required('ID Sesji jest wymagane').uuid('Nieprawidłowy format UUID'),
  status: yup.string().required('Status jest wymagany').oneOf(statuses, 'Nieprawidłowy status'),
  notes: yup.string().nullable().max(500, 'Notatki mogą mieć maksymalnie 500 znaków'),
})

const formData = ref({
  userId: '',
  sessionId: '',
  status: 'PENDING',
  notes: '',
})

const loadBookings = async () => {
  loading.value = true
  try {
    const response = await api.get('/bookings', {
      params: {
        limit: pagination.value.limit,
        offset: pagination.value.offset,
      },
    })
    bookings.value = response.data
    pagination.value = response.pagination
  } catch (error) {
    console.error('Error loading bookings:', error)
  } finally {
    loading.value = false
  }
}

const openDialog = () => {
  editingBooking.value = null
  formData.value = {
    userId: '',
    sessionId: '',
    status: 'PENDING',
    notes: '',
  }
  dialog.value = true
}

const editBooking = (booking) => {
  editingBooking.value = booking
  formData.value = { ...booking }
  dialog.value = true
}

const saveBooking = async (values) => {
  try {
    if (editingBooking.value) {
      await api.patch(`/bookings/${editingBooking.value.id}`, values)
      toast?.showSuccess('Rezerwacja została zaktualizowana')
    } else {
      await api.post('/bookings', values)
      toast?.showSuccess('Rezerwacja została utworzona')
    }
    dialog.value = false
    loadBookings()
  } catch (error) {
    console.error('Error saving booking:', error)
    const errorMessage = error.response?.data?.message || 'Wystąpił błąd podczas zapisywania rezerwacji'
    toast?.showError(errorMessage)
  }
}

const deleteBooking = async (id) => {
  if (confirm('Czy na pewno chcesz usunąć tę rezerwację?')) {
    try {
      await api.delete(`/bookings/${id}`)
      toast?.showSuccess('Rezerwacja została usunięta')
      loadBookings()
    } catch (error) {
      console.error('Error deleting booking:', error)
      const errorMessage = error.response?.data?.message || 'Wystąpił błąd podczas usuwania rezerwacji'
      toast?.showError(errorMessage)
    }
  }
}

const handlePageChange = (page) => {
  currentPage.value = page
  pagination.value.offset = (page - 1) * pagination.value.limit
  loadBookings()
}

onMounted(() => {
  loadBookings()
})
</script>

