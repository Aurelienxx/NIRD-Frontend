<template>
  <div class="auth-container">
    <div class="auth-card">

      <div v-if="auth.errorMessage" class="message error-message">
        {{ auth.errorMessage }}
      </div>

      <div v-if="auth.successMessage" class="message success-message">
        {{ auth.successMessage }}
      </div>

      <n-tabs v-model:value="tab" type="segment">

        <!-- CONNEXION -->
        <n-tab-pane name="login" tab="Connexion">

          <form @submit.prevent="handleLogin" class="auth-form">

            <h2>Connexion</h2>

            <div class="form-group">
              <label>Email</label>
              <input
                v-model="loginForm.email"
                type="email"
                required
              />
            </div>

            <div class="form-group">
              <label>Mot de passe</label>
              <input
                v-model="loginForm.password"
                type="password"
                required
              />
            </div>

            <button
              type="submit"
              class="btn btn-primary"
              :disabled="auth.loading"
            >
              Connexion
            </button>

          </form>

        </n-tab-pane>

        <!-- INSCRIPTION -->
        <n-tab-pane name="signup" tab="Inscription">

          <form @submit.prevent="handleSignup" class="auth-form">

            <h2>Inscription</h2>

            <div class="form-group">
              <label>Nom</label>
              <input
                v-model="signupForm.name"
                type="text"
                required
              />
            </div>

            <div class="form-group">
              <label>Email</label>
              <input
                v-model="signupForm.email"
                type="email"
                required
              />
            </div>

            <div class="form-group">
              <label>Mot de passe</label>
              <input
                v-model="signupForm.password"
                type="password"
                required
              />
            </div>

            <!-- SELECT ROLE -->
            <div class="form-group">

              <label>Rôle</label>

              <n-select
                v-model:value="selectedRoleId"
                :options="roleOptions"
                placeholder="Choisir un rôle"
              />
            </div>

            <!-- SELECT LOCALITE -->
            <div class="form-group">

              <label>Localité</label>

              <n-select
                v-model:value="selectedPlaceId"
                :options="placeOptions"
                placeholder="Choisir une localité"
              />
              <div class="add-place-link">
                <span @click="addPlaceId = !addPlaceId">
                  Ajouter une nouvelle localité
                </span>
              </div>

            </div>

            <!-- AJOUT LOCALITE -->
            <div class="create-place" v-if="addPlaceId">

              <h3>Ajouter une localité</h3>

              <div class="form-group">
                <label>Nom du lieu</label>

                <input
                  v-model="newPlace.name"
                  type="text"
                  placeholder="Ex: IUT de Calais"
                />
              </div>

              <div class="form-group">
                <label>Adresse</label>

                <input
                  v-model="newPlace.address"
                  type="text"
                  placeholder="Ex: 19 Rue Louis David, 62100 Calais"
                />
              </div>

              <div class="form-group">
                <label>Description</label>
                  <textarea
                    id="description"
                    v-model="newPlace.description"
                    placeholder="Ex: L'IUT de Calais est un établissement d'enseignement supérieur situé à Calais, en France. Il propose des formations dans l'informatique, l'administration etc."
                    rows="3"
                  ></textarea>
              </div>

              <div class="form-group">
                <label>Type</label>

                <input
                  v-model="newPlace.type"
                  type="text"
                  placeholder="Ex: Établissement d'enseignement supérieur"
                />
              </div>

              <button
                type="button"
                class="btn btn-secondary"
                @click="createPlace"
              >
                Ajouter cette localité
              </button>

            </div>

            <button
              type="submit"
              class="btn btn-primary"
              :disabled="auth.loading || !selectedPlaceId"
            >
              S'inscrire
            </button>

          </form>

        </n-tab-pane>

      </n-tabs>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { NTabs, NTabPane, NSelect } from 'naive-ui'
import { useAuthStore } from '../services/authService'
import { placeService } from '../services/placeService'
import { roleService } from '../services/roleService'
import { useRouter } from 'vue-router'
import { OpenStreetMapProvider } from 'leaflet-geosearch'

const auth = useAuthStore()
const router = useRouter()

const addPlaceId = ref(false)

const tab = ref('login')

const loginForm = ref({
  email: '',
  password: ''
})

const signupForm = ref({
  name: '',
  email: '',
  password: ''
})

const newPlace = ref({
  name: '',
  description: '',
  address: '',
  type: ''
})

const selectedPlaceId = ref(null)
const selectedRoleId = ref(null)

const places = ref([])
const placeOptions = ref([])

const roles = ref([])
const roleOptions = ref([])

const provider = new OpenStreetMapProvider()



onMounted(async () => {
  places.value = await placeService.getAllLocations()

  placeOptions.value = places.value.map(p => ({
    label: p.name + ' - ' + p.address,
    value: p.id
  }))

  roles.value = await roleService.getSignupRoles()

  roleOptions.value = roles.value.map(r => ({
    label: r.name,
    value: r.id
  }))
})

const handleLogin = async () => {
  const ok = await auth.login(loginForm.value)

  if (ok) {
    setTimeout(() => router.push('/'), 800)
  }
}

const handleSignup = async () => {
  const ok = await auth.signup({
    name: signupForm.value.name,
    email: signupForm.value.email,
    password: signupForm.value.password,
    roleId: selectedRoleId.value,
    placeId: selectedPlaceId.value
  })

  if (ok) {
    tab.value = 'login'

    signupForm.value = {
      name: '',
      email: '',
      password: ''
    }

    selectedPlaceId.value = null
    selectedRoleId.value = null

    setTimeout(() => router.push('/'), 800)
  }
}

const createPlace = async () => {
  try {

  const results = await provider.search({
    query: newPlace.value.address
  })

  if (results.length === 0) {
    auth.errorMessage = 'Adresse introuvable'
    return
  }

  const result = results[0]

  const createdPlace = await placeService.createPlace({
    name: newPlace.value.name,
    address: newPlace.value.address,
    description: newPlace.value.description ?? '',
    type: newPlace.value.type,
    latitude: result.y,
    longitude: result.x,
  })

  places.value.push(createdPlace)

  placeOptions.value.push({
    label: createdPlace.name + ' - ' + createdPlace.address,
    value: createdPlace.id
  })

  selectedPlaceId.value = createdPlace.id

  newPlace.value = {
  name: '',
  description: '',
  address: '',
  type: ''
}

  } catch (e) {
  console.error(e)
  }
}

</script>
<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, var(--background-1) 0%, var(--background-2) 100%);
}

.auth-card {
  width: 100%;
  max-width: 500px;
  background: var(--background-2);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  max-height: 90vh;
  overflow-y: auto;
}

.auth-form {
  padding: 2rem;
}

.message {
  margin: 1rem;
  padding: 1rem;
  border-radius: 8px;
}

.error-message {
  background-color: rgba(255, 59, 48, 0.1);
  color: #ff3b30;
}

.success-message {
  background-color: rgba(52, 211, 153, 0.1);
  color: #34d399;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
}

input {
  width: 100%;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.add-place-link {
  margin-top: 0.5rem;
}

.add-place-link span {
  color: var(--lk-1);
  cursor: pointer;
  font-size: 0.9rem;
  text-decoration: underline;
}

.add-place-link span:hover {
  color: var(--lk-2);
}

:deep(.n-tabs-rail) {
background: var(--background-1);
}

:deep(.n-tabs) { 
  color: var(--text-light); 
} 

:deep(.n-tabs-nav) { 
  background: var(--background-1); 
  border-bottom: none; 
} 

:deep(.n-tabs-tab) { 
  color: var(--text-light); 
  transition: all 0.2s ease; 
} 

:deep(.n-tabs-tab:hover) { 
  border-bottom: 2px solid #1f73e7; 
  color: var(--text-light); 
} 

:deep(.n-tabs-tab--active) { 
  background: var(--background-2); 
  color: var(--text-light); 
  border-bottom: 2px solid #1f73e7; 
} 

</style>