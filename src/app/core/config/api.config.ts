export const API_BASE_URL = 'http://localhost:8080/api';

export const API_ENDPOINTS = {
  auth: {
    register: `${API_BASE_URL}/auth/register`,
    login: `${API_BASE_URL}/auth/login`,
    logout: `${API_BASE_URL}/auth/logout`,
    forgotPassword: `${API_BASE_URL}/auth/forgot-password`,
    resetPassword: `${API_BASE_URL}/auth/reset-password`,
  },
  notes: {
    base: `${API_BASE_URL}/notes`,
    byId: (id: number | string) => `${API_BASE_URL}/notes/${id}`,
    trash: `${API_BASE_URL}/notes/trash`,
    permanent: (id: number | string) => `${API_BASE_URL}/notes/${id}/permanent`,
    pin: (id: number | string) => `${API_BASE_URL}/notes/${id}/pin`,
    unpin: (id: number | string) => `${API_BASE_URL}/notes/${id}/unpin`,
    archive: (id: number | string) => `${API_BASE_URL}/notes/${id}/archive`,
    unarchive: (id: number | string) => `${API_BASE_URL}/notes/${id}/unarchive`,
    restore: (id: number | string) => `${API_BASE_URL}/notes/${id}/restore`,
    search: `${API_BASE_URL}/notes/search`,
    pinned: `${API_BASE_URL}/notes/filter/pinned`,
    archived: `${API_BASE_URL}/notes/filter/archived`,
    trashed: `${API_BASE_URL}/notes/filter/trashed`,
    reminder: `${API_BASE_URL}/notes/filter/reminder`,
    date: `${API_BASE_URL}/notes/filter/date`,
    color: `${API_BASE_URL}/notes/filter/color`,
    page: `${API_BASE_URL}/notes/page`,
    byLabel: `${API_BASE_URL}/notes/filter/label`,
    addLabel: (id: number | string) => `${API_BASE_URL}/notes/${id}/labels`,
    removeLabel: (id: number | string, labelId: number | string) =>
      `${API_BASE_URL}/notes/${id}/labels/${labelId}`,
  },
  labels: {
    base: `${API_BASE_URL}/labels`,
    byId: (id: number | string) => `${API_BASE_URL}/labels/${id}`,
  },
  reminders: {
    base: `${API_BASE_URL}/reminders`,
    byId: (id: number | string) => `${API_BASE_URL}/reminders/${id}`,
    forNote: (noteId: number | string) => `${API_BASE_URL}/notes/${noteId}/reminder`,
  },
  attachments: {
    forNote: (noteId: number | string) => `${API_BASE_URL}/notes/${noteId}/attachments`,
    byId: (id: number | string) => `${API_BASE_URL}/attachments/${id}`,
  },
} as const;
