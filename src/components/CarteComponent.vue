<template>
  <div class="map-container">
    <div class="sidebar">
      <h2 class="sidebar-title">Nos acteurs</h2>

      <div class="places-list">
        <div
          v-for="place in places"
          :key="place.id"
          class="place-card"
          :class="{ active: selectedPlace?.id === place.id }"
          @click="selectPlace(place)"
        >
          <div class="place-header">
            <h3 class="place-name">{{ place.name }}</h3>
            <span class="place-type">{{ place.type }}</span>
          </div>

          <div class="place-info">
            <p class="place-address">
              <strong>Adresse :</strong><br>
              {{ place.address }}
            </p>

            <p class="place-location">
              <strong>Lieu :</strong>
              {{ place.location }}
            </p>

            <p class="coords">
              {{ place.latitude }},
              {{ place.longitude }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div id="map" class="map"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import { OpenStreetMapProvider } from 'leaflet-geosearch'

interface Place {
  id: number
  name: string
  address: string
  location: string
  type: string

  latitude?: number
  longitude?: number
}

const places = ref<Place[]>([
  {
    id: 1,
    name: 'Cité Scolaire Camille Claudel',
    address: 'Fourmies, France',
    location: 'Fourmies',
    type: 'Cité scolaire'
  },
  {
    id: 2,
    name: 'Cité scolaire Bellevue',
    address: 'Albi, France',
    location: 'Albi',
    type: 'Cité scolaire'
  },
  {
    id: 3,
    name: 'Collège Coat Mez',
    address: 'Daoulas, France',
    location: 'Daoulas',
    type: 'Collège'
  },
  {
    id: 4,
    name: 'Collège F.R. Chateaubriand',
    address: 'Combourg, France',
    location: 'Combourg',
    type: 'Collège'
  },
  {
    id: 5,
    name: 'Collège Les Cuvelles',
    address: 'Vaucouleurs, France',
    location: 'Vaucouleurs',
    type: 'Collège'
  },
  {
    id: 6,
    name: 'Collège Paul Drouot',
    address: 'Vouziers, France',
    location: 'Vouziers',
    type: 'Collège'
  },
  {
    id: 7,
    name: 'Collège Simone Signoret',
    address: 'Bruay-la-Buissière, France',
    location: 'Bruay-la-Buissière',
    type: 'Collège'
  },
])

const selectedPlace = ref<Place | null>(null)

const markers: Map<number, L.Marker> = new Map()

const provider = new OpenStreetMapProvider()

const selectPlace = (place: Place) => {
  selectedPlace.value = place

  const marker = markers.get(place.id)

  if (marker) {
    marker.openPopup()
  }
}

const geocodeAddress = async (place: Place) => {
  try {
    const results = await provider.search({
      query: place.address
    })

    if (results.length > 0) {
      place.latitude = results[0].y
      place.longitude = results[0].x

      /*
        Ici tu sauvegardes en base
      */

      await saveCoordinates(place)
    }
  } catch (error) {
    console.error('Erreur géocodage :', error)
  }
}

const saveCoordinates = async (place: Place) => {
  try {
    /*
      Exemple API backend
    */

    await fetch(`http://localhost:8080/places/${place.id}/coords`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        latitude: place.latitude,
        longitude: place.longitude
      })
    })
  } catch (error) {
    console.error('Erreur sauvegarde coordonnées :', error)
  }
}

onMounted(async () => {
  const map = L.map('map').setView([50.9513, 1.8587], 13)

  L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      attribution: 'OpenStreetMap'
    }
  ).addTo(map)

  for (const place of places.value) {

    /*
      Si coordonnées absentes :
      géocodage + sauvegarde base
    */

    if (
      place.latitude === undefined ||
      place.longitude === undefined
    ) {
      await geocodeAddress(place)
    }

    /*
      Sécurité
    */

    if (
      place.latitude === undefined ||
      place.longitude === undefined
    ) {
      continue
    }

    const marker = L.marker([
      place.latitude,
      place.longitude
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

@media (max-width: 768px) {
  .map-container {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    height: 300px;
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
  }
}
</style>