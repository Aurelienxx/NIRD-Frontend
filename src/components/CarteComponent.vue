<template>
  <div class="map-page">
    <div id="map" class="map"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

onMounted(() => {
  const map = L.map('map').setView([50.9513, 1.8587], 14)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'OpenStreetMap'
  }).addTo(map)

  const lyceeCarnot = L.marker([50.9499, 1.8565]).addTo(map)
  lyceeCarnot.bindPopup('Lycée Carnot Calais')

  const iutCalais = L.marker([50.9519, 1.8589]).addTo(map)
  iutCalais.bindPopup('IUT de Calais')
})
</script>

<style scoped>
.map-page {
  width: 100%;
  height: 100vh;
}

.map {
  width: 100%;
  height: 100%;
}
</style>