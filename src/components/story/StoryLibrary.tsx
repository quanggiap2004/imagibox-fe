import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { storyService } from '@/services/story.service';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2, BookOpen, Clock, Trash2, Plus } from 'lucide-react';

export default function StoryLibrary() {
    const [page, setPage] = useState(0);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['stories', page],
        queryFn: () => storyService.getMyStories(page),
        placeholderData: (prev) => prev
    });

    const handleDelete = async (e: React.MouseEvent, id: number) => {
        e.preventDefault(); // Prevent navigation
        if (confirm('Are you sure you want to delete this story?')) {
            await storyService.deleteStory(id);
            refetch();
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto min-h-screen bg-background">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-primary">My Library</h1>
                    <p className="text-muted-foreground">All your magical adventures</p>
                </div>
                <Link to="/create-story">
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" /> New Story
                    </Button>
                </Link>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data?.content.map((story) => (
                            <Link to={`/stories/${story.id}/play`} key={story.id} className="group block h-full">
                                <div className="bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-all hover:border-primary/50 h-full flex flex-col">
                                    {/* Thumbnail fallback based on mood usually, or first chapter image */}
                                    <div className="h-40 bg-muted relative flex items-center justify-center overflow-hidden">
                                        {story.chapters[0]?.imageUrl ? (
                                            <img src={story.chapters[0].imageUrl} alt={story.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                        ) : (
                                            <BookOpen className="h-12 w-12 text-muted-foreground/50" />
                                        )}
                                        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur">
                                            {story.mode === 'INTERACTIVE' ? 'Interactive' : 'Story'}
                                        </div>
                                    </div>

                                    <div className="p-4 flex-1 flex flex-col">
                                        <h3 className="font-bold text-lg mb-2 group-hover:text-primary truncate">{story.title}</h3>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                                            <Clock className="h-3 w-3" />
                                            {new Date(story.createdAt).toLocaleDateString()}
                                        </div>

                                        <div className="mt-auto flex justify-end">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={(e) => handleDelete(e, story.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="mt-8 flex justify-center gap-4">
                        <Button
                            variant="outline"
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                        >
                            Previous
                        </Button>
                        <span className="flex items-center text-sm font-medium">Page {page + 1}</span>
                        <Button
                            variant="outline"
                            onClick={() => setPage(p => p + 1)}
                            disabled={data?.last}
                        >
                            Next
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}
