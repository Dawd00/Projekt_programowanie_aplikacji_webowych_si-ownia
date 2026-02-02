<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h3 mb-4">Witaj w Panelu Siłowni</h1>
        <p class="text-body-1">
          System zarządzania siłownią umożliwiający zarządzanie klientami, karnetami, rezerwacjami i trenerami.
        </p>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12" md="4">
        <v-card v-if="canManageUsers">
          <v-card-title>Użytkownicy</v-card-title>
          <v-card-text>
            Zarządzaj użytkownikami systemu - klientami, trenerami i pracownikami.
          </v-card-text>
          <v-card-actions>
            <v-btn to="/users" color="primary">Przejdź</v-btn>
          </v-card-actions>
        </v-card>
        <v-card v-else style="opacity: 0.5; pointer-events: none;">
          <v-card-title>Użytkownicy</v-card-title>
          <v-card-text>
            Funkcja dostępna tylko dla administratorów i pracowników.
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Karnety</v-card-title>
          <v-card-text>
            <template v-if="canManagePasses">
              Zarządzaj karnetami klientów - dodawaj, edytuj i przeglądaj karnety.
            </template>
            <template v-else>
              Przeglądaj i kupuj karnety na zajęcia w siłowni.
            </template>
          </v-card-text>
          <v-card-actions>
            <v-btn to="/passes" color="primary">Przejdź</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Rezerwacje</v-card-title>
          <v-card-text>
            Zarządzaj rezerwacjami zajęć z trenerem personalnym i wynajmem sal.
          </v-card-text>
          <v-card-actions>
            <v-btn to="/bookings" color="primary">Przejdź</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card v-if="canManageSessions">
          <v-card-title>Sesje</v-card-title>
          <v-card-text>
            Zarządzaj dostępnymi terminami zajęć i przypisanymi salami.
          </v-card-text>
          <v-card-actions>
            <v-btn to="/sessions" color="primary">Przejdź</v-btn>
          </v-card-actions>
        </v-card>
        <v-card v-else style="opacity: 0.5; pointer-events: none;">
          <v-card-title>Sesje</v-card-title>
          <v-card-text>
            Funkcja dostępna tylko dla administratorów i pracowników.
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card v-if="canManageEmployees">
          <v-card-title>Pracownicy</v-card-title>
          <v-card-text>
            Zarządzaj pracownikami siłowni - recepcja, zarząd, konserwacja.
          </v-card-text>
          <v-card-actions>
            <v-btn to="/employees" color="primary">Przejdź</v-btn>
          </v-card-actions>
        </v-card>
        <v-card v-else style="opacity: 0.5; pointer-events: none;">
          <v-card-title>Pracownicy</v-card-title>
          <v-card-text>
            Funkcja dostępna tylko dla administratorów i pracowników.
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'

const user = ref(null)

const role = computed(() => user.value?.role || null)
const canManageUsers = computed(() => ['ADMIN', 'EMPLOYEE'].includes(role.value))
const canManagePasses = computed(() => ['ADMIN', 'EMPLOYEE'].includes(role.value))
const canManageEmployees = computed(() => ['ADMIN', 'EMPLOYEE'].includes(role.value))
const canManageSessions = computed(() => ['ADMIN', 'EMPLOYEE'].includes(role.value))

onMounted(() => {
  const userData = localStorage.getItem('user')
  if (userData) {
    try {
      user.value = JSON.parse(userData)
    } catch (e) {
      console.error('Error parsing user data:', e)
    }
  }
})
</script>

