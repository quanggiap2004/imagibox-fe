import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

const createKidSchema = z.object({
    displayName: z.string().min(2, 'Display name is too short'),
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(4, 'Password must be at least 4 characters (keep it simple for kids)'),
});

type CreateKidFormValues = z.infer<typeof createKidSchema>;

export default function CreateKidPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CreateKidFormValues>({
        resolver: zodResolver(createKidSchema),
    });

    const onSubmit = async (data: CreateKidFormValues) => {
        setIsLoading(true);
        setError(null);
        try {
            await authService.createKid(data);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create kid account');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="w-full max-w-md space-y-8 rounded-xl border border-border bg-card p-8 shadow-lg">
                <div className="text-center">
                    <h1 className="text-2xl font-heading font-bold text-primary">Add a Kid Profile</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Create a separate login for your child
                    </p>
                </div>

                {error && (
                    <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Display Name (e.g. "Johnny")</label>
                        <Input
                            placeholder="Child's Name"
                            {...register('displayName')}
                            className={errors.displayName ? 'border-destructive' : ''}
                        />
                        {errors.displayName && (
                            <p className="text-xs text-destructive">{errors.displayName.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Username (for login)</label>
                        <Input
                            placeholder="hero_johnny"
                            {...register('username')}
                            className={errors.username ? 'border-destructive' : ''}
                        />
                        {errors.username && (
                            <p className="text-xs text-destructive">{errors.username.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Password</label>
                        <Input
                            type="password"
                            placeholder="Simple password"
                            {...register('password')}
                            className={errors.password ? 'border-destructive' : ''}
                        />
                        {errors.password && (
                            <p className="text-xs text-destructive">{errors.password.message}</p>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => navigate('/dashboard')}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Creating...' : 'Create Profile'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
