<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Pracownicy</h1>
        <v-btn color="primary" @click="openDialog" class="mb-4">Dodaj pracownika</v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-data-table
          :headers="headers"
          :items="employees"
          :loading="loading"
          :items-per-page="pagination.limit"
          :page="currentPage"
          @update:page="handlePageChange"
        >
          <template v-slot:item.actions="{ item }">
            <v-btn icon="mdi-pencil" size="small" @click="editEmployee(item)"></v-btn>
            <v-btn icon="mdi-delete" size="small" @click="deleteEmployee(item.id)"></v-btn>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <!-- Dialog for create/edit -->
    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title>{{ editingEmployee ? 'Edytuj pracownika' : 'Dodaj pracownika' }}</v-card-title>
        <v-card-text>
          <Form @submit="saveEmployee" :validation-schema="schema" v-slot="{ errors }">
            <v-text-field
              v-model="formData.userId"
              label="ID Użytkownika"
              :error-messages="errors.userId"
              required
            ></v-text-field>
            <v-select
              v-model="formData.position"
              label="Stanowisko"
              :items="positions"
              :error-messages="errors.position"
              required
            ></v-select>
            <v-text-field
              v-model="formData.department"
              label="Dział"
              :error-messages="errors.department"
            ></v-text-field>
            <v-text-field
              v-model="formData.salary"
              label="Wynagrodzenie"
              type="number"
              :error-messages="errors.salary"
              required
            ></v-text-field>
            <v-text-field
              v-model="formData.hireDate"
              label="Data zatrudnienia"
              type="date"
              :error-messages="errors.hireDate"
            ></v-text-field>
            <v-checkbox
              v-model="formData.isActive"
              label="Aktywny"
            ></v-checkbox>
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

const employees = ref([])
const loading = ref(false)
const dialog = ref(false)
const editingEmployee = ref(null)
const currentPage = ref(1)
const pagination = ref({ limit: 20, offset: 0, total: 0 })

const headers = [
  { title: 'ID Użytkownika', key: 'userId' },
  { title: 'Stanowisko', key: 'position' },
  { title: 'Dział', key: 'department' },
  { title: 'Wynagrodzenie', key: 'salary' },
  { title: 'Data zatrudnienia', key: 'hireDate' },
  { title: 'Aktywny', key: 'isActive' },
  { title: 'Akcje', key: 'actions', sortable: false },
]

const positions = ['RECEPTIONIST', 'MANAGER', 'CLEANER', 'MAINTENANCE', 'OTHER']

const schema = yup.object({
  userId: yup.string().required('ID Użytkownika jest wymagane').uuid('Nieprawidłowy format UUID'),
  position: yup.string().required('Stanowisko jest wymagane').oneOf(positions, 'Nieprawidłowe stanowisko'),
  department: yup.string().nullable().max(255, 'Dział może mieć maksymalnie 255 znaków'),
  salary: yup.number().required('Wynagrodzenie jest wymagane').min(0, 'Wynagrodzenie musi być większe lub równe 0'),
  hireDate: yup.string().nullable(),
  isActive: yup.boolean(),
})

const formData = ref({
  userId: '',
  position: 'RECEPTIONIST',
  department: '',
  salary: 0,
  hireDate: '',
  isActive: true,
})

const loadEmployees = async () => {
  loading.value = true
  try {
    const response = await api.get('/employees', {
      params: {
        limit: pagination.value.limit,
        offset: pagination.value.offset,
      },
    })
    employees.value = response.data
    pagination.value = response.pagination
  } catch (error) {
    console.error('Error loading employees:', error)
  } finally {
    loading.value = false
  }
}

const openDialog = () => {
  editingEmployee.value = null
  formData.value = {
    userId: '',
    position: 'RECEPTIONIST',
    department: '',
    salary: 0,
    hireDate: '',
    isActive: true,
  }
  dialog.value = true
}

const editEmployee = (employee) => {
  editingEmployee.value = employee
  formData.value = { ...employee }
  dialog.value = true
}

const saveEmployee = async (values) => {
  try {
    if (editingEmployee.value) {
      await api.patch(`/employees/${editingEmployee.value.id}`, values)
      toast?.showSuccess('Pracownik został zaktualizowany')
    } else {
      await api.post('/employees', values)
      toast?.showSuccess('Pracownik został utworzony')
    }
    dialog.value = false
    loadEmployees()
  } catch (error) {
    console.error('Error saving employee:', error)
    const errorMessage = error.response?.data?.message || 'Wystąpił błąd podczas zapisywania pracownika'
    toast?.showError(errorMessage)
  }
}

const deleteEmployee = async (id) => {
  if (confirm('Czy na pewno chcesz usunąć tego pracownika?')) {
    try {
      await api.delete(`/employees/${id}`)
      toast?.showSuccess('Pracownik został usunięty')
      loadEmployees()
    } catch (error) {
      console.error('Error deleting employee:', error)
      const errorMessage = error.response?.data?.message || 'Wystąpił błąd podczas usuwania pracownika'
      toast?.showError(errorMessage)
    }
  }
}

const handlePageChange = (page) => {
  currentPage.value = page
  pagination.value.offset = (page - 1) * pagination.value.limit
  loadEmployees()
}

onMounted(() => {
  loadEmployees()
})
</script>


