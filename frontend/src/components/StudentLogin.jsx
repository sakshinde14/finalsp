// StudentLogin.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AuthStyles.css';

function StudentLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginMessage, setLoginMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginMessage('');

        try {
            const response = await fetch('http://localhost:5000/api/auth/login/student', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setLoginMessage("Login successful!");
                localStorage.setItem('authToken', 'dummyStudentToken');
                localStorage.setItem('userRole', 'student');

                setTimeout(() => {
                    setLoginMessage('');
                    navigate('/dashboard');
                }, 2000);
            } else {
                setLoginMessage(`Login failed: ${data.message || 'Invalid credentials'}`);
                setTimeout(() => setLoginMessage(''), 3000);
            }
        } catch (error) {
            setLoginMessage('Failed to connect to the server.');
            setTimeout(() => setLoginMessage(''), 3000);
        }
    };

    return (
        <div className="auth-page-wrapper">
            <a href="/" className="back-link">← Back to Home</a>
            <div className="auth-container">
                <h2 className="auth-title">Student Login</h2>
                {loginMessage && (
                    <div className={`auth-popup ${loginMessage.includes('successful') ? 'success' : 'error'}`}>
                        {loginMessage}
                    </div>
                )}
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="loginEmail" className="form-label">Email Address:</label>
                        <input type="email" id="loginEmail" value={email} onChange={(e) => setEmail(e.target.value)} required className="form-input" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="loginPassword" className="form-label">Password:</label>
                        <input type="password" id="loginPassword" value={password} onChange={(e) => setPassword(e.target.value)} required className="form-input" />
                    </div>
                    <button type="submit" className="form-button">Login</button>
                </form>
                <div className="toggle-link-container">
                    Don’t have an account? <Link to="/signup/student" className="toggle-link">Sign Up</Link>
                </div>
                <div className="toggle-link-container">
                    <Link to="/login/admin" className="toggle-link">Admin Login</Link>
                </div>
            </div>
        </div>
    );
}

export default StudentLogin;
