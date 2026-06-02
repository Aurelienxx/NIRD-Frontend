<template>
  <div class="page-manager">
    <n-space justify="space-between" align="center" style="margin-bottom: 24px">
      <div style="font-size: 16px; font-weight: 600"> Liste des pages</div>
      <n-button type="primary" @click="createNewPage">+ Nouvelle Page</n-button>
    </n-space>
    <div class="page-layout">


      <!-- LISTE GAUCHE -->
      <div class="sidebar">
        <div class="sidebar-title">Pages</div>

        <div class="page-list">
          <div
            v-for="page in pages"
            :key="page.id"
            class="page-item"
            :class="{ active: editingPage?.id === page.id }"
            @click="editPage(page)"
          >
            <div class="title">{{ page.title }}</div>
            <div class="meta">{{ page.slug }}</div>
            <div class="meta">{{ page.location }}</div>
          </div>
        </div>
      </div>

      <!-- EDITEUR -->
      <div class="editor">

        <n-card v-if="editingPage">

          <n-form :model="editingPage">

            <!-- TITRE + SLUG -->
            <n-space :size="12">
              <div style="flex: 1">
                <h2>Titre</h2>
                <n-input v-model:value="editingPage.title" />
              </div>

              <div style="flex: 1">
                <h2>Slug</h2>
                <n-input v-model:value="editingPage.slug" />
              </div>
            </n-space>

            <!-- TYPE + POSITION + NAV GROUP -->
            <n-space :size="12" style="margin-top: 16px">

              <div style="flex: 1">
                <h2>Position</h2>
                <n-select
                  v-model:value="editingPage.location"
                  :options="[
                    { label: 'Header', value: 'HEADER' },
                    { label: 'Menu', value: 'BURGER' },
                    { label: 'Masqué', value: 'HIDDEN' }
                  ]"
                />
              </div>

              <div style="flex: 1">
                <h2>Groupe nav</h2>
                <n-select
                  v-model:value="editingPage.navGroupId"
                  :options="navgroups.map(g => ({
                    label: g.name,
                    value: g.id
                  }))"
                  clearable
                />
              </div>

            </n-space>

            <!-- ROLES MULTI SELECT -->
            <div style="margin-top: 16px">
              <h2>Rôles autorisés</h2>

              <n-select
                v-model:value="editingPage.roleIds"
                :options="roles.map(r => ({
                  label: r.name,
                  value: r.id
                }))"
                multiple
                clearable
                placeholder="Accès public si vide"
              />
            </div>

            <!-- CONTENU -->
            <div style="margin-top: 20px">
              <h2>Contenu</h2>

              <RichTextEditor
                v-model="editingPage.layout"
                @save="savePage"
              />
            </div>

            <!-- ACTIONS -->
            <n-space style="margin-top: 20px">

              <n-button type="primary" @click="savePage">
                Sauvegarder
              </n-button>

              <n-button @click="cancelEdit">
                Annuler
              </n-button>

              <n-popconfirm
                v-if="editingPage.id"
                @positive-click="deletePage(editingPage.id)"
              >
                <template #trigger>
                  <n-button type="error">
                    Supprimer
                  </n-button>
                </template>

                Supprimer cette page

              </n-popconfirm>

            </n-space>

          </n-form>

        </n-card>

        <n-card v-else>
          <n-empty description="Sélectionne une page" />
        </n-card>

      </div>

    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useMessage } from 'naive-ui';
import { NButton, NCard, NForm, NInput, NSelect, NEmpty, NSpace, NPopconfirm } from 'naive-ui';
import { pageService, navGroupService, roleService } from '../../services/cmsService';
import RichTextEditor from '../Admin/RichTextEditor.vue';

interface Page {
  id?: number
  title: string
  slug: string
  location: string
  type: string
  navGroupId: number | null
  layout: string
  roleIds: number[]
}

interface Role {
  id: number
  name: string
}

interface NavGroup {
  id: number
  name: string
}

const message = useMessage()

const pages = ref<Page[]>([])
const roles = ref<Role[]>([])
const navgroups = ref<NavGroup[]>([])

const editingPage = ref<Page | null>(null)
const loading = ref(false)

/* LOAD */

const loadPages = async () => {
  try {
    loading.value = true
    const { data } = await pageService.getAllPages()
    pages.value = data
  } catch (error) {
    message.error('Erreur chargement pages')
  } finally {
    loading.value = false
  }
}

const loadRoles = async () => {
  try {
    const { data } = await roleService.getAllRoles()
    roles.value = data
  } catch (error) {
    message.error('Erreur chargement rôles')
  }
}

const loadNavGroups = async () => {
  try {
    const { data } = await navGroupService.getAllNavGroups()
    navgroups.value = data
  } catch (error) {
    message.error('Erreur chargement groupes nav')
  }
}

/* EDIT */

const editPage = (page: any) => {
  editingPage.value = {
    ...page,
    roleIds: page.allowedRoles
      ? page.allowedRoles.map((r: any) => r.id)
      : []
  }
}

const createNewPage = () => {
  editingPage.value = {
    title: '',
    slug: '',
    location: 'HIDDEN',
    type: 'SIMPLE',
    navGroupId: null,
    layout: '',
    roleIds: []
  }
}

const cancelEdit = () => {
  editingPage.value = null
}

/* SAVE */

const savePage = async () => {
  await savePageContent(editingPage.value?.layout)
}

const savePageContent = async (updatedContent?: string) => {
  if (!editingPage.value) return

  const finalContent =
    typeof updatedContent === 'string'
      ? updatedContent
      : editingPage.value.layout

  const payload = {
    title: editingPage.value.title,
    slug: editingPage.value.slug,
    location: editingPage.value.location,
    type: editingPage.value.type,
    navGroupId: editingPage.value.navGroupId,
    layout: finalContent,
    roleIds: editingPage.value.roleIds
  }

  if (editingPage.value.id) {
    await pageService.updatePage(editingPage.value.id, payload)
    message.success('Page mise à jour')
  } else {
    await pageService.createPage(payload)
    message.success('Page créée')
  }

  editingPage.value = null
  await loadPages()
}

/* DELETE */

const deletePage = async (id: number) => {
  try {
    await pageService.deletePage(id)
    message.success('Page supprimée')

    if (editingPage.value?.id === id) {
      editingPage.value = null
    }

    await loadPages()
  } catch (error) {
    message.error('Erreur suppression')
  }
}

/* INIT */

onMounted(() => {
  loadPages()
  loadRoles()
  loadNavGroups()
})
</script>


<style scoped>
.page-manager {
  width: 100%;
}

.page-layout {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 320px;
  border-right: 1px solid #e0e0e0;
  padding: 16px;
  overflow-y: auto;
}

.page-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.page-item {
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  background: var(--background-1);
}

.page-item.active {
  border: 1px solid #1f73e7;
}

.title {
  font-weight: 600;
}

.meta {
  font-size: 12px;
  opacity: 0.6;
}

.editor {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}
</style>
