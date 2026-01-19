// Request Models
export interface RegisterParentRequest {
    username: string;
    password: string;
    email: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface CreateKidRequest {
    username: string;
    password: string;
    displayName: string;
}

export interface GenerateStoryRequest {
    prompt: string;
    mood?: string;
    mode?: 'ONE_SHOT' | 'INTERACTIVE';
    sketch?: File;
}

export interface NextChapterRequest {
    userChoice: 'A' | 'B';
    prompt?: string;
}

// Response Models
export interface AuthResponse {
    token: string;
    userId: number;
    username: string;
    role: 'PARENT' | 'KID';
    message: string;
}

export interface UserDto {
    id?: number;
    username: string;
    displayName?: string;
    role?: 'PARENT' | 'KID';
    parentId?: number;
}

export interface StoryResponseDto {
    id: number;
    title: string;
    status: 'DRAFT' | 'PUBLISHED';
    mode: 'ONE_SHOT' | 'INTERACTIVE';
    metadata: Record<string, any>;
    createdAt: string;
    chapters: ChapterResponseDto[];
}

export interface ChapterResponseDto {
    id: number;
    chapterNumber: number;
    content: {
        text: string;
        title: string;
    };
    imageUrl: string | null;
    originalSketchUrl: string | null;
    moodTag: string | null;
    choices: {
        A: string;
        B: string;
    } | null;
    createdAt: string;
}

export interface DashboardResponseDto {
    totalStories: number;
    storiesThisWeek: number;
    avgChaptersPerStory: number;
    moodDistribution: Record<string, number>;
    activitySummary: Record<string, any>;
}

export interface PaginatedResponse<T> {
    content: T[];
    pageable: {
        pageNumber: number;
        pageSize: number;
        offset: number;
    };
    totalPages: number;
    totalElements: number;
    last: boolean;
    first: boolean;
    size: number;
    number: number;
    numberOfElements: number;
    empty: boolean;
}
