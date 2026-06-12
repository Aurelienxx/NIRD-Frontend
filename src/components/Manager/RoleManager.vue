<template>
  <div class="role-manager">
    <n-space justify="space-between" align="center" style="margin-bottom: 24px">
      <div style="font-size: 16px; font-weight: 600"> Liste des Rôles</div>
      <n-button type="primary" @click="showForm = true">+ Nouveau Rôle</n-button>
    </n-space>

    <!-- Modal Formulaire d'ajout/édition -->
    <n-modal
      v-model:show="showForm"
      :title="`${editingRole ? 'Modifier' : 'Créer'} un Rôle`"
      preset="dialog"
      positive-text="Confirmer"
      negative-text="Annuler"
      @positive-click="submitForm"
      @negative-click="cancelForm"
    >
      <n-form ref="formRef" :model="formData">
        <n-form-item label="Nom du Rôle" path="name">
          <n-input 
            v-model:value="formData.name" 
            placeholder="Ex: Administrateur, Modérateur, Auteur"
            clearable
          />
        </n-form-item>
      </n-form>
    </n-modal>

    <!-- Liste des rôles -->
    <div v-if="roles.length === 0">
      <n-empty description="Aucun rôle créé" />
    </div>

    <div v-else class="roles-grid">
      <n-card v-for="role in roles" :key="role.id" class="role-card" :segmented="true">

  <div class="role-title">
    {{ role.name }}
  </div>

  <div class="role-actions">
    <n-button
      type="warning"
      quaternary
      @click="editRole(role)"
    >
      ✏️ Éditer
    </n-button>

    <n-popconfirm @positive-click="deleteRole(role.id)">
      <template #trigger>
        <n-button type="error" quaternary>
          🗑️ Supprimer
        </n-button>
      </template>
      Confirmer la suppression
    </n-popconfirm>
  </div>

</n-card>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useMessage } from 'naive-ui';
import { 
  NButton, NModal, NForm, NFormItem, NInput, NEmpty, NSpace, NCard, NPopconfirm 
} from 'naive-ui';
import { roleService } from '../../services/cmsService';

interface Role {
  id: number;
  name: string;
}

const message = useMessage();
const roles = ref<Role[]>([]);
const showForm = ref(false);
const editingRole = ref<Role | null>(null);
const formData = ref({ name: '' });

const loadRoles = async () => {
  try {
    const { data } = await roleService.getAllRoles();
    roles.value = data;
  } catch (error) {
    message.error('Erreur lors du chargement des rôles');
  }
};

const editRole = (role: Role) => {
  editingRole.value = role;
  formData.value = { name: role.name };
  showForm.value = true;
};

const submitForm = async () => {
  try {
    if (editingRole.value) {
      await roleService.updateRole(editingRole.value.id, formData.value);
      message.success('Rôle mis à jour avec succès');
    } else {
      await roleService.createRole(formData.value);
      message.success('Rôle créé avec succès');
    }
    cancelForm();
    loadRoles();
  } catch (error) {
    message.error('Erreur lors de la sauvegarde');
  }
};

const deleteRole = async (id: number) => {
  try {
    await roleService.deleteRole(id);
    message.success('Rôle supprimé avec succès');
    loadRoles();
  } catch (error) {
    message.error('Erreur lors de la suppression');
  }
};

const cancelForm = () => {
  showForm.value = false;
  editingRole.value = null;
  formData.value = { name: '' };
};

onMounted(() => {
  loadRoles();
});
</script>


<style scoped>
.role-manager {
  width: 100%;
}

.roles-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.role-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 140px;
}

.role-title {
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  border-bottom: 1px solid var(--background-3);
}

.role-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 32px;
}

/* =========================
   Responsive
========================= */

@media (max-width: 1200px) {
  .roles-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .roles-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .role-card {
    height: auto;
    min-height: 140px;
  }
}

@media (max-width: 768px) {
  .roles-grid {
    grid-template-columns: 1fr;
  }

  .role-actions {
    align-items: stretch;
    gap: 8px;
    margin-top: 20px;
  }

  .role-title {
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  .role-manager {
    overflow-x: hidden;
  }

  .role-title {
    font-size: 14px;
    word-break: break-word;
  }

  .role-card {
    min-height: 120px;
  }
}
</style>
