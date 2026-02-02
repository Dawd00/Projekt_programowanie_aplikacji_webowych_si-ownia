<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Rezerwacje</h1>
        <v-btn color="primary" @click="openDialog" class="mb-4">
          {{ isClient ? 'Zapisz się na zajęcia / Zarezerwuj salę' : 'Dodaj rezerwację' }}
        </v-btn>
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
              <v-btn icon size="small" @click="editBooking(item)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn icon size="small" @click="deleteBooking(item.id)">
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
        <v-card-title>{{ editingBooking ? 'Edytuj rezerwację' : (isClient ? 'Zapisz się na zajęcia / Zarezerwuj salę' : 'Dodaj rezerwację') }}</v-card-title>
        <v-card-text>
          <form @submit.prevent="saveBooking">
            <v-select
              v-model="formData.roomId"
              label="Sala"
              :items="roomOptions"
              item-title="name"
              item-value="id"
              :error-messages="formErrors.roomId"
              required
            ></v-select>
            <v-select
              v-model="formData.date"
              label="Data"
              :items="dateOptions"
              :error-messages="formErrors.date"
              required
            ></v-select>
            <v-select
              v-model="formData.sessionId"
              :label="isClient ? 'Godzina i typ zajęć' : 'Godzina'"
              :items="sessionOptions"
              item-title="label"
              item-value="id"
              :error-messages="formErrors.sessionId"
              :hint="isClient ? 'Wybierz zajęcia grupowe lub zarezerwuj salę na trening personalny' : ''"
              persistent-hint
              required
            ></v-select>
            <v-select
              v-if="canManageStatus"
              v-model="formData.status"
              label="Status"
              :items="statuses"
              :error-messages="formErrors.status"
              required
            ></v-select>
            <v-textarea
              v-model="formData.notes"
              label="Notatki"
              :error-messages="formErrors.notes"
            ></v-textarea>
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
import { ref, onMounted, inject, computed, watch, nextTick } from 'vue'
import * as yup from 'yup'
import api from '../services/api'

const toast = inject('toast')

const bookings = ref([])
const rooms = ref([])
const sessions = ref([])
const users = ref([])
const loading = ref(false)
const dialog = ref(false)
const editingBooking = ref(null)
const currentPage = ref(1)
const pagination = ref({ limit: 20, offset: 0, total: 0 })
const currentUser = ref(null)
const isHydrating = ref(false)

const headers = computed(() => {
  const baseHeaders = [
    { title: 'Użytkownik', key: 'userName' },
    { title: 'Sala', key: 'roomName' },
    { title: 'Data', key: 'sessionDate' },
    { title: 'Godzina', key: 'sessionTime' },
    { title: 'Typ', key: 'sessionType' },
    { title: 'Status', key: 'status' },
    { title: 'Data utworzenia', key: 'createdAt' },
    { title: 'Akcje', key: 'actions', sortable: false },
  ]

  if (!canManageStatus.value) {
    return baseHeaders.filter((header) => header.key !== 'actions')
  }

  return baseHeaders
})

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

const formErrors = ref({})

const role = computed(() => currentUser.value?.role || null)
const isClient = computed(() => role.value === 'CLIENT')
const canManageStatus = computed(() => ['ADMIN', 'EMPLOYEE'].includes(role.value))

const roomOptions = computed(() => rooms.value)

const dateKey = (value) => {
  if (!value) return ''
  if (typeof value === 'string' && value.length >= 10) {
    return value.slice(0, 10)
  }
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

const buildSessionLabel = (session) => {
  if (!session) return ''
  let label = `${session.startTime} - ${session.endTime}`
  if (session.type === 'GROUP') {
    label += ` (Zajęcia grupowe)`
  } else {
    label += ` (Trening personalny)`
  }
  return label
}

const confirmedCountBySession = computed(() => {
  const map = {}
  bookings.value.forEach((booking) => {
    if (booking.status !== 'CONFIRMED') return
    map[booking.sessionId] = (map[booking.sessionId] || 0) + 1
  })
  return map
})

const sessionOptions = computed(() => {
  if (!formData.value.roomId || !formData.value.date) return []
  const filteredSessions = sessions.value.filter(
    (s) =>
      s.roomId === formData.value.roomId &&
      dateKey(s.date) === formData.value.date,
  )

  const options = filteredSessions
    .filter((s) => {
      if (!canManageStatus.value) return true
      if (editingBooking.value?.sessionId === s.id) return true
      const confirmedCount = confirmedCountBySession.value[s.id] || 0
      return confirmedCount < s.maxSlots
    })
    .map((s) => ({
      id: s.id,
      label: buildSessionLabel(s),
      type: s.type,
    }))

  if (formData.value.sessionId && !options.find((o) => o.id === formData.value.sessionId)) {
    const session = sessionsById.value[formData.value.sessionId]
    if (session) {
      options.unshift({
        id: session.id,
        label: buildSessionLabel(session),
        type: session.type,
      })
    }
  }

  return options
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

const usersById = computed(() => {
  const map = {}
  users.value.forEach((user) => {
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim()
    map[user.id] = name || user.email || '—'
  })
  return map
})

const bookingsWithSession = computed(() =>
  bookings.value.map((booking) => {
    const session = sessionsById.value[booking.sessionId]
    const room = session ? roomsById.value[session.roomId] : null
    const userName =
      usersById.value[booking.userId] ||
      (currentUser.value?.id === booking.userId
        ? `${currentUser.value?.firstName || ''} ${currentUser.value?.lastName || ''}`.trim() ||
          currentUser.value?.email ||
          '—'
        : '—')
    return {
      ...booking,
      userName,
      roomName: room?.name || '—',
      sessionDate: session ? dateKey(session.date) : '—',
      sessionTime: session ? `${session.startTime} - ${session.endTime}` : '—',
      sessionType:
        session?.type === 'GROUP'
          ? 'Zajęcia grupowe'
          : session?.type === 'PERSONAL'
          ? 'Trening personalny'
          : '—',
    }
  }),
)

watch(
  () => formData.value.roomId,
  () => {
    if (isHydrating.value) return
    formData.value.date = ''
    formData.value.sessionId = ''
    if (formErrors.value.roomId) formErrors.value.roomId = ''
    if (formErrors.value.date) formErrors.value.date = ''
    if (formErrors.value.sessionId) formErrors.value.sessionId = ''
  },
)

watch(
  () => formData.value.date,
  () => {
    if (isHydrating.value) return
    formData.value.sessionId = ''
    if (formErrors.value.date) formErrors.value.date = ''
    if (formErrors.value.sessionId) formErrors.value.sessionId = ''
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

const loadUsers = async () => {
  if (!canManageStatus.value) return
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
  formErrors.value = {}
  dialog.value = true
}

const editBooking = async (booking) => {
  isHydrating.value = true
  await Promise.all([loadRooms(), loadSessions()])
  const session = sessionsById.value[booking.sessionId]
  editingBooking.value = booking
  formData.value = {
    sessionId: booking.sessionId,
    roomId: session?.roomId || '',
    date: session ? dateKey(session.date) : '',
    status: booking.status || 'PENDING',
    notes: booking.notes || '',
  }
  formErrors.value = {}
  await nextTick()
  isHydrating.value = false
  dialog.value = true
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

const saveBooking = async () => {
  const values = { ...formData.value }
  const isValid = await validateForm()
  if (!isValid) return
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
  Promise.all([loadRooms(), loadSessions(), loadUsers()]).then(() => {
    loadBookings()
  })
})
</script>

