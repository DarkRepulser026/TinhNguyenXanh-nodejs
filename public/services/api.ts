import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';
export const API_UNAUTHORIZED_EVENT = 'volunteerhub:api-unauthorized';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

type ApiErrorShape = {
  message?: string;
  error?: string;
  errors?: Array<{ message?: string }>;
};

const normalizeApiErrorMessage = (error: unknown, fallback = 'Co loi xay ra.') => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorShape | undefined;

    if (Array.isArray(data?.errors)) {
      const firstMessage = data.errors.find((item) => item?.message)?.message;
      if (firstMessage) {
        return firstMessage;
      }
    }

    return data?.message || data?.error || error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

apiClient.interceptors.request.use((config) => {
  config.headers.set('X-Requested-With', 'XMLHttpRequest');
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (error instanceof AxiosError && error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      const isAuthEndpoint =
        requestUrl.includes('/auth/login') ||
        requestUrl.includes('/auth/register') ||
        requestUrl.includes('/auth/logout') ||
        requestUrl.includes('/auth/me');

      if (!isAuthEndpoint && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(API_UNAUTHORIZED_EVENT));
      }
    }

    return Promise.reject(new Error(normalizeApiErrorMessage(error)));
  },
);

type PaginatedResponse<T> = {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type EventItem = {
  id: number;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  location: string | null;
  organizationName: string | null;
  categoryName: string | null;
  registeredCount: number;
  maxVolunteers: number;
  images: string | null;
  status: string;
};

export type OrganizationItem = {
  id: string;
  name: string;
  description: string | null;
  city: string | null;
  district: string | null;
  ward?: string | null;
  address: string | null;
  contactEmail: string | null;
  phoneNumber: string | null;
  website: string | null;
  organizationType: string | null;
  taxCode?: string | null;
  foundedDate?: string | null;
  legalRepresentative?: string | null;
  documentType?: string | null;
  verificationDocsUrl?: string | null;
  facebookUrl?: string | null;
  zaloNumber?: string | null;
  achievements?: string | null;
  focusAreas?: string[];
  avatarUrl?: string | null;
  memberCount: number;
  eventsOrganized: number;
  averageRating: number;
  totalReviews: number;
  verified: boolean;
  events?: {
    id: string;
    title: string;
    startTime: string | null;
    endTime: string | null;
    location: string | null;
    status: string | null;
  }[];
};

export type VolunteerEvaluationItem = {
  id: string;
  registrationId: string;
  volunteerId: string;
  organizerUserId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
};

export type VolunteerProfile = {
  userId: string;
  fullName: string;
  email?: string;
  phone: string | null;
  avatar?: string | null;
  stats?: {
    totalEvents: number;
    completedEvents: number;
    pendingEvents: number;
    favoriteEvents: number;
  };
};

export type RegistrationItem = {
  id: number;
  eventId: number;
  eventTitle: string;
  thumbnail: string | null;
  registrationDate: string;
  status: string;
  eventLocation: string | null;
  eventDate: string;
};

export type FavoriteItem = {
  id: number;
  title: string;
  thumbnail: string | null;
  category: string;
  location: string | null;
  date: string;
  status: string;
};

export type CommentItem = {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
};

export type RatingItem = {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  review: string | null;
  createdAt: string;
};

export type RatingsResponse = {
  averageRating: number;
  totalRatings: number;
  ratings: RatingItem[];
};

export type UserRole = 'Admin' | 'Organizer' | 'Volunteer';

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: UserRole;
};

export type DonationStatus = 'Pending' | 'Success' | 'Failed';

export type DonationTransaction = {
  transactionCode: string;
  status: DonationStatus;
  amount: string;
  method: string;
  createdAt: string;
  updatedAt: string;
};

export type PaymentCreateResponse = {
  donationId: number;
  transactionCode: string;
  status: DonationStatus;
  paymentUrl: string;
  message: string;
};

export type AdminDashboardMetrics = {
  totalUsers: number;
  activeUsers: number;
  totalEvents: number;
  pendingApprovals: number;
  totalOrganizations: number;
  totalCategories: number;
  totalVolunteers: number;
  pendingRegistrations: number;
};

export type AdminEventApprovalItem = {
  id: number;
  title: string;
  description: string | null;
  status: string;
  startTime: string;
  endTime: string;
  location: string | null;
  organizationId: number | null;
  organizationName: string | null;
  categoryId: number | null;
  categoryName: string | null;
};

export type AdminUserItem = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
};

export type AdminCategoryItem = {
  id: number;
  name: string;
};

export type AdminModerationReport = {
  queue: unknown[];
  summary: {
    rejectedEvents: number;
    hiddenEvents: number;
    inactiveUsers: number;
  };
  message: string;
};

export type OrganizerDashboard = {
  organization: {
    id: string;
    name: string;
  };
  metrics: {
    totalEvents: number;
    approvedEvents: number;
    pendingEvents: number;
    draftEvents: number;
    totalRegistrations: number;
    pendingRegistrations: number;
    confirmedRegistrations: number;
  };
};

export type OrganizerEventItem = {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  location: string | null;
  status: string;
  isHidden: boolean;
  maxVolunteers: number;
  categoryId: string | null;
  categoryName: string | null;
  registrationCount: number;
};

export type OrganizerRegistrationItem = {
  id: string;
  status: string;
  fullName: string;
  phone: string | null;
  reason: string | null;
  registeredAt: string;
  event: {
    id: string;
    title: string;
    startTime: string;
    location: string | null;
  };
  volunteer: {
    id: string | null;
    userId: string | null;
    fullName: string;
    phone: string | null;
  };
};

export type OrganizerRegistrationDetail = {
  id: string;
  status: string;
  fullName: string;
  phone: string | null;
  reason: string | null;
  registeredAt: string;
  event: {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    location: string | null;
    status: string;
  };
  volunteer: {
    id: string | null;
    userId: string | null;
    fullName: string;
    phone: string | null;
  };
};

export type OrganizerVolunteerHistoryItem = {
  id: string;
  status: string;
  reason: string | null;
  registeredAt: string;
  event: {
    id: string | null;
    title: string;
    location: string | null;
    startTime: string | null;
    endTime: string | null;
    status: string | null;
  };
};

export const getApiErrorMessage = (error: unknown, fallback = 'Co loi xay ra.') => {
  return normalizeApiErrorMessage(error, fallback);
};

export const eventService = {
  getAll: (params?: { keyword?: string; location?: string; category?: number; page?: number; pageSize?: number }) =>
    apiClient.get<PaginatedResponse<EventItem>>('/events', {
      params,
    }),
  getById: (id: string | number) => apiClient.get<EventItem>(`/events/${id}`),
  register: (eventId: number, body: { userId: string; fullName?: string; phone?: string }) =>
    apiClient.post(`/events/${eventId}/register`, body),
  toggleFavorite: (eventId: number, userId: string) => apiClient.post(`/events/${eventId}/favorite`, { userId }),
  
  // Comments
  getComments: (eventId: number) => apiClient.get<CommentItem[]>(`/events/${eventId}/comments`),
  createComment: (eventId: number, content: string) => apiClient.post<CommentItem>(`/events/${eventId}/comments`, { content }),
  
  // Ratings & Reviews
  getRatings: (eventId: number) => apiClient.get<RatingsResponse>(`/events/${eventId}/ratings`),
  createRating: (eventId: number, body: { rating: number; review?: string }) => apiClient.post<RatingItem>(`/events/${eventId}/ratings`, body),
};

export const organizationService = {
  register: (body: {
    name: string;
    organizationType: string;
    description: string;
    contactEmail: string;
    phoneNumber: string;
    website?: string;
    city: string;
    district: string;
    ward?: string;
    address: string;
    taxCode?: string;
    foundedDate?: string;
    legalRepresentative?: string;
    documentType?: string;
    verificationDocsUrl?: string;
    facebookUrl?: string;
    zaloNumber?: string;
    achievements?: string;
    memberCount?: number;
    eventsOrganized?: number;
    focusAreas: string[];
    avatarUrl?: string;
  }) => apiClient.post<{ message: string; item: OrganizationItem }>('/organizations/register', body),
  getAll: (params?: { keyword?: string; city?: string; page?: number; pageSize?: number }) =>
    apiClient.get<PaginatedResponse<OrganizationItem>>(
      '/organizations',
      { params },
    ),
  getById: (id: string | number) => apiClient.get<OrganizationItem>(`/organizations/${id}`),
};

export const paymentService = {
  createMomo: (body: { amount: number; method?: 'momo' | 'bank'; donorName?: string; phoneNumber?: string; message?: string }) =>
    apiClient.post<PaymentCreateResponse>('/payments/momo/create', body),
  momoIpn: (body: { transactionCode: string; resultCode: string; providerRef?: string }) =>
    apiClient.post<DonationTransaction>('/payments/momo/ipn', body),
  getByTransaction: (transactionCode: string) => apiClient.get<DonationTransaction>(`/payments/${transactionCode}`),
};

export const volunteerService = {
  getProfile: (userId: string) => apiClient.get<VolunteerProfile>(`/volunteers/${userId}/profile`),
  updateProfile: (userId: string, body: { fullName: string; phone?: string }) =>
    apiClient.put<VolunteerProfile>(`/volunteers/${userId}/profile`, body),
  uploadAvatar: (userId: string, avatarData: string) =>
    apiClient.post<{ avatar: string; message: string }>(`/volunteers/${userId}/avatar`, { avatarData }),
  getRegistrations: (userId: string) => apiClient.get<RegistrationItem[]>(`/volunteers/${userId}/registrations`),
  cancelRegistration: (userId: string, registrationId: number) =>
    apiClient.delete(`/volunteers/${userId}/registrations/${registrationId}`),
  getFavorites: (userId: string) => apiClient.get<FavoriteItem[]>(`/volunteers/${userId}/favorites`),
  removeFavorite: (userId: string, eventId: number) => apiClient.delete(`/volunteers/${userId}/favorites/${eventId}`),
    
  getDashboard: (userId: string) => 
    apiClient.get(`/volunteers/${userId}/dashboard`),
};

export const authService = {
  register: (body: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    role?: UserRole;
  }) => apiClient.post<{ user: AuthUser }>('/auth/register', body),
  login: (body: { email: string; password: string }) => apiClient.post<{ user: AuthUser }>('/auth/login', body),
  logout: () => apiClient.post<{ message: string }>('/auth/logout'),
  me: () => apiClient.get<{ user: AuthUser }>('/auth/me'),
  updateProfile: (body: { fullName: string; phone?: string | null }) =>
    apiClient.patch<{ user: AuthUser }>('/auth/me', body),
};

export const adminService = {
  getDashboard: () => apiClient.get<AdminDashboardMetrics>('/admin/dashboard'),
  getEventApprovals: (params?: { search?: string; page?: number; pageSize?: number }) =>
    apiClient.get<PaginatedResponse<AdminEventApprovalItem>>('/admin/events/approvals', { params }),
  updateEventStatus: (id: number, action: 'approve' | 'reject') =>
    apiClient.patch<{ id: number; status: string }>(`/admin/events/${id}/status`, { action }),
  getUsers: (params?: { search?: string; page?: number; pageSize?: number }) =>
    apiClient.get<PaginatedResponse<AdminUserItem>>('/admin/users', { params }),
  updateUserStatus: (id: string, isActive: boolean) =>
    apiClient.patch<{ id: string; isActive: boolean }>(`/admin/users/${id}/status`, { isActive }),
  updateUserRole: (id: string, role: UserRole) =>
    apiClient.patch<{ id: string; role: UserRole }>(`/admin/users/${id}/role`, { role }),
  getCategories: (params?: { search?: string; page?: number; pageSize?: number }) =>
    apiClient.get<PaginatedResponse<AdminCategoryItem>>('/admin/categories', { params }),
  createCategory: (name: string) => apiClient.post<AdminCategoryItem>('/admin/categories', { name }),
  updateCategory: (id: number, name: string) => apiClient.patch<AdminCategoryItem>(`/admin/categories/${id}`, { name }),
  deleteCategory: (id: number) => apiClient.delete<{ message: string }>(`/admin/categories/${id}`),
  getModeration: () => apiClient.get<AdminModerationReport>('/admin/moderation'),
};

export const organizerService = {
  getRegistrationEvaluation: (id: string) =>
    apiClient.get<{ item: VolunteerEvaluationItem | null }>(`/organizer/registrations/${id}/evaluation`),

  saveRegistrationEvaluation: (id: string, body: { rating: number; comment?: string }) =>
    apiClient.post<VolunteerEvaluationItem>(`/organizer/registrations/${id}/evaluation`, body),
  getRegistrationById: (id: string) =>
    apiClient.get<OrganizerRegistrationDetail>(`/organizer/registrations/${id}`),

  getVolunteerHistory: (volunteerId: string) =>
    apiClient.get<{ items: OrganizerVolunteerHistoryItem[] }>(`/organizer/volunteers/${volunteerId}/history`),
  getDashboard: () => apiClient.get<OrganizerDashboard>('/organizer/dashboard'),
  getOrganization: () => apiClient.get<OrganizationItem>('/organizer/organization'),
  updateOrganization: (body: Partial<OrganizationItem>) => apiClient.patch<OrganizationItem>('/organizer/organization', body),
  claimOrganization: (organizationId: string) => apiClient.post<OrganizationItem>('/organizer/organization/claim', { organizationId }),
  getEvents: (params?: { search?: string; status?: string; page?: number; pageSize?: number }) =>
    apiClient.get<PaginatedResponse<OrganizerEventItem>>('/organizer/events', { params }),
  getEventById: (id: string) => apiClient.get<OrganizerEventItem>(`/organizer/events/${id}`),
  createEvent: (body: {
    title: string;
    description?: string;
    location?: string;
    categoryId?: string;
    maxVolunteers?: number;
    startTime: string;
    endTime: string;
  }) => apiClient.post('/organizer/events', body),
  updateEvent: (
    id: string,
    body: {
      title?: string;
      description?: string;
      location?: string;
      categoryId?: string;
      maxVolunteers?: number;
      startTime?: string;
      endTime?: string;
    },
  ) => apiClient.patch(`/organizer/events/${id}`, body),
  hideEvent: (id: string) => apiClient.post<{ id: string; status: string; isHidden: boolean }>(`/organizer/events/${id}/hide`),
  unhideEvent: (id: string) =>
    apiClient.post<{ id: string; status: string; isHidden: boolean }>(`/organizer/events/${id}/unhide`),
  getVolunteers: (params?: { eventId?: string; search?: string; status?: string; page?: number; pageSize?: number }) =>
    apiClient.get<PaginatedResponse<OrganizerRegistrationItem>>('/organizer/volunteers', { params }),
  updateRegistrationStatus: (id: string, action: 'approve' | 'reject') =>
    apiClient.patch<{ id: string; status: string }>(`/organizer/registrations/${id}/status`, { action }),
};

export default apiClient;
