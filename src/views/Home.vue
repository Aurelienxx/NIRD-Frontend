<template>
  <div class="container">
    <div class="page-body" v-html="page.layout"></div>
  </div>
  <CarteVue />
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import { pageService } from '../services/pageService';
import  CarteVue  from './../components/CarteComponent.vue';

const route = useRoute();
const page = ref<any>(null);

watchEffect(async () => {
  const slug = (route.params.slug as string) || 'accueil';
  try {
    const response = await pageService.getPageBySlug(slug);
    
    if (Array.isArray(response) && response.length > 0) {
      page.value = response[0];
    } else {
      page.value = response;
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de la page :", error);
    page.value = null;
  }
});

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};
</script>

<style scoped>
.page-body {
  line-height: 1.7;
  font-size: 1.1rem;
  color: #d1d1d1;
}

.page-body :deep(h1) {
  font-size: 2rem;
  margin-top: 2rem;
  color: var(--lk-1);
}

.page-body :deep(p) {
  margin-bottom: 1.5rem;
}

.page-body :deep(strong) {
  color: #ffffff;
  font-weight: bold;
}

</style>