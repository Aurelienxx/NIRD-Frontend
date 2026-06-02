import apiClient from './apiClient';

export interface Place {
  id: number
  name: string
  description?: string
  address: string
  type: string
  latitude: number
  longitude: number
  createdAt: string

  users: {
    id: number
    name: string
    email: string
    roles: {
      id: number
      name: string
    }[]
  }[]
}

export const placeService = {

  // Récupérer toutes les localités
  async getAllLocations(): Promise<Place[]> {
    const response = await apiClient.get('/places/locations')
    return response.data
  },

  // Récupérer tous les lieux
  async getAllPlaces(): Promise<Place[]> {
    const response = await apiClient.get('/places')
    return response.data
  },

  // Récupérer un lieu par ID
  async getPlaceById(id: number): Promise<Place> {
    const response = await apiClient.get(`/places/${id}`)
    return response.data
  },

  // Créer un lieu
  async createPlace(placeData: Partial<Place>): Promise<Place> {
    const response = await apiClient.post('/places', placeData)
    return response.data
  },

  // Modifier un lieu
  async updatePlace(id: number, placeData: Partial<Place>): Promise<Place> {
    const response = await apiClient.put(`/places/${id}`, placeData)
    return response.data
  },

  // Supprimer un lieu
  async deletePlace(id: number): Promise<void> {
    await apiClient.delete(`/places/${id}`)
  }

}