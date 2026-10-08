import { Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import SubmitComplaint from './pages/SubmitComplaint';
import AdminDashboard from './pages/AdminDashboard';
import ComplaintReview from './pages/Officer/ComplaintReview';
import Track from './pages/Track';
import Navbar from './components/Navbar';
import RoleBasedChatbot from './components/chat/RoleBasedChatbot';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

function App() {
  const location = useLocation();

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route element={<ProtectedRoute allowedRoles={['citizen', 'admin']} />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/submit" element={<SubmitComplaint />} />
              <Route path="/track" element={<Track />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['officer', 'admin']} />}>
              <Route path="/officer/complaint/:id" element={<ComplaintReview />} />
            </Route>
          </Routes>
        </main>
        <RoleBasedChatbot />
      </div>
    </AuthProvider>
  );
}

export default App;
