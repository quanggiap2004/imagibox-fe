import { create } from 'zustand';
import { authService } from '../services/auth.service';
import type { LoginRequest, RegisterParentRequest } from '../types';

interface AuthState {
    isAuthenticated: boolean;
    userRole: 'PARENT' | 'KID' | null;
    isLoading: boolean;
    error: string | null;
    login: (data: LoginRequest) => Promise<void>;
    register: (data: RegisterParentRequest) => Promise<void>;
    logout: () => void;
    checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    isAuthenticated: authService.isAuthenticated(),
    userRole: authService.getRole(),
    isLoading: false,
    error: null,

    login: async (data: LoginRequest) => {
        set({ isLoading: true, error: null });
        try {
            const response = await authService.login(data);
            set({
                isAuthenticated: true,
                userRole: response.role,
                isLoading: false
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Login failed',
                isLoading: false
            });
            throw error;
        }
    },

    register: async (data: RegisterParentRequest) => {
        set({ isLoading: true, error: null });
        try {
            const response = await authService.register(data);
            set({
                isAuthenticated: true,
                userRole: response.role,
                isLoading: false
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Registration failed',
                isLoading: false
            });
            throw error;
        }
    },

    logout: () => {
        authService.logout();
        set({ isAuthenticated: false, userRole: null });
    },

    checkAuth: () => {
        set({
            isAuthenticated: authService.isAuthenticated(),
            userRole: authService.getRole()
        });
    }
}));
