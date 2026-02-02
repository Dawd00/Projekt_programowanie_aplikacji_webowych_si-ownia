<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Pracownicy</h1>
        <v-btn color="primary" @click="openDialog" class="mb-4">Dodaj pracownika</v-btn>
        <v-btn
          v-if="canManageUsers"
          color="secondary"
          variant="tonal"
          class="mb-4 ml-2"
          @click="router.push('/users')"
        >
          Dodaj użytkownika
        </v-btn>
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
            <template v-if="canManageEmployees">
              <v-btn icon size="small" @click="editEmployee(item)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn icon size="small" @click="deleteEmployee(item.id)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <!-- Dialog for create/edit -->
    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title>{{ editingEmployee ? 'Edytuj pracownika' : 'Dodaj pracownika' }}</v-card-title>
        <v-card-text>
          <form @submit.prevent="saveEmployee">
            <v-select
              v-model="formData.userId"
              label="Użytkownik"
              :items="userOptions"
              item-title="label"
              item-value="id"
              :error-messages="formErrors.userId"
              required
            ></v-select>
            <v-select
              v-model="formData.position"
              label="Stanowisko"
              :items="positions"
              :error-messages="formErrors.position"
              required
            ></v-select>
            <v-text-field
              v-model="formData.department"
              label="Dział"
              :error-messages="formErrors.department"
            ></v-text-field>
            <v-text-field
              v-if="canSeeSalaries"
              v-model="formData.salary"
              label="Wynagrodzenie"
              type="number"
              :error-messages="formErrors.salary"
              required
            ></v-text-field>
            <v-text-field
              v-model="formData.hireDate"
              label="Data zatrudnienia"
              type="date"
              :error-messages="formErrors.hireDate"
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
          </form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, inject, computed } from 'vue'
import { useRouter } from 'vue-router'
import * as yup from 'yup'
import api from '../services/api'

const toast = inject('toast')
const router = useRouter()

const employees = ref([])
const users = ref([])
const loading = ref(false)
const dialog = ref(false)
const editingEmployee = ref(null)
const currentPage = ref(1)
const pagination = ref({ limit: 20, offset: 0, total: 0 })

const currentUser = computed(() => {
  const userRaw = localStorage.getItem('user')
  if (!userRaw) return null
  try {
    return JSON.parse(userRaw)
  } catch {
    return null
  }
})

const canManageUsers = computed(() => currentUser.value?.role !== 'CLIENT')
const canManageEmployees = computed(() => currentUser.value?.role === 'ADMIN' || currentUser.value?.position === 'MANAGER')
const canSeeSalaries = computed(() => currentUser.value?.role === 'ADMIN' || currentUser.value?.position === 'MANAGER')

const headers = computed(() => {
  const baseHeaders = [
    { title: 'ID Użytkownika', key: 'userId' },
    { title: 'Stanowisko', key: 'position' },
    { title: 'Dział', key: 'department' },
    { title: 'Data zatrudnienia', key: 'hireDate' },
    { title: 'Aktywny', key: 'isActive' },
  ]
  if (canSeeSalaries.value) {
    baseHeaders.splice(3, 0, { title: 'Wynagrodzenie', key: 'salary' })
  }
  if (canManageEmployees.value) {
    baseHeaders.push({ title: 'Akcje', key: 'actions', sortable: false })
  }
  return baseHeaders
})

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
  position: 'MANAGER',
  department: '',
  salary: 0,
  hireDate: '',
  isActive: true,
})

const formErrors = ref({})

const userOptions = computed(() =>
  users.value.map((user) => ({
    id: user.id,
    label: `${user.firstName || ''} ${user.lastName || ''}`.trim()
      ? `${user.firstName || ''} ${user.lastName || ''}`.trim() + ` (${user.email})`
      : user.email,
  })),
)

const validateForm = async () => {
  try {
    await schema.validate(formData.value, { abortEarly: false })
    formErrors.value = {}
    return true
  } catch (error) {
    const errors = {}
    if (error?.inner?.length) {
      error.inner.forEach((err) => {
        if (err.path && !errors[err.path]) {
          errors[err.path] = err.message
        }
      })
    } else if (error?.path) {
      errors[error.path] = error.message
    }
    formErrors.value = errors
    return false
  }
}

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

const loadUsers = async () => {
  try {
    const response = await api.get('/users', {
      params: { limit: 200, offset: 0 },
    })
    users.value = response.data
  } catch (error) {
    console.error('Error loading users:', error)
    toast?.showError('Wystąpił błąd podczas ładowania użytkowników')
  }
}

const openDialog = () => {
  editingEmployee.value = null
  formData.value = {
    userId: '',
    position: 'MANAGER',
    department: '',
    salary: 0,
    hireDate: '',
    isActive: true,
  }
  formErrors.value = {}
  dialog.value = true
}

const editEmployee = (employee) => {
  if (!canManageEmployees.value) {
    toast?.showError('Brak uprawnień do edycji pracowników')
    return
  }
  editingEmployee.value = employee
  formData.value = { ...employee }
  formErrors.value = {}
  dialog.value = true
}

const normalizePayload = () => {
  const payload = { ...formData.value }
  payload.salary = Number(payload.salary)
  if (!payload.hireDate) {
    delete payload.hireDate
  }
  return payload
}

const saveEmployee = async () => {
  const isValid = await validateForm()
  if (!isValid) return
  try {
    const payload = normalizePayload()
    if (editingEmployee.value) {
      await api.patch(`/employees/${editingEmployee.value.id}`, payload)
      toast?.showSuccess('Pracownik został zaktualizowany')
    } else {
      await api.post('/employees', payload)
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
  if (!canManageEmployees.value) {
    toast?.showError('Brak uprawnień do usuwania pracowników')
    return
  }
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
  loadUsers()
})
</script>


