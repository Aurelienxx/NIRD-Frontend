import apiClient from './apiClient';

export interface Article {
  id: number;
  title: string;
  description: string;
  content: string | Record<string, any>;
  mediaUrl?: string;
  mediaType: 'IMAGE' | 'VIDEO';
  authorId: number;
  author: {
    id: number;
    name: string;
    email: string;
  };
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}


export interface CreateArticleInput {
  title: string;
  description: string;
  content: string | Record<string, any>;
  mediaUrl?: string;
  mediaType: 'IMAGE' | 'VIDEO';
  publishedAt: string;
  authorId: number;
}

export const articleService = {
  // Récupérer tous les articles (triés du plus récent au plus ancien)
  async getAllArticles(): Promise<Article[]> {
    const response = await apiClient.get('/articles');
    return response.data;
  },

  // Récupérer les articles publiés (triés du plus récent au plus ancien)
  async getPublishedArticles(): Promise<Article[]> {
    const response = await apiClient.get('/articles/published');
    return response.data;
  },

  // Récupérer un article par ID
  async getArticleById(id: number): Promise<Article> {
    const response = await apiClient.get(`/articles/${id}`);
    return response.data;
  },

  // Récupérer les articles d'un auteur
  async getArticlesByAuthor(authorId: number): Promise<Article[]> {
    const response = await apiClient.get(`/articles/author/${authorId}`);
    return response.data;
  },

  // Rechercher des articles
  async searchArticles(query: string): Promise<Article[]> {
    const response = await apiClient.get('/articles/search', { params: { q: query } });
    return response.data;
  },

  // Créer un nouvel article
  async createArticle(article: CreateArticleInput): Promise<Article> {
    const response = await apiClient.post('/articles', article);
    return response.data;
  },

  // Mettre à jour un article
  async updateArticle(id: number, article: Partial<Article>): Promise<Article> {
    const response = await apiClient.put(`/articles/${id}`, article);
    return response.data;
  },

  // Supprimer un article
  async deleteArticle(id: number): Promise<void> {
    await apiClient.delete(`/articles/${id}`);
  }
};
