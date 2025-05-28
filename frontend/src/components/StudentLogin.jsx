// StudentLogin.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AuthStyles.css';

function StudentLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // Removed 'error' state, replaced by 'loginMessage' for unified handling
    const [loginMessage, setLoginMessage] = useState(''); // Unified state for success/error messages
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginMessage(''); // Clear any previous message before new login attempt

        try {
            const response = await fetch('http://localhost:5000/api/auth/login/student', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setLoginMessage("Login successful!"); // Set success message for popup
                console.log("Login successful:", data.message);
                localStorage.setItem('authToken', 'someGeneratedToken'); // Example: Store a token
                localStorage.setItem('userRole', 'student');

                // Delay redirection to show the message
                setTimeout(() => {
                    setLoginMessage(''); // Clear message after delay
                    navigate('/dashboard'); // Redirect to dashboard
                }, 2000); // Display message for 2 seconds
            } else {
                setLoginMessage(`Login failed: ${data.message || 'Invalid credentials'}`); // Set error message for popup
                console.error("Login failed:", data.message);
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
            <h2 className="auth-title">Student Login</h2>

            {/* --- NEW: Conditional rendering for the custom popup message --- */}
            {loginMessage && (
                <div className={`auth-popup ${loginMessage.includes('successful') ? 'success' : 'error'}`}>
                    {loginMessage}
                </div>
            )}
            {/* --- End NEW --- */}

            <form onSubmit={handleLogin}>
                <div className="form-group">
                    <label htmlFor="loginEmail" className="form-label">Email Address:</label>
                    <input
                        type="email"
                        id="loginEmail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="form-input"
                        placeholder="your.email@example.com"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="loginPassword" className="form-label">Password:</label>
                    <input
                        type="password"
                        id="loginPassword"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="form-input"
                        placeholder="Your password"
                    />
                </div>
                <button type="submit" className="form-button">Login</button>
            </form>
            <div className="toggle-link-container">
                Don't have an account? <Link to="/signup/student" className="toggle-link">Sign Up</Link>
            </div>
            <div className="toggle-link-container">
                <Link to="/login/admin" className="toggle-link">Admin Login</Link>
            </div>
        </div>
    );
}

export default StudentLogin;