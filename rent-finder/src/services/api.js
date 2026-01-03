// AuraEstate API Client
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  getToken() {
    return localStorage.getItem('auraestate_token');
  }

  setToken(token) {
    localStorage.setItem('auraestate_token', token);
  }

  clearToken() {
    localStorage.removeItem('auraestate_token');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(data.error || 'Request failed', response.status, data);
    }

    return data;
  }

  // Auth endpoints
  async register(userData) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.clearToken();
    }
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async changePassword(currentPassword, newPassword) {
    return this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // User endpoints
  async getProfile() {
    return this.request('/users/profile');
  }

  async updateProfile(profileData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async updateTenantProfile(profileData) {
    return this.request('/users/tenant-profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async updateLandlordProfile(profileData) {
    return this.request('/users/landlord-profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Saved Properties
  async getSavedProperties() {
    return this.request('/users/saved');
  }

  async saveProperty(propertyId, notes = '') {
    return this.request(`/users/saved/${propertyId}`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }

  async unsaveProperty(propertyId) {
    return this.request(`/users/saved/${propertyId}`, {
      method: 'DELETE',
    });
  }

  // Notifications
  async getNotifications() {
    return this.request('/users/notifications');
  }

  async markNotificationRead(notificationId) {
    return this.request(`/users/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  // Property endpoints
  async getProperties(params = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value);
      }
    });
    return this.request(`/properties?${searchParams.toString()}`);
  }

  async getMyListings() {
    return this.request('/properties/my-listings');
  }

  async getFeaturedProperties(listingType = null, limit = 8) {
    const params = new URLSearchParams({ limit });
    if (listingType) params.append('listingType', listingType);
    return this.request(`/properties/featured?${params.toString()}`);
  }

  async getProperty(id) {
    return this.request(`/properties/${id}`);
  }

  async createProperty(propertyData) {
    return this.request('/properties', {
      method: 'POST',
      body: JSON.stringify(propertyData),
    });
  }

  async updateProperty(id, propertyData) {
    return this.request(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(propertyData),
    });
  }

  async deleteProperty(id) {
    return this.request(`/properties/${id}`, {
      method: 'DELETE',
    });
  }

  async getSimilarProperties(id) {
    return this.request(`/properties/${id}/similar`);
  }

  // Application endpoints
  async getApplications(status = null) {
    const params = status ? `?status=${status}` : '';
    return this.request(`/applications${params}`);
  }

  async getReceivedApplications(propertyId = null) {
    const params = propertyId ? `?propertyId=${propertyId}` : '';
    return this.request(`/applications/received${params}`);
  }

  async submitApplication(applicationData) {
    return this.request('/applications', {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  }

  async updateApplicationStatus(applicationId, status) {
    return this.request(`/applications/${applicationId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async withdrawApplication(applicationId) {
    return this.request(`/applications/${applicationId}`, {
      method: 'DELETE',
    });
  }

  async scheduleViewing(propertyId, viewingData) {
    return this.request(`/applications/${propertyId}/schedule-viewing`, {
      method: 'POST',
      body: JSON.stringify(viewingData),
    });
  }

  // Message endpoints
  async getConversations() {
    return this.request('/messages/conversations');
  }

  async getMessages(userId, propertyId = null, page = 1) {
    const params = new URLSearchParams({ page });
    if (propertyId) params.append('propertyId', propertyId);
    return this.request(`/messages/${userId}?${params.toString()}`);
  }

  async sendMessage(receiverId, content, propertyId = null) {
    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify({ receiverId, content, propertyId }),
    });
  }

  async getUnreadCount() {
    return this.request('/messages/unread/count');
  }

  // Upload endpoints
  async uploadImages(files) {
    // Filter out any undefined or invalid files
    const validFiles = files.filter(file => file && file instanceof File);
    console.log('Valid files for upload:', validFiles.length, validFiles);
    
    if (validFiles.length === 0) {
      throw new ApiError('No valid files to upload', 400, {});
    }
    
    const formData = new FormData();
    validFiles.forEach((file, index) => {
      console.log(`Appending file ${index}:`, file.name, file.type, file.size);
      formData.append('images', file);
    });

    const token = this.getToken();
    console.log('Uploading to:', `${this.baseUrl}/upload/images`);
    
    const response = await fetch(`${this.baseUrl}/upload/images`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    const data = await response.json();
    console.log('Upload response:', response.status, data);
    
    if (!response.ok) {
      throw new ApiError(data.error || 'Upload failed', response.status, data);
    }
    return data;
  }

  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    const token = this.getToken();
    const response = await fetch(`${this.baseUrl}/upload/image`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new ApiError(data.error || 'Upload failed', response.status, data);
    }
    return data;
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const api = new ApiClient();
export { ApiError };
