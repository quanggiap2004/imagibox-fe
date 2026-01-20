import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CanvasDraw from 'react-canvas-draw';
import { useMutation } from '@tanstack/react-query';
import { storyService } from '@/services/story.service';
import { Button } from '@/components/ui/button';
import { Wand2, Pencil, Loader2 } from 'lucide-react';
import type { GenerateStoryRequest } from '@/types';

type Step = 'PROMPT' | 'SKETCH' | 'PREVIEW';

export default function StoryCreationWizard() {
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>('PROMPT');
    const [prompt, setPrompt] = useState('');
    const [mood, setMood] = useState('Adventurous');
    const [mode, setMode] = useState<'ONE_SHOT' | 'INTERACTIVE'>('ONE_SHOT');

    const canvasRef = useRef<CanvasDraw>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [canvasSize, setCanvasSize] = useState({ width: 400, height: 300 });
    const [sketchFile, setSketchFile] = useState<File | null>(null);
    const [canvasSaveData, setCanvasSaveData] = useState<string | null>(null);

    useEffect(() => {
        if (step === 'SKETCH' && canvasSaveData && canvasRef.current) {
            const timer = setTimeout(() => {
                if (canvasRef.current) {
                    // @ts-ignore
                    canvasRef.current.loadSaveData(canvasSaveData, true);
                    console.log('Canvas drawing restored');
                }
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [step, canvasSaveData, canvasSize]);

    // Resize canvas to fit container
    useEffect(() => {
        const updateCanvasSize = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth - 32;
                const height = Math.round(containerWidth * 0.6);
                setCanvasSize({ width: containerWidth, height });
            }
        };

        updateCanvasSize();
        window.addEventListener('resize', updateCanvasSize);
        return () => window.removeEventListener('resize', updateCanvasSize);
    }, [step]);

    const createStoryMutation = useMutation({
        mutationFn: (data: GenerateStoryRequest) => {
            return mode === 'ONE_SHOT'
                ? storyService.generateOneShot(data)
                : storyService.generateInteractive(data);
        },
        onSuccess: (data) => {
            navigate(`/stories/${data.id}/play`);
        }
    });

    const handleNext = async () => {
        if (step === 'PROMPT') {
            setStep('SKETCH');
        } else if (step === 'SKETCH') {
            if (canvasRef.current) {
                // @ts-ignore - getSaveData returns JSON with lines array
                const saveData = canvasRef.current.getSaveData();
                const parsed = JSON.parse(saveData);

                if (parsed.lines && parsed.lines.length > 0) {
                    // Save canvas data for restoration if user comes back
                    setCanvasSaveData(saveData);

                    // @ts-ignore - access internal canvas to get data url
                    const dataUrl = canvasRef.current.getDataURL('png', false, '#ffffff');
                    const res = await fetch(dataUrl);
                    const blob = await res.blob();
                    const file = new File([blob], 'sketch.png', { type: 'image/png' });
                    setSketchFile(file);
                    console.log('Sketch captured:', file.size, 'bytes');
                } else {
                    setSketchFile(null);
                    setCanvasSaveData(null);
                    console.log('No drawing detected');
                }
            }
            setStep('PREVIEW');
        }
    };

    const handleCreate = () => {
        createStoryMutation.mutate({
            prompt,
            mood,
            mode,
            sketch: sketchFile || undefined
        });
    };

    return (
        <div className="min-h-screen bg-background p-4 flex flex-col items-center">
            <div className="w-full max-w-2xl bg-card rounded-xl shadow-xl border p-6">

                <div className="flex justify-between mb-8">
                    {['Ideation', 'Magic Sketch', 'Create'].map((label, idx) => (
                        <div key={label} className={`text-sm font-medium ${(step === 'PROMPT' && idx === 0) || (step === 'SKETCH' && idx <= 1) || (step === 'PREVIEW')
                            ? 'text-primary' : 'text-muted-foreground'
                            }`}>
                            Step {idx + 1}: {label}
                        </div>
                    ))}
                </div>

                {step === 'PROMPT' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="text-center">
                            <h2 className="text-2xl font-heading font-bold flex items-center justify-center gap-2">
                                <Wand2 className="h-6 w-6 text-primary" />
                                Dream Your Story
                            </h2>
                            <p className="text-muted-foreground">What adventure should we go on today?</p>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-medium">Story Idea</label>
                            <textarea
                                className="w-full h-32 p-3 rounded-md border bg-background resize-none focus:ring-2 focus:ring-primary"
                                placeholder="A brave astronaut explores a planet made of candy..."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Mood</label>
                                <select
                                    className="w-full p-2 rounded-md border bg-background"
                                    value={mood}
                                    onChange={(e) => setMood(e.target.value)}
                                >
                                    <option>Adventurous</option>
                                    <option>Happy</option>
                                    <option>Funny</option>
                                    <option>Scary</option>
                                    <option>Magical</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Type</label>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant={mode === 'ONE_SHOT' ? 'default' : 'outline'}
                                        className="flex-1"
                                        onClick={() => setMode('ONE_SHOT')}
                                    >
                                        Story
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={mode === 'INTERACTIVE' ? 'default' : 'outline'}
                                        className="flex-1"
                                        onClick={() => setMode('INTERACTIVE')}
                                    >
                                        Game
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <Button className="w-full" onClick={handleNext} disabled={!prompt}>
                            Next: Add a Sketch
                        </Button>
                    </div>
                )}

                {step === 'SKETCH' && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="text-center">
                            <h2 className="text-2xl font-heading font-bold flex items-center justify-center gap-2">
                                <Pencil className="h-6 w-6 text-secondary" />
                                Magic Sketchpad
                            </h2>
                            <p className="text-muted-foreground">Draw something to include in your story (optional)</p>
                        </div>

                        <div ref={containerRef} className="border-2 border-dashed rounded-xl p-4 flex justify-center bg-white overflow-hidden relative">
                            <CanvasDraw
                                ref={canvasRef}
                                brushRadius={3}
                                lazyRadius={0}
                                canvasWidth={canvasSize.width}
                                canvasHeight={canvasSize.height}
                                hideGrid={true}
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                className="absolute top-2 right-2 z-10 bg-white hover:bg-gray-100 text-gray-700 border-gray-300"
                                onClick={() => {
                                    canvasRef.current?.clear();
                                    setCanvasSaveData(null);
                                    setSketchFile(null);
                                }}
                            >
                                Clear
                            </Button>
                        </div>

                        <div className="flex gap-4">
                            <Button variant="outline" onClick={() => setStep('PROMPT')} className="flex-1">
                                Back
                            </Button>
                            <Button onClick={handleNext} className="flex-1">
                                Review & Create
                            </Button>
                        </div>
                    </div>
                )}

                {step === 'PREVIEW' && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="text-center">
                            <h2 className="text-2xl font-heading font-bold">Ready to Create?</h2>
                            <p className="text-muted-foreground">Review your story details</p>
                        </div>

                        <div className="bg-muted p-4 rounded-lg space-y-2">
                            <p><strong>Promt:</strong> {prompt}</p>
                            <p><strong>Mood:</strong> {mood}</p>
                            <p><strong>Type:</strong> {mode === 'ONE_SHOT' ? 'Standard Story' : 'Interactive Adventure'}</p>
                        </div>

                        {createStoryMutation.error && (
                            <div className="text-destructive text-sm bg-destructive/10 p-2 rounded">
                                {(createStoryMutation.error as any).response?.data?.message || 'Failed to generate story'}
                            </div>
                        )}

                        <div className="flex gap-4">
                            <Button variant="outline" onClick={() => setStep('SKETCH')} className="flex-1" disabled={createStoryMutation.isPending}>
                                Back
                            </Button>
                            <Button onClick={handleCreate} className="flex-1" disabled={createStoryMutation.isPending}>
                                {createStoryMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating Magic...
                                    </>
                                ) : (
                                    'Generate Story'
                                )}
                            </Button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
