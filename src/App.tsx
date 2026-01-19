import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import CreateKidPage from './pages/auth/CreateKidPage';
import ParentDashboard from './pages/dashboard/ParentDashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import StoryLibrary from './components/story/StoryLibrary';
import StoryCreationWizard from './components/story/StoryCreationWizard';
import InteractiveStoryReader from './components/story/InteractiveStoryReader';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Parent Routes */}
          <Route element={<ProtectedRoute allowedRoles={['PARENT']} />}>
            <Route path="/dashboard" element={<ParentDashboard />} />
            <Route path="/create-kid" element={<CreateKidPage />} />
          </Route>

          {/* Kid Routes using components directly for now (normally wrapped in Pages) */}
          <Route element={<ProtectedRoute allowedRoles={['KID', 'PARENT']} />}>
            <Route path="/stories" element={<StoryLibrary />} />
            <Route path="/create-story" element={<StoryCreationWizard />} />
            <Route path="/stories/:id/play" element={<InteractiveStoryReader />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
