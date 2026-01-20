import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics.service';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function ParentDashboard() {
    const logout = useAuthStore((state) => state.logout);
    const navigate = useNavigate();

    const { data, isLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: () => analyticsService.getDashboard(),
    });

    const moodData = data?.moodDistribution
        ? Object.entries(data.moodDistribution).map(([name, value]) => ({ name, value }))
        : [];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-background p-8">
            <header className="flex items-center justify-between border-b pb-6">
                <h1 className="text-3xl font-heading font-bold text-primary">Parent Dashboard</h1>
                <div className="flex gap-4">
                    <Link to="/create-kid">
                        <Button>Add New Kid Profile</Button>
                    </Link>
                    <Button variant="outline" onClick={handleLogout}>
                        Logout
                    </Button>
                </div>
            </header>

            <main className="mt-8">
                <div className="rounded-lg border bg-card p-6 text-card-foreground shadow">
                    <h2 className="text-xl font-semibold mb-4">Welcome!</h2>
                    <p className="text-muted-foreground">
                        This is the parent dashboard. Here you will see analytics and manage your kids' profiles.
                    </p>
                    <div className="mt-6 space-y-8">
                        {/* Overview Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatCard title="Total Stories" value={data?.totalStories} loading={isLoading} />
                            <StatCard title="Stories This Week" value={data?.storiesThisWeek} loading={isLoading} />
                            <StatCard title="Avg Chapters/Story" value={data?.avgChaptersPerStory?.toFixed(1)} loading={isLoading} />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Mood Distribution Chart */}
                            <div className="border rounded-xl p-6 shadow-sm">
                                <h3 className="font-semibold mb-6 flex items-center gap-2">
                                    Mood Distribution
                                </h3>
                                <div className="h-64 w-full">
                                    {isLoading ? (
                                        <div className="h-full flex items-center justify-center bg-muted/20 rounded">
                                            <LoadingSpinner />
                                        </div>
                                    ) : (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={moodData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {moodData.map((_entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>

                            {/* Activity Summary */}
                            <div className="border rounded-xl p-6 shadow-sm">
                                <h3 className="font-semibold mb-6">Weekly Activity</h3>
                                <div className="h-64 w-full bg-muted/10 rounded flex items-center justify-center text-muted-foreground text-sm">
                                    Activity history visualization coming soon
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function StatCard({ title, value, loading }: { title: string, value?: number | string, loading: boolean }) {
    return (
        <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
            <div className="mt-2 text-3xl font-bold text-primary">
                {loading ? <span className="animate-pulse bg-muted h-8 w-16 block rounded" /> : value || 0}
            </div>
        </div>
    );
}

function LoadingSpinner() {
    return <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />;
}
