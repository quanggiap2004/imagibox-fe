import { apiService } from './api.service';
import type {
    GenerateStoryRequest,
    NextChapterRequest,
    StoryResponseDto,
    ChapterResponseDto,
    PaginatedResponse,
} from '../types';

export const storyService = {
    async generateOneShot(data: GenerateStoryRequest): Promise<StoryResponseDto> {
        const formData = new FormData();
        formData.append('prompt', data.prompt);
        if (data.mood) formData.append('mood', data.mood);
        if (data.mode) formData.append('mode', data.mode);
        if (data.sketch) formData.append('sketch', data.sketch);

        const response = await apiService.post<StoryResponseDto>(
            '/stories/generate-one-shot',
            formData,
            {
                headers: { 'Content-Type': 'multipart/form-data' },
            }
        );
        return response.data;
    },

    async generateInteractive(
        data: GenerateStoryRequest
    ): Promise<StoryResponseDto> {
        const formData = new FormData();
        formData.append('prompt', data.prompt);
        if (data.mood) formData.append('mood', data.mood);
        if (data.sketch) formData.append('sketch', data.sketch);

        const response = await apiService.post<StoryResponseDto>(
            '/stories/generate-interactive',
            formData,
            {
                headers: { 'Content-Type': 'multipart/form-data' },
            }
        );
        return response.data;
    },

    async generateNextChapter(
        storyId: number,
        data: NextChapterRequest
    ): Promise<ChapterResponseDto> {
        const response = await apiService.post<ChapterResponseDto>(
            `/stories/${storyId}/chapters/next`,
            data
        );
        return response.data;
    },

    async getMyStories(
        page = 0,
        size = 10,
        sortBy = 'createdAt',
        direction: 'ASC' | 'DESC' = 'DESC'
    ): Promise<PaginatedResponse<StoryResponseDto>> {
        const response = await apiService.get<PaginatedResponse<StoryResponseDto>>(
            '/stories',
            {
                params: { page, size, sortBy, direction },
            }
        );
        return response.data;
    },

    async getStoryById(storyId: number): Promise<StoryResponseDto> {
        const response = await apiService.get<StoryResponseDto>(`/stories/${storyId}`);
        return response.data;
    },

    async getChaptersByStoryId(storyId: number): Promise<ChapterResponseDto[]> {
        const response = await apiService.get<ChapterResponseDto[]>(`/stories/${storyId}/chapters`);
        return response.data;
    },

    async deleteStory(storyId: number): Promise<void> {
        await apiService.delete(`/stories/${storyId}`);
    },
};
