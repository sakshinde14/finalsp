import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';

// Import your core components
import StudentLogin from './components/StudentLogin';
import StudentSignup from './components/StudentSignup';
import AdminLogin from './components/AdminLogin';
import DashboardLayout from './components/DashboardLayout'; // Student Dashboard Layout
import AdminDashboardLayout from './components/AdminDashboardLayout'; // Admin Dashboard Layout
// NEW IMPORTS for Admin Tools
import AddMaterial from './components/AddMaterial';
import ManageMaterials from './components/ManageMaterials';

// Import the ProtectedRoute component from its separate file
import ProtectedRoute from './components/ProtectedRoute'; // <--- MODIFIED: Import ProtectedRoute

// Import CSS files
import './components/AuthStyles.css';
import './components/DashboardStyles.css';

// --- INLINE AuthLayout Component ---
// This component provides the common layout for login/signup pages
function AuthLayout({ children }) {
    const currentPath = window.location.pathname; // Get current path to determine which link to show

    return (
        <div className="auth-layout">
            <div className="auth-toggle-corner">
                {/* Dynamically show the opposite login link based on current path */}
                {currentPath.includes('/login/admin') || currentPath.includes('/signup/admin') ? (
                    <Link to="/login/student" className="toggle-link">Student Login/Signup</Link>
                ) : (
                    <Link to="/login/admin" className="toggle-link">Admin Login</Link>
                )}
            </div>
            <div className="auth-visual-side">
                {/* Assuming /girlca.png is in your public folder */}
                <img src="/girlca.png" alt="Login Support" style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }} />
            </div>
            <div className="auth-form-side">
                {children} {/* Renders the actual login/signup forms here */}
            </div>
        </div>
    );
}

// --- Main App Component ---
function App() {
    return (
    <Router>
        <div className="app-container">
            <Routes>
                {/* Default route: Redirects to student login */}
                <Route path="/" element={<Navigate to="/signup/student" replace />} />
                
                {/* Public Authentication Routes */}
                <Route path="/login/student" element={<AuthLayout><StudentLogin /></AuthLayout>} />
                <Route path="/signup/student" element={<AuthLayout><StudentSignup /></AuthLayout>} />
                <Route path="/login/admin" element={<AuthLayout><AdminLogin /></AuthLayout>} />
                
                {/* Protected Student Dashboard Route */}
                {/* Accessible by both students and admins to view study materials */}
                <Route path="/dashboard" element={ <ProtectedRoute allowedRoles={['student', 'admin']}> <DashboardLayout /> </ProtectedRoute> } />
                
                {/* Protected Admin Dashboard Route */}
                {/* Accessible only by admins for management tasks */}
                <Route path="/admin/dashboard" element={ <ProtectedRoute allowedRoles={['admin']}> <AdminDashboardLayout /> </ProtectedRoute>} />
                
                {/* NEW: Admin Tools Routes */}
                <Route path="/admin/materials/add" element={ <ProtectedRoute allowedRoles={['admin']}> <AddMaterial /> </ProtectedRoute> } />
                <Route path="/admin/materials/manage" element={ <ProtectedRoute allowedRoles={['admin']}> <ManageMaterials /> </ProtectedRoute> } />

                {/* Fallback route for any unmatched URLs */}
                <Route path="*" element={<Navigate to="/login/student" replace />} />
            </Routes>
        </div>
    </Router>
    );
}

export default App;