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
          :items="bookingsWithSession"
          :loading="loading"
          :items-per-page="pagination.limit"
          :page="currentPage"
          @update:page="handlePageChange"
        >
          <template v-slot:item.actions="{ item }">
            <template v-if="canManageStatus">
              <v-btn icon="mdi-pencil" size="small" @click="editBooking(item)"></v-btn>
              <v-btn icon="mdi-delete" size="small" @click="deleteBooking(item.id)"></v-btn>
            </template>
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
            <v-select
              v-model="formData.roomId"
              label="Sala"
              :items="roomOptions"
              item-title="name"
              item-value="id"
              :error-messages="errors.roomId"
              required
            ></v-select>
            <v-select
              v-model="formData.date"
              label="Data"
              :items="dateOptions"
              :error-messages="errors.date"
              required
            ></v-select>
            <v-select
              v-model="formData.sessionId"
              label="Godzina"
              :items="sessionOptions"
              item-title="label"
              item-value="id"
              :error-messages="errors.sessionId"
              required
            ></v-select>
            <v-select
              v-if="canManageStatus"
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
import { ref, onMounted, inject, computed, watch } from 'vue'
import { Form } from 'vee-validate'
import * as yup from 'yup'
import api from '../services/api'

const toast = inject('toast')

const bookings = ref([])
const rooms = ref([])
const sessions = ref([])
const loading = ref(false)
const dialog = ref(false)
const editingBooking = ref(null)
const currentPage = ref(1)
const pagination = ref({ limit: 20, offset: 0, total: 0 })
const currentUser = ref(null)

const headers = [
  { title: 'Sala', key: 'roomName' },
  { title: 'Data', key: 'sessionDate' },
  { title: 'Godzina', key: 'sessionTime' },
  { title: 'Status', key: 'status' },
  { title: 'Data utworzenia', key: 'createdAt' },
  { title: 'Akcje', key: 'actions', sortable: false },
]

const statuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']

const schema = yup.object({
  roomId: yup.string().required('Sala jest wymagana'),
  date: yup.string().required('Data jest wymagana'),
  sessionId: yup.string().required('Godzina jest wymagana'),
  status: yup.string().nullable().oneOf(statuses, 'Nieprawidłowy status'),
  notes: yup.string().nullable().max(500, 'Notatki mogą mieć maksymalnie 500 znaków'),
})

const formData = ref({
  sessionId: '',
  roomId: '',
  date: '',
  status: 'PENDING',
  notes: '',
})

const role = computed(() => currentUser.value?.role || null)
const canManageStatus = computed(() => ['ADMIN', 'EMPLOYEE'].includes(role.value))

const roomOptions = computed(() => rooms.value)

const dateKey = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

const dateOptions = computed(() => {
  if (!formData.value.roomId) return []
  const dates = sessions.value
    .filter((s) => s.roomId === formData.value.roomId)
    .map((s) => dateKey(s.date))
    .filter(Boolean)
  return [...new Set(dates)].sort()
})

const sessionOptions = computed(() => {
  if (!formData.value.roomId || !formData.value.date) return []
  return sessions.value
    .filter(
      (s) =>
        s.roomId === formData.value.roomId &&
        dateKey(s.date) === formData.value.date,
    )
    .map((s) => ({
      id: s.id,
      label: `${s.startTime} - ${s.endTime}`,
    }))
})

const roomsById = computed(() => {
  const map = {}
  rooms.value.forEach((room) => {
    map[room.id] = room
  })
  return map
})

const sessionsById = computed(() => {
  const map = {}
  sessions.value.forEach((session) => {
    map[session.id] = session
  })
  return map
})

const bookingsWithSession = computed(() =>
  bookings.value.map((booking) => {
    const session = sessionsById.value[booking.sessionId]
    const room = session ? roomsById.value[session.roomId] : null
    return {
      ...booking,
      roomName: room?.name || '—',
      sessionDate: session ? dateKey(session.date) : '—',
      sessionTime: session ? `${session.startTime} - ${session.endTime}` : '—',
    }
  }),
)

watch(
  () => formData.value.roomId,
  () => {
    formData.value.date = ''
    formData.value.sessionId = ''
  },
)

watch(
  () => formData.value.date,
  () => {
    formData.value.sessionId = ''
  },
)

const loadRooms = async () => {
  try {
    const response = await api.get('/rooms', {
      params: { limit: 200, offset: 0, isAvailable: true },
    })
    rooms.value = response.data
  } catch (error) {
    console.error('Error loading rooms:', error)
    toast?.showError('Wystąpił błąd podczas ładowania sal')
  }
}

const loadSessions = async () => {
  try {
    const response = await api.get('/sessions', {
      params: { limit: 200, offset: 0 },
    })
    sessions.value = response.data
  } catch (error) {
    console.error('Error loading sessions:', error)
    toast?.showError('Wystąpił błąd podczas ładowania sesji')
  }
}

const loadBookings = async () => {
  loading.value = true
  try {
    const params = {
      limit: pagination.value.limit,
      offset: pagination.value.offset,
    }
    if (role.value === 'CLIENT' && currentUser.value?.id) {
      params.userId = currentUser.value.id
    }
    const response = await api.get('/bookings', {
      params,
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
    sessionId: '',
    roomId: '',
    date: '',
    status: 'PENDING',
    notes: '',
  }
  dialog.value = true
}

const editBooking = (booking) => {
  const session = sessionsById.value[booking.sessionId]
  editingBooking.value = booking
  formData.value = {
    sessionId: booking.sessionId,
    roomId: session?.roomId || '',
    date: session ? dateKey(session.date) : '',
    status: booking.status || 'PENDING',
    notes: booking.notes || '',
  }
  dialog.value = true
}

const saveBooking = async () => {
  const values = { ...formData.value }
  try {
    if (!currentUser.value?.id) {
      toast?.showError('Brak danych użytkownika. Zaloguj się ponownie.')
      return
    }
    if (editingBooking.value) {
      const payload = {
        notes: values.notes,
      }
      if (canManageStatus.value && values.status) {
        payload.status = values.status
      }
      await api.patch(`/bookings/${editingBooking.value.id}`, payload)
      toast?.showSuccess('Rezerwacja została zaktualizowana')
    } else {
      const payload = {
        userId: currentUser.value.id,
        sessionId: values.sessionId,
        notes: values.notes,
      }
      await api.post('/bookings', payload)
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
  const userData = localStorage.getItem('user')
  if (userData) {
    try {
      currentUser.value = JSON.parse(userData)
    } catch (e) {
      console.error('Error parsing user data:', e)
    }
  }
  Promise.all([loadRooms(), loadSessions()]).then(() => {
    loadBookings()
  })
})
</script>

