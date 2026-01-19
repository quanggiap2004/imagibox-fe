import { apiService } from './api.service';
import type {
    LoginRequest,
    RegisterParentRequest,
    CreateKidRequest,
    AuthResponse,
    UserDto,
} from '../types';

export const authService = {
    async register(data: RegisterParentRequest): Promise<AuthResponse> {
        const response = await apiService.post<AuthResponse>('/auth/register', data);
        this.setSession(response.data);
        return response.data;
    },

    async login(data: LoginRequest): Promise<AuthResponse> {
        const response = await apiService.post<AuthResponse>('/auth/login', data);
        this.setSession(response.data);
        return response.data;
    },

    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        window.location.href = '/login';
    },

    async createKid(data: CreateKidRequest): Promise<UserDto> {
        const response = await apiService.post<UserDto>('/auth/kids', data);
        return response.data;
    },

    async getMyKids(): Promise<UserDto[]> {
        const response = await apiService.get<UserDto[]>('/auth/kids');
        return response.data;
    },

    async getCurrentUser(): Promise<UserDto> {
        const response = await apiService.get<UserDto>('/auth/me');
        return response.data;
    },

    isAuthenticated(): boolean {
        return !!localStorage.getItem('authToken');
    },

    getRole(): 'PARENT' | 'KID' | null {
        return localStorage.getItem('userRole') as 'PARENT' | 'KID' | null;
    },

    setSession(data: AuthResponse) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userId', data.userId.toString());
        localStorage.setItem('userRole', data.role);
    }
};
