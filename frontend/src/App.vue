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
  </v-app>
</template>

<script setup>
// App component
</script>

