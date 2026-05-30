import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import TrailsPage from './pages/TrailsPage';
import TrailDetailPage from './pages/TrailDetailPage';
import PlannerPage from './pages/PlannerPage';
import ProfilePage from './pages/ProfilePage';
import UploadPage from './pages/UploadPage';

export default function App() {
  const { i18n } = useTranslation();

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/trails" element={<TrailsPage />} />
        <Route path="/trails/:id" element={<TrailDetailPage />} />
        <Route path="/planner" element={<PlannerPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/upload" element={<UploadPage />} />
      </Routes>
    </Layout>
  );
}
