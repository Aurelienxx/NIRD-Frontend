<script setup lang="ts">
import Header from './layouts/Header.vue'
import Footer from './layouts/Footer.vue'
</script>

<template>
  <div id="app">
    <Header />
    <main>
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<style scoped>
/* App layout - déjà dans style.css global */
</style>
