<script setup lang="ts">
import Header from './layouts/Header.vue'
import Footer from './layouts/Footer.vue'
import { NMessageProvider } from 'naive-ui'
</script>

<template>
  <n-message-provider>
    <div id="app">
      <Header />
      <main>
        <router-view />
      </main>
      <Footer />
    </div>
  </n-message-provider>
</template>

<style scoped>
/* App layout - déjà dans style.css global */
</style>
