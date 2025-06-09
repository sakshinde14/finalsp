import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import StudentLogin from './components/StudentLogin';
import StudentSignup from './components/StudentSignup';
import AdminLogin from './components/AdminLogin';
import DashboardLayout from './components/DashboardLayout';
import AdminDashboardLayout from './components/AdminDashboardLayout';
import AddMaterial from './components/AddMaterial';
import ManageMaterials from './components/ManageMaterials';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './components/LandingPage';
import Favorites from './components/Favorites'; // adjust path if needed

import './components/AuthStyles.css';
import './components/DashboardStyles.css';
import './components/AdminDashboardStyles.css';
import './components/AddMaterialStyles.css';
import './components/ManageMaterialsStyles.css';
import './components/LandingPageStyles.css';


function App() {
    return (
        <Router>
            <div className="app-container">
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login/student" element={<StudentLogin />} />
                    <Route path="/signup/student" element={<StudentSignup />} />
                    <Route path="/login/admin" element={<AdminLogin />} />
                    <Route path="/dashboard" element={ <ProtectedRoute allowedRoles={['student', 'admin']}> <DashboardLayout /> </ProtectedRoute> } />

                    <Route path="/admin/dashboard" element={ <ProtectedRoute allowedRoles={['admin']}> <AdminDashboardLayout /> </ProtectedRoute>} />
                    <Route path="/admin/materials/add" element={ <ProtectedRoute allowedRoles={['admin']}> <AddMaterial /> </ProtectedRoute> } />
                    <Route path="/admin/materials/manage" element={ <ProtectedRoute allowedRoles={['admin']}> <ManageMaterials /> </ProtectedRoute> } />
                    <Route path="/favorites" element={ <ProtectedRoute allowedRoles={['student']}> <Favorites /> </ProtectedRoute> } />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </Router>
    );
}
export default App;