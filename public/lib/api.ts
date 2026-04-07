import axios, { type AxiosError } from 'axios'

axios.defaults.baseURL = '/api/v1'
axios.defaults.withCredentials = true
axios.defaults.headers.common['Accept'] = 'application/json'

export const API_UNAUTHORIZED_EVENT = 'api-unauthorized'

axios.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent(API_UNAUTHORIZED_EVENT))
    }
    return Promise.reject(error)
  },
)

export function getApiErrorMessage(error: unknown, fallbackMessage = 'Có lỗi xảy ra.') {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as any
    if (data?.message) {
      return String(data.message)
    }
    if (data?.errors && typeof data.errors === 'object') {
      const firstError = Object.values(data.errors)[0]
      if (typeof firstError === 'string') {
        return firstError
      }
    }
    if (error.message) {
      return error.message
    }
  } else if (error instanceof Error) {
    return error.message
  }

  return fallbackMessage
}

export type UserRole = 'Admin' | 'Organizer' | 'Volunteer' | string
export type AuthUser = {
  id?: string
  userId?: string
  email?: string
  fullName?: string
  role?: UserRole
  phone?: string
}
export type CommentItem = {
  id?: string
  userId?: string
  userName?: string
  content?: string
  createdAt?: string
}
export type RatingItem = {
  id?: string
  userId?: string
  userName?: string
  rating?: number
  review?: string
  createdAt?: string
}
export type EventItem = any
export type OrganizationItem = any
export type AdminCategoryItem = any
export type AdminEventApprovalItem = any
export type AdminModerationReport = any
export type AdminUserItem = any
export type AdminDashboardMetrics = any
export type AdminEventReport = any
export type AdminDonationItem = any
export type AdminRegistrationItem = any
export type OrganizerEventItem = any
export type FavoriteItem = any
export type RegistrationItem = any
export type VolunteerProfile = any
export type DonationStatus = string
export type OrganizerRegistrationItem = any
export type OrganizerRegistrationDetail = any
export type VolunteerEvaluationItem = any
export type OrganizerVolunteerHistoryItem = any

export const authService = {
  me: () => axios.get('/profile'),
  login: (payload: { email: string; password: string }) => axios.post('/login', payload),
  register: (payload: { email: string; password: string; fullName: string; phone?: string; role?: UserRole }) =>
    axios.post('/register', payload),
  updateProfile: (payload: { fullName: string; phone?: string | null }) => axios.put('/profile', payload),
  logout: () => axios.post('/logout'),
}

export const contactService = {
  send: (payload: { name: string; email: string; subject: string; message: string }) =>
    axios.post('/contact', payload),
}

export type IdValue = string | number

export const eventService = {
  getAll: (params?: Record<string, unknown>) => axios.get('/events', { params }),
  getById: (eventId: string | number) => axios.get(`/events/${eventId}`),
  getCategories: () => axios.get('/categories'),
  register: (
    eventId: string | number,
    payload: { userId: IdValue; fullName: string; phone: string; reason?: string },
  ) => axios.post(`/events/${eventId}/register`, payload),
  toggleFavorite: (eventId: string | number, _userId?: IdValue) => axios.post(`/events/${eventId}/favorite`),
  getComments: (eventId: string | number) => axios.get(`/events/${eventId}/comments`),
  createComment: (eventId: string | number, content: string) =>
    axios.post(`/events/${eventId}/comments`, { content }),
  getRatings: (eventId: string | number) => axios.get(`/events/${eventId}/ratings`),
  createRating: (eventId: string | number, payload: { rating: number; review?: string }) =>
    axios.post(`/events/${eventId}/ratings`, payload),
}

export const organizationService = {
  getAll: (params?: Record<string, unknown>) => axios.get('/organizations', { params }),
  getById: (organizationId: string) => axios.get(`/organizations/${organizationId}`),
  register: (payload: Record<string, unknown>) => axios.post('/organizations/register', payload),
}

export const volunteerService = {
  getDashboard: (userId: IdValue) => axios.get(`/volunteers/${userId}/dashboard`),
  getDonations: (userId: IdValue) => axios.get(`/volunteers/${userId}/donations`),
  getFavorites: (userId: IdValue) => axios.get(`/volunteers/${userId}/favorites`),
  removeFavorite: (userId: IdValue, eventId: IdValue) =>
    axios.delete(`/volunteers/${userId}/favorites/${eventId}`),
  getRegistrations: (userId: IdValue) => axios.get(`/volunteers/${userId}/registrations`),
  cancelRegistration: (userId: IdValue, registrationId: IdValue) =>
    axios.delete(`/volunteers/${userId}/registrations/${registrationId}`),
  getProfile: (userId: IdValue) => axios.get(`/volunteers/${userId}/profile`),
  updateProfile: (userId: IdValue, payload: { fullName: string; phone?: string | null }) =>
    axios.put(`/volunteers/${userId}/profile`, payload),
  uploadAvatar: (userId: IdValue, avatarData: string) =>
    axios.post(`/volunteers/${userId}/avatar`, { avatarData }),
}

export const adminService = {
  getDashboard: () => axios.get('/admin/dashboard'),
  getEventApprovals: (params?: Record<string, unknown>) => axios.get('/admin/events/approvals', { params }),
  updateEventStatus: (id: string | number, action: string | number) =>
    axios.patch(`/admin/events/${id}/status`, { action }),
  getUsers: (params?: Record<string, unknown>) => axios.get('/admin/users', { params }),
  updateUserStatus: (id: string, isActive: boolean) => axios.patch(`/admin/users/${id}/status`, { isActive }),
  updateUserRole: (id: string, role: UserRole) => axios.patch(`/admin/users/${id}/role`, { role }),
  getCategories: (params?: Record<string, unknown>) => axios.get('/admin/categories', { params }),
  createCategory: (name: string) => axios.post('/admin/categories', { name }),
  updateCategory: (id: string, name: string) => axios.patch(`/admin/categories/${id}`, { name }),
  deleteCategory: (id: string) => axios.delete(`/admin/categories/${id}`),
  getModeration: () => axios.get('/admin/moderation'),
  getEventReports: () => axios.get('/admin/event-reports'),
  approveReport: (id: string) => axios.patch(`/admin/event-reports/${id}/approve`),
  rejectReport: (id: string) => axios.patch(`/admin/event-reports/${id}/reject`),
  getDonations: (params?: Record<string, unknown>) => axios.get('/admin/donations', { params }),
  updateDonationStatus: (id: string, status: DonationStatus) => axios.patch(`/admin/donations/${id}/status`, { status }),
  getRegistrations: (params?: Record<string, unknown>) => axios.get('/admin/registrations', { params }),
  updateRegistrationStatus: (id: string, status: string) => axios.patch(`/admin/registrations/${id}/status`, { status }),
}

export const organizerService = {
  getDashboard: () => axios.get('/organizer/dashboard'),
  getOrganization: () => axios.get('/organizer/profile'),
  updateOrganization: (payload: Record<string, unknown>) => axios.put('/organizer/profile', payload),
  claimOrganization: (organizationId: string) => axios.post('/organizer/claim', { organizationId }),
  getEvents: (params?: Record<string, unknown>) => axios.get('/organizer/events', { params }),
  getEventById: (id: string | number) => axios.get(`/organizer/events/${id}`),
  createEvent: (payload: Record<string, unknown>) => axios.post('/organizer/events', payload),
  updateEvent: (id: string | number, payload: Record<string, unknown>) =>
    axios.put(`/organizer/events/${id}`, payload),
  hideEvent: (id: string | number) => axios.patch(`/organizer/events/${id}/hide`),
  unhideEvent: (id: string | number) => axios.patch(`/organizer/events/${id}/unhide`),
  getVolunteers: (params?: Record<string, unknown>) => axios.get('/organizer/volunteers', { params }),
  getRegistrationById: (id: string | number) => axios.get(`/organizer/registrations/${id}`),
  updateRegistrationStatus: (id: string | number, action: string | number) =>
    axios.patch(`/organizer/registrations/${id}/status`, { action }),
  getRegistrationEvaluation: (id: string | number) => axios.get(`/organizer/registrations/${id}/evaluation`),
  saveRegistrationEvaluation: (id: string | number, payload: { rating: number; comment?: string }) =>
    axios.post(`/organizer/registrations/${id}/evaluation`, payload),
  getVolunteerHistory: (id: string | number) => axios.get(`/organizer/volunteers/${id}/history`),
}

export const moderationService = {
  reportEvent: (eventId: string | number, payload: { reason: string; details?: string }) => {
    return axios.post(`/events/${eventId}/reports`, payload).catch((error) => {
      const message = getApiErrorMessage(error, 'Không thể báo cáo sự kiện');
      throw new Error(message);
    });
  }
};

export const paymentService = {
  createMomo: (payload: Record<string, unknown>) => axios.post('/payments/momo/create', payload),
  getByTransaction: (transactionCode: string) => axios.get(`/payments/${transactionCode}`),
}

