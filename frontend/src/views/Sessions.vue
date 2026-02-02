<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Sesje</h1>
        <v-btn color="primary" @click="openDialog" class="mb-4">Dodaj sesję</v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-data-table
          :headers="headers"
          :items="sessionsWithDetails"
          :loading="loading"
          :items-per-page="pagination.limit"
          :page="currentPage"
          @update:page="handlePageChange"
        >
          <template v-slot:item.price="{ item }">
            {{ formatPrice(item.price) }}
          </template>
          <template v-slot:item.actions="{ item }">
            <v-btn icon size="small" @click="editSession(item)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon size="small" @click="deleteSession(item.id)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <!-- Dialog for create/edit -->
    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title>{{ editingSession ? 'Edytuj sesję' : 'Dodaj sesję' }}</v-card-title>
        <v-card-text>
          <form @submit.prevent="saveSession">
            <v-select
              v-model="formData.trainerId"
              label="Trener"
              :items="trainerOptions"
              item-title="label"
              item-value="id"
              :error-messages="formErrors.trainerId"
              required
            ></v-select>
            <v-select
              v-model="formData.type"
              label="Typ"
              :items="sessionTypes"
              :error-messages="formErrors.type"
              required
            ></v-select>
            <v-text-field
              v-model="formData.date"
              label="Data"
              type="date"
              :error-messages="formErrors.date"
              required
            ></v-text-field>
            <v-text-field
              v-model="formData.startTime"
              label="Godzina rozpoczęcia"
              type="time"
              :error-messages="formErrors.startTime"
              required
            ></v-text-field>
            <v-text-field
              v-model="formData.endTime"
              label="Godzina zakończenia"
              type="time"
              :error-messages="formErrors.endTime"
              required
            ></v-text-field>
            <v-text-field
              v-model="formData.maxSlots"
              label="Limit miejsc"
              type="number"
              :error-messages="formErrors.maxSlots"
              required
            ></v-text-field>
            <v-text-field
              v-model="formData.price"
              label="Cena"
              type="number"
              suffix="zł"
              :error-messages="formErrors.price"
              required
            ></v-text-field>
            <v-select
              v-model="formData.roomId"
              label="Sala (opcjonalnie)"
              :items="roomOptions"
              item-title="label"
              item-value="id"
              :error-messages="formErrors.roomId"
            ></v-select>
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
import { ref, computed, onMounted, inject } from 'vue'
import * as yup from 'yup'
import api from '../services/api'

const toast = inject('toast')

const sessions = ref([])
const trainers = ref([])
const rooms = ref([])
const loading = ref(false)
const dialog = ref(false)
const editingSession = ref(null)
const currentPage = ref(1)
const pagination = ref({ limit: 20, offset: 0, total: 0 })

const headers = [
  { title: 'Trener', key: 'trainerName' },
  { title: 'Typ', key: 'type' },
  { title: 'Data', key: 'date' },
  { title: 'Godzina', key: 'time' },
  { title: 'Sala', key: 'roomName' },
  { title: 'Limit', key: 'maxSlots' },
  { title: 'Cena', key: 'price' },
  { title: 'Akcje', key: 'actions', sortable: false },
]

const sessionTypes = ['PERSONAL', 'GROUP']

const schema = yup.object({
  trainerId: yup.string().required('Trener jest wymagany').uuid('Nieprawidłowy format UUID'),
  type: yup.string().required('Typ jest wymagany').oneOf(sessionTypes, 'Nieprawidłowy typ'),
  date: yup.string().required('Data jest wymagana'),
  startTime: yup.string().required('Godzina rozpoczęcia jest wymagana'),
  endTime: yup
    .string()
    .required('Godzina zakończenia jest wymagana')
    .test('is-after-start', 'Godzina zakończenia musi być po rozpoczęciu', function (value) {
      const { startTime } = this.parent
      if (!startTime || !value) return true
      return value > startTime
    }),
  maxSlots: yup.number().required('Limit miejsc jest wymagany').min(1, 'Limit musi być >= 1'),
  price: yup.number().required('Cena jest wymagana').min(0, 'Cena musi być >= 0'),
  roomId: yup
    .string()
    .nullable()
    .test('is-uuid-or-empty', 'Nieprawidłowy format UUID', (value) => {
      if (!value) return true
      return /^[0-9a-fA-F-]{36}$/.test(value)
    }),
})

const formData = ref({
  trainerId: '',
  type: 'PERSONAL',
  date: '',
  startTime: '',
  endTime: '',
  maxSlots: 1,
  price: 0,
  roomId: '',
})

const formErrors = ref({})

const trainersById = computed(() => {
  const map = {}
  trainers.value.forEach((trainer) => {
    map[trainer.id] = trainer
  })
  return map
})

const roomsById = computed(() => {
  const map = {}
  rooms.value.forEach((room) => {
    map[room.id] = room
  })
  return map
})

const trainerOptions = computed(() =>
  trainers.value.map((trainer) => {
    const user = trainer.user || {}
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim()
    return {
      id: trainer.id,
      label: name ? `${name} (${user.email || 'brak email'})` : user.email || trainer.id,
    }
  }),
)

const roomOptions = computed(() => {
  const options = rooms.value.map((room) => ({
    id: room.id,
    label: room.name,
  }))
  return [{ id: '', label: 'Brak' }, ...options]
})

const sessionsWithDetails = computed(() =>
  sessions.value.map((session) => {
    const trainer = trainersById.value[session.trainerId]
    const room = session.roomId ? roomsById.value[session.roomId] : null
    const user = trainer?.user || {}
    const trainerName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || '—'
    return {
      ...session,
      trainerName,
      roomName: room?.name || '—',
      date: formatDate(session.date),
      time: `${session.startTime} - ${session.endTime}`,
    }
  }),
)

const formatDateInput = (value) => {
  if (!value) return ''
  if (typeof value === 'string' && value.length >= 10) return value.slice(0, 10)
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

const formatDate = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('pl-PL')
}

const formatPrice = (value) => {
  const numberValue = Number(value)
  if (Number.isNaN(numberValue)) return '—'
  return `${numberValue.toFixed(2)} zł`
}

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

const normalizePayload = () => {
  const payload = { ...formData.value }
  payload.maxSlots = Number(payload.maxSlots)
  payload.price = Number(payload.price)
  if (!payload.roomId) {
    delete payload.roomId
  }
  return payload
}

const loadSessions = async () => {
  loading.value = true
  try {
    const response = await api.get('/sessions', {
      params: {
        limit: pagination.value.limit,
        offset: pagination.value.offset,
      },
    })
    sessions.value = response.data
    pagination.value = response.pagination
  } catch (error) {
    console.error('Error loading sessions:', error)
    toast?.showError('Wystąpił błąd podczas ładowania sesji')
  } finally {
    loading.value = false
  }
}

const loadTrainers = async () => {
  try {
    const response = await api.get('/trainers', {
      params: { limit: 200, offset: 0 },
    })
    trainers.value = response.data
  } catch (error) {
    console.error('Error loading trainers:', error)
    toast?.showError('Wystąpił błąd podczas ładowania trenerów')
  }
}

const loadRooms = async () => {
  try {
    const response = await api.get('/rooms', {
      params: { limit: 200, offset: 0 },
    })
    rooms.value = response.data
  } catch (error) {
    console.error('Error loading rooms:', error)
    toast?.showError('Wystąpił błąd podczas ładowania sal')
  }
}

const openDialog = () => {
  editingSession.value = null
  formData.value = {
    trainerId: '',
    type: 'PERSONAL',
    date: '',
    startTime: '',
    endTime: '',
    maxSlots: 1,
    price: 0,
    roomId: '',
  }
  formErrors.value = {}
  dialog.value = true
}

const editSession = (session) => {
  editingSession.value = session
  formData.value = {
    trainerId: session.trainerId || '',
    type: session.type || 'PERSONAL',
    date: formatDateInput(session.date),
    startTime: session.startTime || '',
    endTime: session.endTime || '',
    maxSlots: Number(session.maxSlots) || 1,
    price: Number(session.price) || 0,
    roomId: session.roomId || '',
  }
  formErrors.value = {}
  dialog.value = true
}

const saveSession = async () => {
  const isValid = await validateForm()
  if (!isValid) return
  try {
    const payload = normalizePayload()
    if (editingSession.value) {
      await api.patch(`/sessions/${editingSession.value.id}`, payload)
      toast?.showSuccess('Sesja została zaktualizowana')
    } else {
      await api.post('/sessions', payload)
      toast?.showSuccess('Sesja została utworzona')
    }
    dialog.value = false
    loadSessions()
  } catch (error) {
    console.error('Error saving session:', error)
    const errorMessage = error.response?.data?.message || 'Wystąpił błąd podczas zapisywania sesji'
    toast?.showError(errorMessage)
  }
}

const deleteSession = async (id) => {
  if (confirm('Czy na pewno chcesz usunąć tę sesję?')) {
    try {
      await api.delete(`/sessions/${id}`)
      toast?.showSuccess('Sesja została usunięta')
      loadSessions()
    } catch (error) {
      console.error('Error deleting session:', error)
      const errorMessage = error.response?.data?.message || 'Wystąpił błąd podczas usuwania sesji'
      toast?.showError(errorMessage)
    }
  }
}

const handlePageChange = (page) => {
  currentPage.value = page
  pagination.value.offset = (page - 1) * pagination.value.limit
  loadSessions()
}

onMounted(() => {
  loadSessions()
  loadTrainers()
  loadRooms()
})
</script>

