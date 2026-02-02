<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Karnety</h1>
        <v-btn v-if="isClient" color="primary" @click="openDialog" class="mb-4">Kup karnet</v-btn>
        <v-btn v-else color="primary" @click="openDialog" class="mb-4">Dodaj karnet</v-btn>
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
          <template v-slot:item.startDate="{ item }">
            {{ formatDate(item.startDate) }}
          </template>
          <template v-slot:item.endDate="{ item }">
            {{ formatDate(item.endDate) }}
          </template>
          <template v-slot:item.isActive="{ item }">
            <v-chip :color="item.isActive ? 'success' : 'error'" size="small">
              {{ item.isActive ? 'Aktywny' : 'Nieaktywny' }}
            </v-chip>
          </template>
          <template v-slot:item.actions="{ item }">
            <v-btn v-if="isAdminOrEmployee" icon size="small" @click="editPass(item)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn v-if="isAdminOrEmployee" icon size="small" @click="deletePass(item.id)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <!-- Dialog for create/edit -->
    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title>{{ editingPass ? 'Edytuj karnet' : (isClient ? 'Kup karnet' : 'Dodaj karnet') }}</v-card-title>
        <v-card-text>
          <form @submit.prevent="savePass">
            <v-text-field
              v-if="isAdminOrEmployee"
              v-model="formData.userId"
              label="ID Użytkownika"
              :error-messages="formErrors.userId"
              required
            ></v-text-field>
            <v-select
              v-model="formData.type"
              label="Typ"
              :items="passTypes"
              :error-messages="formErrors.type"
              required
            ></v-select>
            <v-text-field
              v-model="formData.price"
              label="Cena"
              type="text"
              suffix="zł"
              :error-messages="formErrors.price"
              readonly
              required
            ></v-text-field>
            <v-text-field
              v-model="formData.startDate"
              label="Data rozpoczęcia"
              type="date"
              :error-messages="formErrors.startDate"
              required
            ></v-text-field>
            <v-text-field
              v-model="formData.endDate"
              label="Data zakończenia"
              type="date"
              :error-messages="formErrors.endDate"
              readonly
              required
            ></v-text-field>
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
import { ref, computed, onMounted, inject, watch } from 'vue'
import * as yup from 'yup'
import api from '../services/api'

const toast = inject('toast')

const passes = ref([])
const loading = ref(false)
const dialog = ref(false)
const editingPass = ref(null)
const currentPage = ref(1)
const pagination = ref({ limit: 20, offset: 0, total: 0 })

// Get current user
const currentUser = computed(() => {
  const userRaw = localStorage.getItem('user')
  if (!userRaw) return null
  try {
    return JSON.parse(userRaw)
  } catch {
    return null
  }
})

const isClient = computed(() => {
  return currentUser.value?.role === 'CLIENT'
})

const isAdminOrEmployee = computed(() => {
  const role = currentUser.value?.role
  return role === 'ADMIN' || role === 'EMPLOYEE'
})

const headers = computed(() => {
  const baseHeaders = [
    { title: 'Typ', key: 'type' },
    { title: 'Cena', key: 'price' },
    { title: 'Data rozpoczęcia', key: 'startDate' },
    { title: 'Data zakończenia', key: 'endDate' },
    { title: 'Status', key: 'isActive' },
  ]
  
  // Dla adminów i pracowników dodaj kolumnę z ID użytkownika i akcje
  if (isAdminOrEmployee.value) {
    baseHeaders.unshift({ title: 'ID Użytkownika', key: 'userId' })
    baseHeaders.push({ title: 'Akcje', key: 'actions', sortable: false })
  }
  
  return baseHeaders
})

const passTypes = ['MONTHLY', 'QUARTERLY', 'YEARLY', 'SINGLE']
const passPrices = {
  MONTHLY: 150,
  QUARTERLY: 400,
  YEARLY: 1200,
  SINGLE: 20,
}

const schema = computed(() => {
  const baseSchema = {
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
  }
  
  // Dla adminów i pracowników wymagamy userId
  if (isAdminOrEmployee.value) {
    baseSchema.userId = yup.string().required('ID Użytkownika jest wymagane').uuid('Nieprawidłowy format UUID')
  }
  
  return yup.object(baseSchema)
})

const formData = ref({
  userId: '',
  type: 'MONTHLY',
  price: passPrices.MONTHLY,
  startDate: '',
  endDate: '',
})

const formErrors = ref({})

const formatDateInput = (date) => {
  if (!date) return ''
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return ''
  return parsed.toISOString().slice(0, 10)
}

const calculateEndDate = (type, startDate) => {
  if (!type || !startDate) return ''
  const start = new Date(startDate)
  if (Number.isNaN(start.getTime())) return ''

  if (type === 'SINGLE') {
    return formatDateInput(start)
  }

  const monthsToAdd =
    type === 'MONTHLY' ? 1 : type === 'QUARTERLY' ? 3 : type === 'YEARLY' ? 12 : 0
  const end = new Date(start.getFullYear(), start.getMonth() + monthsToAdd, start.getDate())
  end.setDate(end.getDate() - 1)
  return formatDateInput(end)
}

const formatDate = (dateString) => {
  if (!dateString) return '—'
  const date = new Date(dateString)
  return date.toLocaleDateString('pl-PL')
}

const loadPasses = async () => {
  loading.value = true
  try {
    const params = {
      limit: pagination.value.limit,
      offset: pagination.value.offset,
      // Dodaj timestamp aby uniknąć cache
      _t: Date.now(),
    }
    
    // Dla klientów pokazuj tylko ich karnety
    if (isClient.value && currentUser.value?.id) {
      params.userId = currentUser.value.id
    }
    
    const response = await api.get('/passes', { params })
    passes.value = response.data
    pagination.value = response.pagination
  } catch (error) {
    console.error('Error loading passes:', error)
    toast?.showError('Wystąpił błąd podczas ładowania karnetów')
  } finally {
    loading.value = false
  }
}

const openDialog = () => {
  editingPass.value = null
  formData.value = {
    userId: isClient.value ? currentUser.value?.id || '' : '',
    type: 'MONTHLY',
    price: passPrices.MONTHLY,
    startDate: '',
    endDate: '',
  }
  formErrors.value = {}
  dialog.value = true
}

const editPass = (pass) => {
  if (!isAdminOrEmployee.value) {
    toast?.showError('Nie masz uprawnień do edycji karnetów')
    return
  }
  editingPass.value = pass
  formData.value = { ...pass }
  formErrors.value = {}
  dialog.value = true
}

watch(
  () => formData.value.type,
  (newType) => {
    if (!newType) return
    formData.value.price = passPrices[newType] ?? formData.value.price
    formData.value.endDate = calculateEndDate(newType, formData.value.startDate)
    if (formErrors.value.type) formErrors.value.type = ''
    if (formErrors.value.price) formErrors.value.price = ''
    if (formErrors.value.endDate) formErrors.value.endDate = ''
  },
)

watch(
  () => formData.value.startDate,
  (newStart) => {
    formData.value.endDate = calculateEndDate(formData.value.type, newStart)
    if (formErrors.value.startDate) formErrors.value.startDate = ''
    if (formErrors.value.endDate) formErrors.value.endDate = ''
  },
)

const checkDateOverlap = (newStartDate, newEndDate, existingPasses, ignoreId = null) => {
  const newStart = new Date(newStartDate)
  const newEnd = new Date(newEndDate)
  
  for (const existingPass of existingPasses) {
    if (ignoreId && existingPass.id === ignoreId) continue
    const existingStart = new Date(existingPass.startDate)
    const existingEnd = new Date(existingPass.endDate)
    
    // Sprawdź czy zakresy dat się nakładają
    if (newStart <= existingEnd && newEnd >= existingStart) {
      return {
        overlaps: true,
        existingPass,
      }
    }
  }
  
  return { overlaps: false }
}

const validateForm = async () => {
  try {
    await schema.value.validate(formData.value, { abortEarly: false })
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

const savePass = async () => {
  const isValid = await validateForm()
  if (!isValid) return
  try {
    // Dla klientów automatycznie ustaw userId
    const dataToSave = { ...formData.value }
    if (isClient.value && !editingPass.value) {
      dataToSave.userId = currentUser.value?.id
    }
    
    // Sprawdź nakładanie się dat przed wysłaniem (tworzenie i edycja)
    if (dataToSave.userId) {
      const userPasses = passes.value.filter(p => p.userId === dataToSave.userId)
      const overlapCheck = checkDateOverlap(
        dataToSave.startDate,
        dataToSave.endDate,
        userPasses,
        editingPass.value?.id || null,
      )
      
      if (overlapCheck.overlaps) {
        const existing = overlapCheck.existingPass
        const existingStart = new Date(existing.startDate).toLocaleDateString('pl-PL')
        const existingEnd = new Date(existing.endDate).toLocaleDateString('pl-PL')
        toast?.showError(`Masz już aktywny karnet w zakresie dat ${existingStart} - ${existingEnd}. Zakresy dat nie mogą się nakładać.`)
        return
      }
    }
    
    if (editingPass.value) {
      await api.patch(`/passes/${editingPass.value.id}`, dataToSave)
      toast?.showSuccess('Karnet został zaktualizowany')
    } else {
      await api.post('/passes', dataToSave)
      toast?.showSuccess(isClient.value ? 'Karnet został zakupiony' : 'Karnet został utworzony')
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
  // Wymuś odświeżenie danych przy każdym załadowaniu komponentu
  loadPasses()
})

// Odśwież dane również gdy użytkownik się zmieni
watch(() => currentUser.value?.id, () => {
  if (currentUser.value?.id) {
    loadPasses()
  }
}, { immediate: false })
</script>

