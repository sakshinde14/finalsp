// src/components/ProtectedRoute.jsx
import React, { useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom'; // Make sure Navigate is imported

function ProtectedRoute({ children, allowedRoles }) {
    // We now check for a 'userRole' which is set upon login (student or admin)
    const userRole = localStorage.getItem('userRole'); 
    const navigate = useNavigate(); // This is correctly used for programmatic navigation

    useEffect(() => {
        // If there's no userRole (meaning not logged in at all)
        // or if the user's role is not among the roles allowed for this specific route
        if (!userRole || (allowedRoles && !allowedRoles.includes(userRole))) {
            // Determine where to redirect:

            if (!userRole) { 
                // Case 1: Not logged in at all, redirect to student login as default
                navigate('/login/student', { replace: true });
            } else { 
                // Case 2: Logged in, but trying to access a page they don't have permission for
                // (e.g., student trying to access /admin/dashboard)
                console.warn(`User with role "${userRole}" attempted to access a route for roles: ${allowedRoles}. Redirecting.`);
                
                // You can customize this redirect logic further:
                // If they are a student, send them to the student dashboard.
                // If they are an admin, send them to the admin dashboard (if /admin/dashboard is their default).
                if (userRole === 'student') {
                    navigate('/dashboard', { replace: true });
                } else if (userRole === 'admin') {
                    navigate('/admin/dashboard', { replace: true });
                } else {
                    // Fallback for unknown roles or other issues
                    navigate('/login/student', { replace: true });
                }
            }
        }
    }, [userRole, allowedRoles, navigate]); // Depend on userRole, allowedRoles, and navigate

    // Render children only if userRole exists AND is among the allowedRoles
    // The useEffect will handle the redirection if conditions are not met.
    return userRole && (allowedRoles ? allowedRoles.includes(userRole) : true) ? children : null;
}

export default ProtectedRoute;