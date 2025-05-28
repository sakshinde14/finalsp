// AdminLogin.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Make sure useNavigate is imported
import './AuthStyles.css'; // Make sure your auth-popup styles are here

function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginMessage, setLoginMessage] = useState(''); // Unified state for success/error messages
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginMessage(''); // Clear any previous message before new login attempt

        try {
            const response = await fetch('http://localhost:5000/api/auth/login/admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                setLoginMessage("Admin login successful!"); // Set success message for popup
                console.log("Admin login successful:", data.message);
                // Store admin token/role in localStorage here, e.g.:
                localStorage.setItem('adminAuthToken', data.token || 'someGeneratedAdminToken');
                localStorage.setItem('userRole', 'admin');
                
                // Delay redirection to show the message
                setTimeout(() => {
                    setLoginMessage(''); // Clear message after delay
                    navigate('/admin/dashboard'); // Redirect to the NEW admin dashboard route
                }, 2000); // Display message for 2 seconds
            } else {
                setLoginMessage(`Login failed: ${data.message || 'Invalid admin credentials'}`); // Set error message for popup
                console.error("Admin login failed:", data.message);
                setTimeout(() => {
                    setLoginMessage(''); // Clear message after a longer delay
                }, 3000); // Show error message a bit longer
            }
        } catch (error) {
            setLoginMessage('Failed to connect to the server. Please try again later.'); // Network error message
            console.error('Login error:', error);
            setTimeout(() => {
                setLoginMessage('');
            }, 3000);
        }
    };

    return (
        <div className="auth-container">
            <h2 className="auth-title">Admin Login</h2>

            {/* --- NEW: Conditional rendering for the custom popup message --- */}
            {loginMessage && (
                <div className={`auth-popup ${loginMessage.includes('successful') ? 'success' : 'error'}`}>
                    {loginMessage}
                </div>
            )}
            {/* --- End NEW --- */}

            <form onSubmit={handleLogin}>
                <div className="form-group">
                    <label htmlFor="adminUsername" className="form-label">Username:</label>
                    <input
                        type="text"
                        id="adminUsername"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="form-input"
                        placeholder="Admin username"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="adminPassword" className="form-label">Password:</label>
                    <input
                        type="password"
                        id="adminPassword"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="form-input"
                        placeholder="Admin password"
                    />
                </div>
                <button type="submit" className="form-button">Login</button>
                <div className="toggle-link-container">
                    <Link to="/login/student" className="toggle-link">Student Login/Signup</Link>
                </div>
            </form>
        </div>
    );
}

export default AdminLogin;