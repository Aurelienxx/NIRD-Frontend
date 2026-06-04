<template>
  <div class="usergroup-manager">
    <div style="font-size: 16px; font-weight: 600"> Liste des utilisateurs </div>

    <n-card v-for="user in users" :key="user.id" class="user-card" :bordered="false" :segmented="false">

    <div class="user-header">
        <div class="user-info">
        <div>{{ user.name }} </div> 
        <div class="separateur"> -  </div>
        <div class="email"> {{ user.email }} </div>
        </div>

        <n-button @click="openEdit(user)">
        Modifier rôles
        </n-button>
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
import { ref, onMounted } from 'vue'
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

const roleOptions = ref<{ label: string; value: number }[]>([])

const loadUsers = async () => {
  const data = await userService.getAll()

  users.value = data.map((u: any) => ({
    id: u.id,
    name: u.name || '',
    email: u.email || '',
    roles: u.roles || []
  }))
}

const loadRoles = async () => {
  roles.value = await roleService.getAll()

  roleOptions.value = roles.value.map(r => ({
    label: r.name,
    value: r.id
  }))
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

  await userService.update(selectedUser.value.id, {
    roles: selectedRoles.value.map(id => ({ id }))
  })


  message.success('Rôles mis à jour')

  showModal.value = false
  selectedUser.value = null
  selectedRoles.value = []

  await loadUsers()
}

onMounted(() => {
  loadUsers()
  loadRoles()
})
</script>

<style scoped>
.user-card {
  background: var(--background-1);
  border: 1px solid #ffffff;
  border-radius: 8px;
  margin-bottom: 12px;
  padding: 16px;
}


.usergroup-manager {
  display: flex;
  flex-direction: column;
}

.user-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.email {
  opacity: 0.6;
}

.roles {
  margin-top: 10px;
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

.n-button {
  background: var(--background-2);
  border: none;
  color: var(--text-white);
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}
</style>