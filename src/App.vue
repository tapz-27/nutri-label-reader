<template>
  <v-app>
    <!-- Simple top bar without colors for structure -->
    <v-app-bar app elevation="1">
      <v-app-bar-title class="text-center w-100">NutriScan</v-app-bar-title>
    </v-app-bar>

    <!-- Main layout area, centered content -->
    <v-main class="d-flex justify-center">
      <v-container class="fill-height pa-0" fluid>
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
// Main layout container
</script>

<style>
/* Stripping background colors as requested */
body {
  margin: 0;
  font-family: 'Roboto', sans-serif;
}
</style>
