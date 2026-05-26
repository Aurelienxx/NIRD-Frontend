<template>
  <header class="header">
    <div class="container header-content">
      <div class="logo">
        <router-link to="/" class="logo-link">
          <img src="/img/logo/logo.png" alt="NIRD Logo" class="logo-icon" />
        </router-link>
      </div>

      <nav class="nav">

        <router-link 
          v-for="page in standalonePages" 
          :key="page.id" 
          :to="'/' + page.slug" 
          class="nav-link"
          active-class="active"
        >
          {{ page.title }}
        </router-link>

        <div 
          v-for="(items, groupName) in groupedPages" 
          :key="groupName" 
          class="dropdown"
        >
          <button class="nav-link">
            {{ groupName }}
          </button>
          
          <div class="dropdown-menu">
            <router-link 
              v-for="page in items" 
              :key="page.id" 
              :to="'/' + page.slug" 
              class="dropdown-item"
              active-class="active-item"
            >
              {{ page.title }}
            </router-link>
          </div>
        </div>
        <router-link to="/actualites" class="nav-link" active-class="active">Actu</router-link>
        <router-link to="/recherche" class="nav-link" active-class="active">🔍​ Recherche</router-link>
      </nav>

      <div class="header-actions">
        <template v-if="authStore.isAuthenticated">
          <div class="profile-dropdown">
            <button 
              class="user-profile-btn" 
              @click="showProfileMenu = !showProfileMenu"
              :title="`Profil - ${authStore.user?.name || 'Utilisateur'}`"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </button>
            
            <div v-if="showProfileMenu" class="profile-menu">
              <router-link 
                to="/profile" 
                class="profile-menu-item"
                @click="showProfileMenu = false"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>Mon profil</span>
              </router-link>
              
              <router-link 
                to="/user/articles" 
                class="profile-menu-item"
                @click="showProfileMenu = false"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
                <span>Mon espace personnel</span>
              </router-link>
              
              <template v-if="isAdmin">
                <div class="profile-menu-divider"></div>
                <router-link 
                  to="/admin/dashboard" 
                  class="profile-menu-item profile-menu-item--admin"
                  @click="showProfileMenu = false"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="12 3 20 7 20 17 12 21 4 17 4 7 12 3"></polygon>
                    <line x1="12" y1="12" x2="20" y2="7"></line>
                    <line x1="12" y1="12" x2="12" y2="21"></line>
                    <line x1="12" y1="12" x2="4" y2="7"></line>
                  </svg>
                  <span>Dashboard Admin</span>
                </router-link>
              </template>
              
              <div class="profile-menu-divider"></div>
              <button 
                @click="logout"
                class="profile-menu-item profile-menu-item--logout"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </template>
        <template v-else>
          <router-link to="/auth" class="btn btn-outline">Rejoindre NIRD</router-link>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { pageService } from '../services/pageService';
import { useAuthStore } from '../services/authService';

const authStore = useAuthStore();

const pagesList = ref<any[]>([]);
const showProfileMenu = ref(false);

// Vérifier si l'utilisateur est admin
const isAdmin = computed(() => {
  if (!authStore.roles || authStore.roles.length === 0) {
    return false;
  }
  return authStore.roles.some((role: any) => 
    role.name.toLowerCase().includes('admin')
  );
});

const logout = () => {
  authStore.logout();
};

// Fermer le menu quand on clique en dehors
const handleClickOutside = (event: MouseEvent) => {
  const profileDropdown = (event.target as HTMLElement)?.closest('.profile-dropdown');
  if (!profileDropdown && showProfileMenu.value) {
    showProfileMenu.value = false;
  }
};

onMounted(async () => {
  try {
    // Récupérer les rôles de l'utilisateur s'il est connecté
    const roleIds = authStore.isAuthenticated && authStore.roles 
      ? authStore.roles.map((role: any) => role.id)
      : [];
    
    // Appeler l'API avec ou sans rôles
    const data = await pageService.getPageSlugs(roleIds);
    
    // On trie par 'order' dès la réception pour que tout soit aligné
    pagesList.value = data.sort((a: any, b: any) => a.order - b.order);
  } catch (error) {
    console.error("Erreur lors de la récupération des menus:", error);
  }

  // Ajouter l'écouteur pour fermer le menu
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// Pages SEULES (sans groupe)
const standalonePages = computed(() => {
  return pagesList.value.filter(page => !page.group);
});

// Pages GROUPÉES (pour les dropdowns)
const groupedPages = computed(() => {
  const groups: Record<string, any[]> = {};

  pagesList.value.forEach((page) => {
    if (page.group) {
      if (!groups[page.group]) {
        groups[page.group] = [];
      }
      groups[page.group].push(page);
    }
  });

  return groups;
});
</script>

<style scoped>
.header {
  background: var(--background-1);
  color: var(--text-white);
  padding: 1rem 0;
  box-shadow: var(--shadow-md);
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.logo {
  display: flex;
  align-items: center;
}

.logo-link {
  text-decoration: none;
  display: flex;
  align-items: center;
}

.nav {
  display: flex;
  gap: 1rem;
  flex: 1;
  justify-content: center;
}

.nav-link {
  color: var(--text-white);
  text-decoration: none;
  padding: 0.5rem 0.8rem;
  border-radius: 4px;
  transition: all 0.3s;
  font-weight: 500;
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.95rem;
  white-space: nowrap;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-link.active {
  background-color: rgba(255, 255, 255, 0.15);
  border-bottom: 2px solid var(--lk-2);
}

.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: var(--background-1);
  display: none;
  flex-direction: column;
  min-width: 180px;
  box-shadow: var(--shadow-lg);
  border-radius: 6px;
  padding: 0.5rem 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dropdown:hover .dropdown-menu {
  display: flex;
}

.dropdown-item {
  padding: 0.6rem 1.2rem;
  color: var(--text-white);
  text-decoration: none;
  font-size: 0.9rem;
  transition: background 0.2s;
  display: block;
}

.dropdown-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.dropdown-item.active-item {
  color: var(--lk-2);
  font-weight: bold;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.user-profile-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--lk-1);
  transition: color 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(96, 198, 255, 0.1);
}

.user-profile-btn:hover {
  color: var(--lk-2);
  background: rgba(96, 198, 255, 0.2);
}

.profile-dropdown {
  position: relative;
}

.profile-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--background-1);
  display: flex;
  flex-direction: column;
  min-width: 220px;
  box-shadow: var(--shadow-lg);
  border-radius: 6px;
  padding: 0.5rem 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 0.5rem;
  z-index: 1000;
}

.profile-menu-item {
  padding: 0.75rem 1.2rem;
  color: var(--text-white);
  text-decoration: none;
  font-size: 0.9rem;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border: none;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  width: 100%;
  text-align: left;
}

.profile-menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.profile-menu-item svg {
  flex-shrink: 0;
  opacity: 0.8;
}

.profile-menu-divider {
  height: 1px;
  background-color: rgba(255, 255, 255, 0.1);
  margin: 0.25rem 0;
}

.profile-menu-item--admin {
  color: var(--lk-2);
  font-weight: 500;
}

.profile-menu-item--admin:hover {
  background-color: rgba(96, 198, 255, 0.15);
}

.profile-menu-item--logout {
  color: #ff6b6b;
}

.profile-menu-item--logout:hover {
  background-color: rgba(255, 107, 107, 0.15);
}

@media (max-width: 768px) {
  .header-content {
    gap: 1rem;
  }

  .nav {
    gap: 0.5rem;
  }

  .nav-link {
    padding: 0.4rem 0.6rem;
    font-size: 0.85rem;
  }

  .logo-icon {
    width: 35px;
    height: 35px;
  }
}


.logo-icon {
  height: 2.5rem;
  display: block;
}

.btn-outline {
  padding: 0.6rem 1.2rem;
  border: 1px solid var(--lk-2);
  color: var(--text-white);
  border-radius: 6px;
  text-decoration: none;
  transition: all 0.3s;
  font-size: 0.9rem;
}

.btn-outline:hover {
  background: var(--lk-2);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-profile-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: var(--text-white);
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
}

.user-profile-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: var(--lk-2);
  transform: scale(1.05);
}

.user-profile-btn svg {
  width: 20px;
  height: 20px;
}

@media (max-width: 1024px) {
  .nav {
    gap: 0.5rem;
  }
  .nav-link {
    padding: 0.5rem;
    font-size: 0.85rem;
  }
}
</style>