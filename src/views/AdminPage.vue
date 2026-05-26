<template>
  <div class="admin-dashboard">
    <div class="nav-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab"
        :class="['tab-btn', { active: activeTab === tab }]"
        @click="activeTab = tab"
      >
        {{ tabLabels[tab] }}
      </button>
    </div>

    <!-- Onglet Rôles -->
    <div v-if="activeTab === 'roles'" class="tab-content">
      <RoleManager />
    </div>

    <!-- Onglet Groupes de Navigation -->
    <div v-if="activeTab === 'navgroups'" class="tab-content">
      <NavGroupManager />
    </div>

    <!-- Onglet Pages -->
    <div v-if="activeTab === 'pages'" class="tab-content">
      <PageManager />
    </div>

    <!-- Onglet Articles -->
    <div v-if="activeTab === 'articles'" class="tab-content">
      <ArticleManager />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import RoleManager from '../components/Manager/RoleManager.vue';
import NavGroupManager from '../components/Manager/NavGroupManager.vue';
import PageManager from '../components/Manager/PageManager.vue';
import ArticleManager from '../components/Manager/ArticleManager.vue';

const activeTab = ref<string>('roles');
const tabs = ['roles', 'navgroups', 'pages', 'articles'];
const tabLabels: Record<string, string> = {
  roles: '🔐 Rôles',
  navgroups: '📑 Groupes Navigation',
  pages: '📄 Pages',
  articles: '📰 Articles'
};
</script>

<style scoped>
.admin-dashboard {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.nav-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  border-bottom: 2px solid #e0e0e0;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 12px 20px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  color: var(--text-light);
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
}

.tab-btn:hover {
  color: var(--text-white);
}

.tab-btn.active {
  color: #007bff;
  border-bottom-color: #007bff;
}

.tab-content {
  animation: fadeIn 0.3s;
}

@media (max-width: 1200px) {
  .admin-dashboard {
    padding: 1.5rem;
  }
}

@media (max-width: 768px) {
  .admin-dashboard {
    min-height: auto;
  }

  .nav-tabs {
    gap: 8px;
    margin-bottom: 20px;
  }

  .tab-btn {
    padding: 10px 15px;
    font-size: 14px;
  }
}
</style>
