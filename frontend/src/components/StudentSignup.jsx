import React, { useState } from 'react';
import './AuthStyles.css';
import { Link, useNavigate } from 'react-router-dom';

function StudentSignup() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    // Removed 'error' state, replaced by 'loginMessage' for unified handling
    // Unified state for success/error messages
    const [error, setError] = useState('');
    const [SigninMessage, setSigninMessage] = useState('')
    const navigate = useNavigate(); // For programmatic navigation

    const handleSignup = async (e) => {
        e.preventDefault();
        setSigninMessage(''); // Clear any previous message before new login attempt

    if (password !== confirmPassword) {
      setSigninMessage('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/signup/student', { // Updated URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fullName, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Signup successful
        setSigninMessage("Signin successful!"); // Set success message for popup
        console.log("Signin successful:", data.message);
        setTimeout(() => {
          setSigninMessage(''); // Clear message after delay
          navigate('/login/student'); // Redirect to login page
        }, 2000); //Display message for 2 seconds  
      } else {
        setSigninMessage(`Signin failed: ${data.message || 'Invalid credentials'}`); // Set error message for popup
        console.error("Signin failed:", data.message);
        setTimeout(() => {
          setSigninMessage(''); // Clear message after a longer delay
        }, 3000); // Show error message a bit longer
      }
    } catch (error) {
            setSigninMessage('Failed to connect to the server. Please try again later.'); // Network error message
            console.error('Signin error:', error);
            setTimeout(() => {
                setSigninMessage('');
            }, 3000);
        }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Student Sign Up</h2>
      {/* --- NEW: Display login message --- */}
            {SigninMessage && (
                <div className={`auth-popup ${SigninMessage.includes('successful') ? 'success' : 'error'}`}>
                    {SigninMessage}
                </div>
            )}
            {/* --- End NEW --- */}
      <form onSubmit={handleSignup}>
        <div className="form-group">
          <label htmlFor="signupFullName" className="form-label">Full Name:</label>
          <input
            type="text"
            id="signupFullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="form-input"
            placeholder="Your full name"
          />
        </div>
        <div className="form-group">
          <label htmlFor="signupEmail" className="form-label">Email Address:</label>
          <input
            type="email"
            id="signupEmail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-input"
            placeholder="your.email@example.com"
          />
        </div>
        <div className="form-group">
          <label htmlFor="signupPassword" className="form-label">Password:</label>
          <input
            type="password"
            id="signupPassword"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="form-input"
            placeholder="Choose a password"
          />
        </div>
        <div className="form-group">
          <label htmlFor="signupConfirmPassword" className="form-label">Confirm Password:</label>
          <input
            type="password"
            id="signupConfirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="form-input"
            placeholder="Confirm your password"
          />
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
  );
}

export default StudentSignup;