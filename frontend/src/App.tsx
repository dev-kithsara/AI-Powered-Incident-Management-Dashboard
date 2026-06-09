import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import Layout             from '@/components/layout/Layout'
import LoginPage          from '@/pages/LoginPage'
import DashboardPage      from '@/pages/DashboardPage'
import IncidentsPage      from '@/pages/IncidentsPage'
import CreateIncidentPage from '@/pages/CreateIncidentPage'
import IncidentDetailPage from '@/pages/IncidentDetailPage'
import AIDashboardPage      from '@/pages/AIDashboardPage'
import PredictiveRiskPage   from '@/pages/PredictiveRiskPage'
import UsersPage            from '@/pages/UsersPage'
import ProfilePage          from '@/pages/ProfilePage'
import LessonsLibraryPage  from '@/pages/LessonsLibraryPage'
import RootCausePage        from '@/pages/RootCausePage'


const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore(s => s.token)
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useAuthStore(s => s.user)
  return user?.role === 'admin' ? <>{children}</> : <Navigate to="/dashboard" replace />
}

export default function App() {
  const token = useAuthStore(s => s.token)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <LoginPage />} />

        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <Navigate to="/dashboard" replace />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout><DashboardPage /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/incidents" element={
          <ProtectedRoute>
            <Layout><IncidentsPage /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/incidents/new" element={
          <ProtectedRoute>
            <Layout><CreateIncidentPage /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/incidents/:id" element={
          <ProtectedRoute>
            <Layout><IncidentDetailPage /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/ai-dashboard" element={
          <ProtectedRoute>
            <Layout><AIDashboardPage /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/predictive-risk" element={
          <ProtectedRoute>
            <Layout><PredictiveRiskPage /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/lessons-learned" element={
          <ProtectedRoute>
            <Layout><LessonsLibraryPage /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/root-causes" element={
          <ProtectedRoute>
            <Layout><RootCausePage /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/users" element={
          <ProtectedRoute>
            <AdminRoute>
              <Layout><UsersPage /></Layout>
            </AdminRoute>
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout><ProfilePage /></Layout>
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
