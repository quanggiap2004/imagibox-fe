import axios, { type AxiosInstance } from 'axios';
import { API_BASE_URL, API_CONFIG } from '../config/api';
import { getAuthHeaders } from '../utils/auth';

class ApiService {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            timeout: API_CONFIG.TIMEOUT,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.client.interceptors.request.use((config) => {
            const authHeaders = getAuthHeaders();
            config.headers.set('Authorization', authHeaders['Authorization']);
            return config;
        });

        this.client.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('userId');
                    localStorage.removeItem('userRole');
                    if (!window.location.pathname.includes('/login')) {
                        window.location.href = '/login';
                    }
                }
                return Promise.reject(error);
            }
        );
    }

    public get instance() {
        return this.client;
    }
}

export const apiService = new ApiService().instance;
