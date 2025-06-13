
// frontend/src/components/ProfileManagement.jsx
import React, { useState, useEffect } from 'react';
import './ProfileManagementStyles.css';

function ProfileManagement({ onClose }) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [userRole, setUserRole] = useState('');
    const [currentUser, setCurrentUser] = useState({});

    // Fetch initial user data
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/profile', {
                    credentials: 'include'
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
                } else {
                    setMessage('Failed to fetch user data.');
                    setMessageType('error');
                }
            } catch (error) {
                setMessage('Network error fetching user data.');
                setMessageType('error');
            }
        };
        fetchUserData();
    }, []);

    // Effect to clear messages
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage('');
                setMessageType('');
            }, 3000);
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

            if (response.ok) {
                setMessage('Password changed successfully!');
                setMessageType('success');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
            } else {
                const errorData = await response.json();
                setMessage(errorData.message || 'Failed to change password.');
                setMessageType('error');
            }
        } catch (error) {
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

                if (response.ok) {
                    setMessage('Username updated successfully!');
                    setMessageType('success');
                } else {
                    const errorData = await response.json();
                    setMessage(errorData.message || 'Failed to update username.');
                    setMessageType('error');
                }
            } catch (error) {
                setMessage('Network error. Could not update username.');
                setMessageType('error');
            }
        } else if (userRole === 'student') {
            if (!newEmail.trim()) {
                setMessage('Email cannot be empty.');
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

                if (response.ok) {
                    setMessage('Email updated successfully!');
                    setMessageType('success');
                } else {
                    const errorData = await response.json();
                    setMessage(errorData.message || 'Failed to update email.');
                    setMessageType('error');
                }
            } catch (error) {
                setMessage('Network error. Could not update email.');
                setMessageType('error');
            }
        }
    };

    return (
        <div className="profile-management-container">
            <button className="close-button" onClick={onClose}>&times;</button>
            <h3>Manage Profile</h3>

            {message && <div className={`profile-message ${messageType}`}>{message}</div>}

            <div className="profile-section">
                <h4>
                    {userRole === 'admin' ? 'Change Username' : 'Change Email'}
                </h4>
                <form onSubmit={handleChangeUsernameOrEmail}>
                    <div className="form-group">
                        <label htmlFor={userRole === 'admin' ? 'newUsername' : 'newEmail'}>
                            {userRole === 'admin' ? 'New Username:' : 'New Email:'}
                        </label>
                        <input
                            type={userRole === 'admin' ? 'text' : 'email'}
                            id={userRole === 'admin' ? 'newUsername' : 'newEmail'}
                            value={userRole === 'admin' ? newUsername : newEmail}
                            onChange={(e) => userRole === 'admin' 
                                ? setNewUsername(e.target.value) 
                                : setNewEmail(e.target.value)
                            }
                            placeholder={userRole === 'admin' 
                                ? 'Enter new username' 
                                : 'Enter new email address'
                            }
                            required
                        />
                    </div>
                    <button type="submit" className="profile-submit-button">
                        {userRole === 'admin' ? 'Update Username' : 'Update Email'}
                    </button>
                </form>
            </div>

            <div className="profile-section">
                <h4>Change Password</h4>
                <form onSubmit={handleChangePassword}>
                    <div className="form-group">
                        <label htmlFor="currentPassword">Current Password:</label>
                        <input
                            type="password"
                            id="currentPassword"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="newPassword">New Password:</label>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmNewPassword">Confirm New Password:</label>
                        <input
                            type="password"
                            id="confirmNewPassword"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="profile-submit-button">Change Password</button>
                </form>
            </div>
        </div>
    );
}

export default ProfileManagement;
