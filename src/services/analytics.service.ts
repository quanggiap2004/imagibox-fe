import { apiService } from './api.service';
import type { DashboardResponseDto } from '../types';

export const analyticsService = {
    async getDashboard(): Promise<DashboardResponseDto> {
        const response = await apiService.get<DashboardResponseDto>('/analytics/dashboard');
        return response.data;
    },

    async getMoodDistribution(): Promise<Record<string, number>> {
        const response = await apiService.get<Record<string, number>>(
            '/analytics/mood-distribution'
        );
        return response.data;
    },
};
