import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storyService } from '@/services/story.service';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import type { ChapterResponseDto } from '@/types';

export default function InteractiveStoryReader() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const storyId = Number(id);

    // Fetch full story to get past chapters
    const { data: story, isLoading: isStoryLoading } = useQuery({
        queryKey: ['story', storyId],
        queryFn: () => storyService.getStoryById(storyId),
        enabled: !!storyId,
    });

    const [currentChapter, setCurrentChapter] = useState<ChapterResponseDto | null>(null);

    // Set initial chapter when story loads
    useEffect(() => {
        if (story && story.chapters.length > 0) {
            setCurrentChapter(story.chapters[story.chapters.length - 1]);
        }
    }, [story]);

    const nextChapterMutation = useMutation({
        mutationFn: (choice: 'A' | 'B') =>
            storyService.generateNextChapter(storyId, { userChoice: choice }),
        onSuccess: (newChapter) => {
            // Invalidate story to refresh full list if needed, but we can just append locally for speed
            queryClient.setQueryData(['story', storyId], (old: any) => ({
                ...old,
                chapters: [...old.chapters, newChapter]
            }));
            setCurrentChapter(newChapter);
            window.scrollTo(0, 0);
        }
    });

    if (isStoryLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!story || !currentChapter) {
        return <div className="p-8 text-center text-red-500">Story not found.</div>;
    }

    return (
        <div className="min-h-screen bg-background pb-12">
            {/* Header */}
            <div className="border-b p-4 flex items-center gap-4 bg-card shadow-sm sticky top-0 z-10">
                <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="font-heading text-lg font-bold flex-1 truncate">{story.title}</h1>
                <div className="text-xs text-muted-foreground px-2 py-1 bg-secondary rounded-full">
                    Chapter {currentChapter.chapterNumber}
                </div>
            </div>

            <div className="max-w-3xl mx-auto p-4 space-y-8 mt-4">

                {/* Image Display */}
                {currentChapter.imageUrl && (
                    <div className="rounded-xl overflow-hidden shadow-lg border-4 border-white aspect-video relative bg-muted">
                        <img
                            src={currentChapter.imageUrl}
                            alt="Chapter illustration"
                            className="w-full h-full object-cover animate-in fade-in duration-700"
                        />
                    </div>
                )}

                {/* Story Text */}
                <div className="prose prose-lg dark:prose-invert max-w-none bg-card p-6 rounded-xl border shadow-sm">
                    <h2 className="font-heading text-2xl text-primary mb-4">{currentChapter.content.title}</h2>
                    <div className="whitespace-pre-wrap leading-relaxed">
                        {currentChapter.content.text}
                    </div>
                </div>

                {/* Choices Area */}
                <div className="space-y-4 pt-4">
                    <h3 className="text-center font-bold text-muted-foreground uppercase tracking-widest text-sm">
                        What happens next?
                    </h3>

                    {currentChapter.choices ? (
                        <div className="grid md:grid-cols-2 gap-4">
                            <button
                                onClick={() => nextChapterMutation.mutate('A')}
                                disabled={nextChapterMutation.isPending}
                                className="group relative overflow-hidden rounded-xl border-2 border-primary/20 bg-card p-6 text-left hover:border-primary hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                            >
                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <span className="block text-xs font-bold text-primary mb-1">OPTION A</span>
                                <span className="font-medium text-lg">{currentChapter.choices.A}</span>
                            </button>

                            <button
                                onClick={() => nextChapterMutation.mutate('B')}
                                disabled={nextChapterMutation.isPending}
                                className="group relative overflow-hidden rounded-xl border-2 border-secondary/20 bg-card p-6 text-left hover:border-secondary hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                            >
                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <span className="block text-xs font-bold text-secondary mb-1">OPTION B</span>
                                <span className="font-medium text-lg">{currentChapter.choices.B}</span>
                            </button>
                        </div>
                    ) : (
                        <div className="text-center p-8 bg-muted/30 rounded-xl border-2 border-dashed">
                            <p className="text-lg font-medium text-muted-foreground">The End (for now!)</p>
                            <Button variant="outline" className="mt-4" onClick={() => navigate('/dashboard')}>
                                Back to Library
                            </Button>
                        </div>
                    )}

                    {nextChapterMutation.isPending && (
                        <div className="text-center py-8 animate-pulse text-primary font-medium flex flex-col items-center gap-2">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <p>Writing the next chapter...</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
