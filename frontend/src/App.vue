<template>
  <v-app>
    <v-app-bar color="primary" prominent>
      <v-app-bar-title>Panel Siłowni</v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn to="/" variant="text">Strona główna</v-btn>
      <v-btn to="/users" variant="text">Użytkownicy</v-btn>
      <v-btn to="/passes" variant="text">Karnety</v-btn>
      <v-btn to="/bookings" variant="text">Rezerwacje</v-btn>
      <v-btn to="/employees" variant="text">Pracownicy</v-btn>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>

    <!-- Global Snackbar for notifications -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
      location="top right"
    >
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">Zamknij</v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup>
import { useToast } from './composables/useToast'
import { provide } from 'vue'

const { snackbar, showSuccess, showError, showInfo } = useToast()

// Provide toast functions to all child components
provide('toast', { showSuccess, showError, showInfo })
</script>

