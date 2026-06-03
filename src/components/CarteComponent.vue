<template>
  <div class="map-container">

    <div class="sidebar">

      <h2 class="sidebar-title">
        Détails du lieu
      </h2>

      <div v-if="selectedPlace" class="place-card">

        <div class="place-header">

          <h3 class="place-name">
            {{ selectedPlace.name }} 
          </h3>

          <span class="place-type">
            {{ selectedPlace.type }}
          </span>

        </div>

        <div class="place-info">

          <p class="place-address">
            <strong>Adresse :</strong><br>
            {{ selectedPlace.address }}
          </p>

          <p class="coords">
            {{ selectedPlace.latitude }},
            {{ selectedPlace.longitude }}
          </p>

        </div>

        <div class="users-section">

          <h3>Utilisateurs liés</h3>

          <div
            v-if="selectedPlace.users.length > 0"
            class="users-list"
          >

            <div
              v-for="user in selectedPlace.users"
              :key="user.id"
              class="user-card"
            >
            <div class="user-map">
              <div class="user-name">
                {{ user.name }}
              </div>

              <div class="user-email">
                {{ user.email }}
              </div>
            </div>

              <div class="roles">

                <span
                  v-for="role in user.roles"
                  :key="role.id"
                  class="role-badge"
                >
                  {{ role.name }}
                </span>

              </div>

            </div>

          </div>

          <p v-else>
            Aucun utilisateur lié
          </p>

        </div>

      </div>

      <div v-else>
        Clique sur un marker de la carte
      </div>

    </div>

    <div id="map" class="map"></div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { placeService } from '../services/placeService'

const markers: Map<number, L.Marker> = new Map()

interface Place {
  id: number
  name: string
  address: string
  type: string
  latitude: number
  longitude: number

  users: {
    id: number
    name: string
    email: string
    roles: {
      id: number
      name: string
    }[]
  }[]
}

const places = ref<Place[]>([])
const selectedPlace = ref<Place | null>(null)

onMounted(async () => {
  places.value = await placeService.getAllPlaces()

  const map = L.map('map').setView([46.603354, 1.888334], 6)

  L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      attribution: 'OpenStreetMap'
    }
  ).addTo(map)

  for (const place of places.value) {

    const marker = L.marker([
      Number(place.latitude),
      Number(place.longitude)
    ]).addTo(map)

    marker.bindPopup(`
      <div class="popup-content">
        <strong>${place.name}</strong><br>
        <small>${place.type}</small><br>
        ${place.address}
      </div>
    `)

    markers.set(place.id, marker)

    marker.on('click', () => {
      selectPlace(place)
    })
  }
})

const selectPlace = (place: Place) => {
  selectedPlace.value = place

  const marker = markers.get(place.id)

  if (marker) {
    marker.openPopup()
  }
}


</script>

<style scoped>
.map-container {
  display: flex;
  width: 100%;
  height: 100vh;
  padding: 10px;
  border-top: 1px solid #e0e0e0;
}

.sidebar {
  width: 350px;
  overflow-y: auto;
  border-right: 1px solid #e0e0e0;
  padding: 20px;
}


.places-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.place-card {
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: var(--background-1);
  cursor: pointer;
  transition: 0.2s;
}

.place-card:hover {
  border-color: #1f73e7;
}

.place-card.active {
  border-color: #1f73e7;
}

.place-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.place-name {
  margin: 0;
  font-size: 15px;
}

.place-type {
  background: #1f73e7;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
}

.place-info {
  font-size: 13px;
  color: #5f6368;
}

.coords {
  margin-top: 10px;
  font-size: 12px;
  color: #999;
}

.map {
  flex: 1;
}

:deep(.popup-content) {
  min-width: 200px;
}

.users-section {
  margin-top: 20px;
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.user-card {
  padding: 12px;
  border-radius: 8px;
  background: var(--background-2);
  border: 1px solid #2f2f2f;
}

.user-name {
  font-weight: bold;
  align-items: left;
}

.user-email {
  font-size: 13px;
  margin-top: 4px;
  color: #999;
}

.user-card{
  display: flex;
  flex-direction: column;
  text-align: left;
}

.roles {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.role-badge {
  background: #1f73e7;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
}
</style>