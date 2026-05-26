import apiClient from './apiClient';

export const pageService = {
  getAllPages: () => apiClient.get('/pages'),
  getPage: (id: number) => apiClient.get(`/pages/${id}`),
  getPageBySlug: (slug: string) => apiClient.get(`/pages/slug/${slug}`),
  createPage: (data: any) => apiClient.post('/pages', data),
  updatePage: (id: number, data: any) => apiClient.put(`/pages/${id}`, data),
  deletePage: (id: number) => apiClient.delete(`/pages/${id}`),
};

export const navGroupService = {
  getAllNavGroups: () => apiClient.get('/navgroups'),
  getNavGroup: (id: number) => apiClient.get(`/navgroups/${id}`),
  createNavGroup: (data: any) => apiClient.post('/navgroups', data),
  updateNavGroup: (id: number, data: any) => apiClient.put(`/navgroups/${id}`, data),
  deleteNavGroup: (id: number) => apiClient.delete(`/navgroups/${id}`),
};

export const roleService = {
  getAllRoles: () => apiClient.get('/roles'),
  createRole: (data: any) => apiClient.post('/roles', data),
  updateRole: (id: number, data: any) => apiClient.put(`/roles/${id}`, data),
  deleteRole: (id: number) => apiClient.delete(`/roles/${id}`),
};
