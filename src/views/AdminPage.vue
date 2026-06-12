<template>
  <n-card class="admin-dashboard">
    <template #header>
      <div>
        <h1>Tableau de bord Administrateur</h1>
      </div>
    </template>

    <n-tabs 
      v-model:value="activeTab" 
      type="card" 
      animated 
      :tab-style="{ minWidth: 'fit-content' }"
    >
      <n-tab-pane name="roles" tab="Rôles">
        <RoleManager />
      </n-tab-pane>

      <n-tab-pane name="navgroups" tab="Groupes Navigation">
        <NavGroupManager />
      </n-tab-pane>

      <n-tab-pane name="pages" tab="Pages">
        <PageManager />
      </n-tab-pane>

      <n-tab-pane name="articles" tab="Articles">
        <ArticleManager />
      </n-tab-pane>

      <n-tab-pane name="documents" tab="Documents">
        <DocumentManager />
      </n-tab-pane>

      <n-tab-pane name="users" tab="Utilisateurs">
        <UserManager />
      </n-tab-pane>
    </n-tabs>
  </n-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NTabs, NTabPane } from 'naive-ui';
import RoleManager from '../components/Manager/RoleManager.vue';
import NavGroupManager from '../components/Manager/NavGroupManager.vue';
import PageManager from '../components/Manager/PageManager.vue';
import ArticleManager from '../components/Manager/ArticleManager.vue';
import DocumentManager from '../components/Manager/DocumentManager.vue';
import UserManager from '../components/Manager/UserManager.vue';
const activeTab = ref<string>('roles');
</script>

<style scoped>
.admin-dashboard {
  max-width: 100%;
  padding: 20px;
  background-color: var(--background-2);
  border-color: var(--background-2);
}
@media (max-width: 1024px) {
  .admin-dashboard {
    padding: 15px;
  }
}

@media (max-width: 768px) {
  .admin-dashboard {
    padding: 10px;
    border-radius: 0;
  }

  :deep(.n-card-header) h1 {
    font-size: 1.4rem;
    text-align: center;
  }

  :deep(.n-tabs-nav-scroll-content) {
    display: flex;
    overflow-x: auto;
    scrollbar-width: thin;
  }

  :deep(.n-tabs-tab) {
    min-width: max-content !important;
    flex-shrink: 0;
  }
}

@media (max-width: 480px) {
  .admin-dashboard {
    padding: 8px;
  }

  :deep(.n-card-header) h1 {
    font-size: 1.2rem;
  }

  :deep(.n-tabs-tab) {
    padding: 8px 12px;
    font-size: 0.85rem;
  }
}

</style>
