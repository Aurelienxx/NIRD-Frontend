import apiClient from './apiClient';

export interface Role {
  id: number;
  name: string;
  description?: string;
}

export const roleService = {
  // Récupérer tous les rôles
  async getAll(): Promise<Role[]> {
    try {
      const response = await apiClient.get('/roles');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des rôles:', error);
      throw error;
    }
  },

  // Récupérer un rôle par ID
  async getById(id: number): Promise<Role> {
    try {
      const response = await apiClient.get(`/roles/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du rôle ${id}:`, error);
      throw error;
    }
  },

  // Créer un nouveau rôle (admin only)
  async create(data: Partial<Role>): Promise<Role> {
    try {
      const response = await apiClient.post('/roles', data);
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la création du rôle:', error);
      throw error;
    }
  },

  // Mettre à jour un rôle (admin only)
  async update(id: number, data: Partial<Role>): Promise<Role> {
    try {
      const response = await apiClient.put(`/roles/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du rôle ${id}:`, error);
      throw error;
    }
  },

  // Supprimer un rôle (admin only)
  async delete(id: number): Promise<void> {
    try {
      await apiClient.delete(`/roles/${id}`);
    } catch (error) {
      console.error(`Erreur lors de la suppression du rôle ${id}:`, error);
      throw error;
    }
  }
};
