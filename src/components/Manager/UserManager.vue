<template>
  <div class="usergroup-manager">
    <n-space justify="space-between" align="center" style="margin-bottom: 24px">
      <div style="font-size: 16px; font-weight: 600">Liste des Utilisateurs</div>
      <n-input
        v-model:value="search"
        placeholder="Rechercher un utilisateur"
      />
    </n-space>
    
    <n-card 
      v-for="user in filteredUsers" 
      :key="user.id" 
      class="user-card" 
      :bordered="false" 
      :segmented="false"
    >
      <div class="user-header">
        <div class="user-info">
          <div class="user-name-block">
            <span class="name">{{ user.name }}</span>
            <n-tag v-if="user.id === currentUserId" type="info" size="small" round style="margin-left: 8px">
              Vous
            </n-tag>
          </div>
          <div class="separateur"> - </div>
          <div class="email">{{ user.email }}</div>
        </div>

        <n-space class="action-buttons">
          <n-button @click="openEdit(user)">
            Modifier rôles
          </n-button>
          
          <n-popconfirm
            @positive-click="deleteUser(user.id)"
            positive-text="Supprimer"
            negative-text="Annuler"
            :disabled="user.id === currentUserId"
          >
            <template #trigger>
              <n-button 
                type="error" 
                ghost
                :disabled="user.id === currentUserId"
                :title="user.id === currentUserId ? 'Vous ne pouvez pas supprimer votre propre compte' : ''"
              >
                Supprimer
              </n-button>
            </template>
            Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
          </n-popconfirm>
        </n-space>
      </div>

      <div class="roles">
        <span v-for="role in user.roles" :key="role.id" class="role">
          {{ role.name }}
        </span>
      </div>
    </n-card>

    <n-modal
      v-model:show="showModal"
      preset="dialog"
      title="Modifier les rôles"
      positive-text="Sauvegarder"
      negative-text="Annuler"
      @positive-click="saveRoles"
      @negative-click="cancelEdit"
    >
      <n-select
        v-model:value="selectedRoles"
        :options="roleOptions"
        multiple
      />
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useMessage } from 'naive-ui'
import { userService } from '../../services/userService'
import { roleService } from '../../services/roleService'

interface Role {
  id: number
  name: string
}

interface User {
  id: number
  name: string
  email: string
  roles: Role[]
}

const message = useMessage()

const users = ref<User[]>([])
const roles = ref<Role[]>([])

const showModal = ref(false)
const selectedUser = ref<User | null>(null)
const selectedRoles = ref<number[]>([])
const search = ref('')

const roleOptions = ref<{ label: string; value: number }[]>([])

/**
 * ID de l'utilisateur actuellement connecté.
 * À lier avec votre Store (Pinia/Vuex) ou décodage de votre Token local.
 * Exemple : const authStore = useAuthStore(); const currentUserId = computed(() => authStore.user.id);
 */
const currentUserId = ref<number | null>(null)

// Simulation de la récupération de l'utilisateur connecté au montage du composant
const fetchCurrentUser = () => {
  try {
    const savedUser = localStorage.getItem('user_session')
    if (savedUser) {
      const parsed = JSON.parse(savedUser)
      currentUserId.value = parsed.id
    } else {
      // ID fallback temporaire pour vos tests si aucun stockage n'est configuré
      currentUserId.value = 1 
    }
  } catch (e) {
    console.error("Impossible de récupérer l'utilisateur connecté", e)
  }
}

const loadUsers = async () => {
  try {
    const data = await userService.getAll()
    users.value = data.map((u: any) => ({
      id: u.id,
      name: u.name || '',
      email: u.email || '',
      roles: u.roles || []
    }))
  } catch (error) {
    message.error('Erreur lors du chargement des utilisateurs')
  }
}

const loadRoles = async () => {
  try {
    roles.value = await roleService.getAll()
    roleOptions.value = roles.value.map(r => ({
      label: r.name,
      value: r.id
    }))
  } catch (error) {
    message.error('Erreur lors du chargement des rôles')
  }
}

const openEdit = (user: User) => {
  selectedUser.value = user
  selectedRoles.value = user.roles.map(r => r.id)
  showModal.value = true
}

const cancelEdit = () => {
  showModal.value = false
  selectedUser.value = null
  selectedRoles.value = []
}

const saveRoles = async () => {
  if (!selectedUser.value) return

  try {
    await userService.update(selectedUser.value.id, {
      roles: selectedRoles.value.map(id => ({ id }))
    })
    message.success('Rôles mis à jour')
  } catch (error) {
    message.error('Erreur lors de la mise à jour des rôles')
  }

  showModal.value = false
  selectedUser.value = null
  selectedRoles.value = []
  await loadUsers()
}

/**
 * Action de suppression d'un utilisateur
 */
const deleteUser = async (id: number) => {
  // Double sécurité préventive côté Front-end
  if (id === currentUserId.value) {
    message.error('Action interdite : vous ne pouvez pas supprimer votre propre compte.')
    return
  }

  try {
    await userService.delete(id)
    message.success('Utilisateur supprimé avec succès')
    await loadUsers() // Rafraîchit le tableau des utilisateurs après suppression
  } catch (error) {
    message.error('Erreur lors de la suppression de l’utilisateur')
    console.error(error)
  }
}

const filteredUsers = computed(() => {
  return users.value.filter(u => {
    return (
      u.name.toLowerCase().includes(search.value.toLowerCase()) ||
      u.email.toLowerCase().includes(search.value.toLowerCase())
    )
  })
})

onMounted(() => {
  fetchCurrentUser()
  loadUsers()
  loadRoles()
})
</script>

<style scoped>
.usergroup-manager {
  display: flex;
  flex-direction: column;
}

.user-card {
  background: var(--background-1);
  border: 1px solid #ffffff;
  border-radius: 8px;
  margin-bottom: 12px;
  padding: 16px;
}

.user-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-name-block {
  display: flex;
  align-items: center;
}

.name {
  font-weight: 600;
}

.separateur {
  opacity: 0.5;
}

.email {
  opacity: 0.6;
}

.roles {
  margin-top: 12px;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.role {
  background: #1f73e7;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
}

/* Styles Responsives (Tablettes et Mobiles) */
@media (max-width: 768px) {
  .user-header {
    flex-direction: column;
    align-items: center;
    gap: 14px;
    text-align: center;
  }

  .user-info {
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .separateur {
    display: none; /* Masqué sur mobile pour un rendu vertical plus propre */
  }

  .email {
    display: block;
    margin-bottom: 4px;
  }

  /* Force l'espace des boutons Naive UI à occuper la largeur */
  .user-header :deep(.action-buttons) {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px !important;
  }

  /* Redimensionne les boutons et le déclencheur popconfirm sur toute la largeur */
  .user-header :deep(.n-button),
  .user-header :deep(.n-popconfirm-trigger) {
    width: 100% !important;
  }

  .roles {
    justify-content: center;
  }
}
</style>