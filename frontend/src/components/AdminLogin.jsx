// AdminLogin.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AuthStyles.css';

function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginMessage, setLoginMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginMessage('');

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
                setLoginMessage("Admin login successful!");
                localStorage.setItem('adminAuthToken', data.token || 'dummyAdminToken');
                localStorage.setItem('userRole', 'admin');

                setTimeout(() => {
                    setLoginMessage('');
                    navigate('/admin/dashboard');
                }, 2000);
            } else {
                setLoginMessage(`Login failed: ${data.message || 'Invalid admin credentials'}`);
                setTimeout(() => setLoginMessage(''), 3000);
            }
        } catch (error) {
            setLoginMessage('Failed to connect to the server. Please try again later.');
            setTimeout(() => setLoginMessage(''), 3000);
        }
    };

    return (
        <div className="auth-page-wrapper">
            <a href="/" className="back-link">← Back to Home</a>
            <div className="auth-container">
                <h2 className="auth-title">Admin Login</h2>
                {loginMessage && (
                    <div className={`auth-popup ${loginMessage.includes('successful') ? 'success' : 'error'}`}>
                        {loginMessage}
                    </div>
                )}
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="adminUsername" className="form-label">Username:</label>
                        <input type="text" id="adminUsername" value={username} onChange={(e) => setUsername(e.target.value)} required className="form-input" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="adminPassword" className="form-label">Password:</label>
                        <input type="password" id="adminPassword" value={password} onChange={(e) => setPassword(e.target.value)} required className="form-input" />
                    </div>
                    <button type="submit" className="form-button">Login</button>
                    <div className="toggle-link-container">
                        <Link to="/login/student" className="toggle-link">Student Login/Signup</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AdminLogin;
