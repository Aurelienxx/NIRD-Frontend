import apiClient from './apiClient';

// 1. Interface alignée sur ton format JSON réel
export interface Page {
  id: number;
  title: string;
  slug: string;
  description: string;
  layout: string;      // Le contenu HTML de la page
  location: string;    // ex: "HEADER"
  order: number;
  type: string;        // ex: "SIMPLE"
  published: boolean;
  createdAt: string;
  updatedAt: string;
  image?: string;      // Optionnel
}

export const pageService = {
  // Récupérer toutes les pages
  async getAllPages(): Promise<Page[]> {
    const response = await apiClient.get('/pages');
    return response.data;
  },

  // Récupérer une page par slug (Utilisé pour l'affichage public)
  async getPageBySlug(slug: string): Promise<Page | null> {
    const response = await apiClient.get(`/pages/slug/${slug}`);
    if (Array.isArray(response.data)) {
      return response.data.length > 0 ? response.data[0] : null;
    }
    return response.data;
  },

  // Récupérer tous les slugs de pages
  async getPageSlugs(roleIds: number[] = []): Promise<Page[]> {
    if (roleIds.length > 0) {
      // Si des rôles sont fournis, utiliser POST
      const response = await apiClient.post('/pages/slugs', { roleIds });
      return response.data;
    } else {
      // Sinon, utiliser GET
      const response = await apiClient.get('/pages/slugs');
      return response.data;
    }
  },

  // Récupérer une page par ID (Utilisé pour l'édition Admin)
  async getPageById(id: number): Promise<Page> {
    const response = await apiClient.get(`/pages/${id}`);
    return response.data;
  },

  // Créer une nouvelle page
  async createPage(pageData: Partial<Page>): Promise<Page> {
    const response = await apiClient.post('/pages', pageData);
    return response.data;
  },

  // Mettre à jour une page
  async updatePage(id: number, pageData: Partial<Page>): Promise<Page> {
    const response = await apiClient.put(`/pages/${id}`, pageData);
    return response.data;
  },

  // Supprimer une page
  async deletePage(id: number): Promise<void> {
    await apiClient.delete(`/pages/${id}`);
  }
};