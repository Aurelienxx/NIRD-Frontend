<template>
  <div class="navgroup-manager">
    <n-space justify="space-between" align="center" style="margin-bottom: 24px">
      <div style="font-size: 16px; font-weight: 600"> Groupes de Navigation</div>
      <n-button type="primary" @click="showForm = true">+ Nouveau Groupe</n-button>
    </n-space>

    <!-- Modal Formulaire d'ajout/édition -->
    <n-modal
      v-model:show="showForm"
      :title="`${editingGroup ? 'Modifier' : 'Créer'} un Groupe`"
      preset="dialog"
      positive-text="Confirmer"
      negative-text="Annuler"
      @positive-click="submitForm"
      @negative-click="cancelForm"
    >
      <n-form ref="formRef" :model="formData">
        <n-form-item label="Nom du Groupe" path="name">
          <n-input 
            v-model:value="formData.name" 
            placeholder="Ex: Services, Ressources, À propos"
            clearable
          />
        </n-form-item>
        <n-form-item label="Ordre d'affichage" path="order">
          <n-input-number 
            v-model:value="formData.order" 
            placeholder="0"
            :min="0"
          />
        </n-form-item>
      </n-form>
    </n-modal>

    <!-- Liste des groupes -->
    <div v-if="navgroups.length === 0">
      <n-empty description="Aucun groupe créé" />
    </div>

    <n-space vertical :size="12" v-else>
      <n-card v-for="group in navgroups" :key="group.id" :segmented="true">
        <template #header>
          <div style="font-weight: 600">{{ group.name }}</div>
        </template>
        <template #header-extra>
          <n-space>
            <n-button type="warning" quaternary @click="editGroup(group)">
              ✏️ Éditer
            </n-button>
            <n-popconfirm @positive-click="deleteGroup(group.id)">
              <template #trigger>
                <n-button type="error" quaternary>🗑️ Supprimer</n-button>
              </template>
              Êtes-vous sûr de vouloir supprimer ce groupe? Les pages seront dissociées.
            </n-popconfirm>
          </n-space>
        </template>
        <n-space>
          <span style="color: #999">📄 {{ group.pages?.length || 0 }} page(s) associée(s)</span>
        </n-space>
      </n-card>
    </n-space>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useMessage } from 'naive-ui';
import { 
  NButton, NModal, NForm, NFormItem, NInput, NInputNumber, NEmpty, NSpace, NCard, NPopconfirm 
} from 'naive-ui';
import { navGroupService } from '../../services/cmsService';

interface NavGroup {
  id: number;
  name: string;
  order: number;
  pages?: any[];
}

const message = useMessage();
const navgroups = ref<NavGroup[]>([]);
const showForm = ref(false);
const editingGroup = ref<NavGroup | null>(null);
const formData = ref({ name: '', order: 0 });

const loadNavGroups = async () => {
  try {
    const { data } = await navGroupService.getAllNavGroups();
    navgroups.value = data.sort((a: NavGroup, b: NavGroup) => a.order - b.order);
  } catch (error) {
    message.error('Erreur lors du chargement des groupes');
  }
};

const editGroup = (group: NavGroup) => {
  editingGroup.value = group;
  formData.value = { name: group.name, order: group.order };
  showForm.value = true;
};

const submitForm = async () => {
  try {
    if (editingGroup.value) {
      await navGroupService.updateNavGroup(editingGroup.value.id, formData.value);
      message.success('Groupe mis à jour avec succès');
    } else {
      await navGroupService.createNavGroup(formData.value);
      message.success('Groupe créé avec succès');
    }
    cancelForm();
    loadNavGroups();
  } catch (error) {
    message.error('Erreur lors de la sauvegarde');
  }
};

const deleteGroup = async (id: number) => {
  try {
    await navGroupService.deleteNavGroup(id);
    message.success('Groupe supprimé avec succès');
    loadNavGroups();
  } catch (error) {
    message.error('Erreur lors de la suppression');
  }
};

const cancelForm = () => {
  showForm.value = false;
  editingGroup.value = null;
  formData.value = { name: '', order: 0 };
};

onMounted(() => {
  loadNavGroups();
});
</script>


<style scoped>

.navgroup-card {
  background: var(--background-2);
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s;
}

.navgroup-card:hover {
  background: var(--background-1);
  box-shadow: var(--shadow-md);
}

.group-info h4 {
  margin: 0 0 5px 0;
  font-size: 16px;
  color: var(--text-white);
}

.group-info .group-pages {
  margin: 0;
  font-size: 12px;
  color: var(--text-light);
}

.group-actions {
  display: flex;
  gap: 8px;
}

.navgroups-list {
  display: grid;
  gap: 15px;
}

.form-content {
  background: var(--background-2);
  color: var(--text-white);
}

.form-content h3 {
  color: var(--text-white);
}

.form-group input {
  background: var(--background-1);
  color: var(--text-white);
  border-color: var(--background-3);
}

.navgroup-manager {
  width: 100%;
}
</style>
