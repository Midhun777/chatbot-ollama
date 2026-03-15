import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Components & Pages
import Navbar from './components/layout/Navbar';
import Home from './pages/public/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import AdminDashboard from './pages/admin/AdminDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import GuestDashboard from './pages/guest/GuestDashboard';

// Placeholder Dashboards (To be replaced)
const Courses = () => <div className="p-8"><h1 className="text-2xl font-bold text-blue-600">Public Courses</h1></div>;

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen bg-gray-50 flex flex-col">
                    <Navbar />

                    <main className="flex-1">
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/courses" element={<Courses />} />
                            <Route path="/guest/dashboard" element={<GuestDashboard />} />

                            {/* Student Protected Routes */}
                            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                                <Route path="/student/dashboard" element={<StudentDashboard />} />
                            </Route>

                            {/* Admin Protected Routes */}
                            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                            </Route>

                            {/* Faculty Protected Routes */}
                            <Route element={<ProtectedRoute allowedRoles={['faculty']} />}>
                                <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
                            </Route>

                            {/* Fallback */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </main>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
