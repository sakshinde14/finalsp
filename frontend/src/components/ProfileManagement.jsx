
// frontend/src/components/ProfileManagement.jsx
import React, { useState, useEffect } from 'react';
import './ProfileManagementStyles.css';

function ProfileManagement({ onClose, selectedAction }) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [userRole, setUserRole] = useState('');
    const [currentUser, setCurrentUser] = useState({});
    const [loading, setLoading] = useState(true);

    // Fetch initial user data
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:5000/api/profile', {
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setUserRole(data.role);
                    setCurrentUser(data);
                    if (data.role === 'admin') {
                        setNewUsername(data.username || '');
                    } else if (data.role === 'student') {
                        setNewEmail(data.email || '');
                    }
                } else if (response.status === 401) {
                    setMessage('Session expired. Please log in again.');
                    setMessageType('error');
                } else {
                    setMessage('Failed to fetch user data. Please try again.');
                    setMessageType('error');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                setMessage('Network error. Please check your connection.');
                setMessageType('error');
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, []);

    // Clear messages after 5 seconds
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage('');
                setMessageType('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setMessage('');
        setMessageType('');

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            setMessage('All password fields are required.');
            setMessageType('error');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            setMessage('New password and confirmation do not match.');
            setMessageType('error');
            return;
        }
        if (newPassword.length < 6) {
            setMessage('New password must be at least 6 characters long.');
            setMessageType('error');
            return;
        }

        const endpoint = userRole === 'admin' 
            ? 'http://localhost:5000/api/admin/change-password'
            : 'http://localhost:5000/api/student/change-password';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Password changed successfully!');
                setMessageType('success');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
            } else {
                setMessage(data.message || 'Failed to change password.');
                setMessageType('error');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            setMessage('Network error. Could not change password.');
            setMessageType('error');
        }
    };

    const handleChangeUsernameOrEmail = async (e) => {
        e.preventDefault();
        setMessage('');
        setMessageType('');

        if (userRole === 'admin') {
            if (!newUsername.trim()) {
                setMessage('Username cannot be empty.');
                setMessageType('error');
                return;
            }

            try {
                const response = await fetch('http://localhost:5000/api/admin/change-username', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ newUsername: newUsername.trim() }),
                    credentials: 'include'
                });

                const data = await response.json();

                if (response.ok) {
                    setMessage('Username updated successfully!');
                    setMessageType('success');
                } else {
                    setMessage(data.message || 'Failed to update username.');
                    setMessageType('error');
                }
            } catch (error) {
                console.error('Error updating username:', error);
                setMessage('Network error. Could not update username.');
                setMessageType('error');
            }
        } else if (userRole === 'student') {
            if (!newEmail.trim()) {
                setMessage('Email cannot be empty.');
                setMessageType('error');
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(newEmail.trim())) {
                setMessage('Please enter a valid email address.');
                setMessageType('error');
                return;
            }

            try {
                const response = await fetch('http://localhost:5000/api/student/change-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ newEmail: newEmail.trim() }),
                    credentials: 'include'
                });

                const data = await response.json();

                if (response.ok) {
                    setMessage('Email updated successfully!');
                    setMessageType('success');
                } else {
                    setMessage(data.message || 'Failed to update email.');
                    setMessageType('error');
                }
            } catch (error) {
                console.error('Error updating email:', error);
                setMessage('Network error. Could not update email.');
                setMessageType('error');
            }
        }
    };

    if (loading) {
        return (
            <div className="profile-management-modal">
                <div className="profile-management-container">
                    <button className="close-button" onClick={onClose}>&times;</button>
                    <div className="loading-container">
                        <p>Loading user data...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-management-modal">
            <div className="profile-management-container">
                <button className="close-button" onClick={onClose}>&times;</button>
                <h3>Profile Management</h3>

                {message && (
                    <div className={`profile-message ${messageType}`}>
                        {message}
                    </div>
                )}

                {selectedAction === 'password' && (
                    <div className="profile-form-section">
                        <h4>Change Password</h4>
                        <form onSubmit={handleChangePassword} className="profile-form">
                            <div className="form-group">
                                <label htmlFor="currentPassword">Current Password</label>
                                <input
                                    type="password"
                                    id="currentPassword"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Enter current password"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="newPassword">New Password</label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    minLength="6"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="confirmNewPassword">Confirm New Password</label>
                                <input
                                    type="password"
                                    id="confirmNewPassword"
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                    minLength="6"
                                    required
                                />
                            </div>
                            <button type="submit" className="profile-submit-button">
                                Change Password
                            </button>
                        </form>
                    </div>
                )}

                {selectedAction === 'username-email' && (
                    <div className="profile-form-section">
                        <h4>
                            {userRole === 'admin' ? 'Change Username' : 'Change Email'}
                        </h4>
                        <form onSubmit={handleChangeUsernameOrEmail} className="profile-form">
                            {userRole === 'admin' ? (
                                <div className="form-group">
                                    <label htmlFor="newUsername">New Username</label>
                                    <input
                                        type="text"
                                        id="newUsername"
                                        value={newUsername}
                                        onChange={(e) => setNewUsername(e.target.value)}
                                        placeholder="Enter new username"
                                        required
                                    />
                                    <small className="form-hint">Current: {currentUser.username}</small>
                                </div>
                            ) : (
                                <div className="form-group">
                                    <label htmlFor="newEmail">New Email</label>
                                    <input
                                        type="email"
                                        id="newEmail"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        placeholder="Enter new email address"
                                        required
                                    />
                                    <small className="form-hint">Current: {currentUser.email}</small>
                                </div>
                            )}
                            <button type="submit" className="profile-submit-button">
                                {userRole === 'admin' ? 'Update Username' : 'Update Email'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProfileManagement;
