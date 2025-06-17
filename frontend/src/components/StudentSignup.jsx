import React, { useState } from 'react';
import './AuthStyles.css';
import { Link, useNavigate } from 'react-router-dom';

function StudentSignup() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [signinMessage, setSigninMessage] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setSigninMessage('');

        if (password !== confirmPassword) {
            setSigninMessage('Passwords do not match');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/auth/signup/student', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setSigninMessage("Signup successful!");
                setTimeout(() => {
                    setSigninMessage('');
                    navigate('/login/student');
                }, 2000);
            } else {
                setSigninMessage(`Signup failed: ${data.message || 'Invalid credentials'}`);
                setTimeout(() => setSigninMessage(''), 3000);
            }
        } catch (error) {
            setSigninMessage('Failed to connect to the server.');
            setTimeout(() => setSigninMessage(''), 3000);
        }
    };

    return (
        <div className="auth-page-wrapper">
            <a href="/" className="back-link">← Back to Home</a>
            <div className="auth-container">
                <h2 className="auth-title">Student Sign Up</h2>
                {signinMessage && (
                    <div className={`auth-popup ${signinMessage.includes('successful') ? 'success' : 'error'}`}>
                        {signinMessage}
                    </div>
                )}
                <form onSubmit={handleSignup}>
                    <div className="form-group">
                        <label htmlFor="signupFullName" className="form-label">Full Name:</label>
                        <input type="text" id="signupFullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="form-input" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="signupEmail" className="form-label">Email Address:</label>
                        <input type="email" id="signupEmail" value={email} onChange={(e) => setEmail(e.target.value)} required className="form-input" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="signupPassword" className="form-label">Password:</label>
                        <input type="password" id="signupPassword" value={password} onChange={(e) => setPassword(e.target.value)} required className="form-input" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="signupConfirmPassword" className="form-label">Confirm Password:</label>
                        <input type="password" id="signupConfirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="form-input" />
                    </div>
                    <button type="submit" className="form-button">Sign Up</button>
                </form>
                <div className="toggle-link-container">
                    Already have an account? <Link to="/login/student" className="toggle-link">Login</Link>
                </div>
                <div className="toggle-link-container">
                    <Link to="/login/admin" className="toggle-link">Admin Login</Link>
                </div>
            </div>
        </div>
    );
}

export default StudentSignup;
