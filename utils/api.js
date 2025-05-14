import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// backend URL
const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication services
export const authService = {
  login: (email, password) => api.post('/login', { email, password }),
  register: (userData) => api.post('/inscription', userData),
  loginPersonnel: (email, password) => api.post('/login-personnel', { email, password }),
};

// Menu services
export const menuService = {
  getAllItems: () => api.get('/platClient'),
  getRecommendedItems: () => api.get('/platClient/recommandes'),
  getItemDetails: (id) => api.get(`/PLatClient/${id}`),
  addToFavorites: (id_plat, id_client) => api.post('/platfavorie', { id_plat, id_client }),
  getFavorites: (id_client) => api.get(`/platfavorie/${id_client}`),
};

// Order services
export const orderService = {
  createOrder: (orderData) => api.post('/commandes', orderData),
  getOrders: (id_client) => api.get(`/commandes/${id_client}`),
  getOrderDetails: (id_commande) => api.get(`/commandes/plat/${id_commande}`),
  callWaiter: (id_client, id_table) => api.post('/call-waiter', { id_client, id_table }),
  submitRating: (notificationId, ratings) => api.post(`/ratings/${notificationId}`, { ratings }),
};

// FCM token registration
export const notificationService = {
  registerToken: (id_user, role, fcmToken) => 
    api.post('/fcm-token', { id_user, role, fcmToken }),
  getClientNotifications: (id_client) => 
    api.get(`/notifications/client/${id_client}`),
  getRatingNotifications: (id_client) => 
    api.get(`/notifications/rating/${id_client}`),
};

export default api;
