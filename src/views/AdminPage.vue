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
      tab-style="min-width: 150px"
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

const activeTab = ref<string>('roles');
</script>

<style scoped>
.admin-dashboard {
  max-width: 100%;
  padding: 20px;
  background-color: var(--background-2);
  border-color: var(--background-2);
}


</style>
