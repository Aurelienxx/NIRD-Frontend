import apiClient from './apiClient';

export interface Place {
  id: number;
  name: string;
  description?: string;
  address: string;
  type: string;
  latitude: number;
  longitude: number;
}

export interface User {
  id: number;
  email: string;
  name?: string;
  roles?: Array<{ id: number; name: string }>;
  placeId?: number;
  place?: Place;
  createdAt?: string;
}

export interface EditUserData {
  id: number;
  email: string;
  name: string;
  roles: Array<{ id: number;}>;
  placeId?: number;
  place?: Place;
  createdAt?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  name?: string;
  roleId?: number;
  placeId?: number;
}

export const userService = {
  // Récupérer tous les utilisateurs
  async getAll(): Promise<User[]> {
    try {
      const response = await apiClient.get('/users');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      throw error;
    }
  },

  // Récupérer un utilisateur par ID
  async getById(id: number): Promise<User> {
    try {
      const response = await apiClient.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'utilisateur ${id}:`, error);
      throw error;
    }
  },

  // Créer un nouvel utilisateur
  async create(data: SignupData): Promise<User> {
    try {
      const response = await apiClient.post('/users', data);
      console.log('Utilisateur créé avec succès:', response.data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error(error.response.data.error || 'Email déjà utilisé');
      }
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      throw error;
    }
  },

  // Mettre à jour un utilisateur
  async update(id: number, data: Partial<EditUserData>): Promise<EditUserData> {
    try {
      const response = await apiClient.put(`/users/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'utilisateur ${id}:`, error);
      throw error;
    }
  },

  // Supprimer un utilisateur
  async delete(id: number): Promise<void> {
    try {
      await apiClient.delete(`/users/${id}`);
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'utilisateur ${id}:`, error);
      throw error;
    }
  },

  // Connexion (à implémenter si vous avez une route de connexion)
  async login(data: LoginData): Promise<{ user: User; token: string }> {
    try {
      const response = await apiClient.post('/auth/login', data);
      // Stocker le token
      localStorage.setItem('authToken', response.data.token);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    }
  },

  // Déconnexion
  logout(): void {
    localStorage.removeItem('authToken');
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }
};
