<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Karnety</h1>
        <v-btn color="primary" @click="openDialog" class="mb-4">Dodaj karnet</v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-data-table
          :headers="headers"
          :items="passes"
          :loading="loading"
          :items-per-page="pagination.limit"
          :page="currentPage"
          @update:page="handlePageChange"
        >
          <template v-slot:item.actions="{ item }">
            <v-btn icon="mdi-pencil" size="small" @click="editPass(item)"></v-btn>
            <v-btn icon="mdi-delete" size="small" @click="deletePass(item.id)"></v-btn>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <!-- Dialog for create/edit -->
    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title>{{ editingPass ? 'Edytuj karnet' : 'Dodaj karnet' }}</v-card-title>
        <v-card-text>
          <Form @submit="savePass" :validation-schema="schema" v-slot="{ errors }">
            <v-text-field
              v-model="formData.userId"
              label="ID Użytkownika"
              :error-messages="errors.userId"
              required
            ></v-text-field>
            <v-select
              v-model="formData.type"
              label="Typ"
              :items="passTypes"
              :error-messages="errors.type"
              required
            ></v-select>
            <v-text-field
              v-model="formData.price"
              label="Cena"
              type="number"
              :error-messages="errors.price"
              required
            ></v-text-field>
            <v-text-field
              v-model="formData.startDate"
              label="Data rozpoczęcia"
              type="date"
              :error-messages="errors.startDate"
              required
            ></v-text-field>
            <v-text-field
              v-model="formData.endDate"
              label="Data zakończenia"
              type="date"
              :error-messages="errors.endDate"
              required
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
import { ref, onMounted, inject } from 'vue'
import { Form } from 'vee-validate'
import * as yup from 'yup'
import api from '../services/api'

const toast = inject('toast')

const passes = ref([])
const loading = ref(false)
const dialog = ref(false)
const editingPass = ref(null)
const currentPage = ref(1)
const pagination = ref({ limit: 20, offset: 0, total: 0 })

const headers = [
  { title: 'ID Użytkownika', key: 'userId' },
  { title: 'Typ', key: 'type' },
  { title: 'Cena', key: 'price' },
  { title: 'Data rozpoczęcia', key: 'startDate' },
  { title: 'Data zakończenia', key: 'endDate' },
  { title: 'Akcje', key: 'actions', sortable: false },
]

const passTypes = ['MONTHLY', 'QUARTERLY', 'YEARLY', 'SINGLE']

const schema = yup.object({
  userId: yup.string().required('ID Użytkownika jest wymagane').uuid('Nieprawidłowy format UUID'),
  type: yup.string().required('Typ jest wymagany').oneOf(passTypes, 'Nieprawidłowy typ karnetu'),
  price: yup.number().required('Cena jest wymagana').min(0, 'Cena musi być większa lub równa 0'),
  startDate: yup.string().required('Data rozpoczęcia jest wymagana'),
  endDate: yup
    .string()
    .required('Data zakończenia jest wymagana')
    .test('is-after-start', 'Data zakończenia musi być po dacie rozpoczęcia', function (value) {
      const { startDate } = this.parent
      if (!startDate || !value) return true
      return new Date(value) >= new Date(startDate)
    }),
})

const formData = ref({
  userId: '',
  type: 'MONTHLY',
  price: 0,
  startDate: '',
  endDate: '',
})

const loadPasses = async () => {
  loading.value = true
  try {
    const response = await api.get('/passes', {
      params: {
        limit: pagination.value.limit,
        offset: pagination.value.offset,
      },
    })
    passes.value = response.data
    pagination.value = response.pagination
  } catch (error) {
    console.error('Error loading passes:', error)
  } finally {
    loading.value = false
  }
}

const openDialog = () => {
  editingPass.value = null
  formData.value = {
    userId: '',
    type: 'MONTHLY',
    price: 0,
    startDate: '',
    endDate: '',
  }
  dialog.value = true
}

const editPass = (pass) => {
  editingPass.value = pass
  formData.value = { ...pass }
  dialog.value = true
}

const savePass = async (values) => {
  try {
    if (editingPass.value) {
      await api.patch(`/passes/${editingPass.value.id}`, values)
      toast?.showSuccess('Karnet został zaktualizowany')
    } else {
      await api.post('/passes', values)
      toast?.showSuccess('Karnet został utworzony')
    }
    dialog.value = false
    loadPasses()
  } catch (error) {
    console.error('Error saving pass:', error)
    const errorMessage = error.response?.data?.message || 'Wystąpił błąd podczas zapisywania karnetu'
    toast?.showError(errorMessage)
  }
}

const deletePass = async (id) => {
  if (confirm('Czy na pewno chcesz usunąć ten karnet?')) {
    try {
      await api.delete(`/passes/${id}`)
      toast?.showSuccess('Karnet został usunięty')
      loadPasses()
    } catch (error) {
      console.error('Error deleting pass:', error)
      const errorMessage = error.response?.data?.message || 'Wystąpił błąd podczas usuwania karnetu'
      toast?.showError(errorMessage)
    }
  }
}

const handlePageChange = (page) => {
  currentPage.value = page
  pagination.value.offset = (page - 1) * pagination.value.limit
  loadPasses()
}

onMounted(() => {
  loadPasses()
})
</script>

