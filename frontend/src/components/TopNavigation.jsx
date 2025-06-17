import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './TopNavigationStyles.css';
import ProfileManagement from './ProfileManagement';

function TopNavigation({ isAuthenticated, role, username, onLogout }) {
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [selectedAction, setSelectedAction] = useState('');
    const [authStatus, setAuthStatus] = useState({ isAuthenticated, role, username });

    useEffect(() => {
        setAuthStatus({ isAuthenticated, role, username });
    }, [isAuthenticated, role, username]);

    const toggleProfileDropdown = () => {
        setShowProfileDropdown(!showProfileDropdown);
    };

    const handleProfileAction = (action) => {
        setSelectedAction(action);
        setShowProfileModal(true);
        setShowProfileDropdown(false);
    };

    const closeProfileModal = () => {
        setShowProfileModal(false);
        setSelectedAction('');
    };

    return (
        <nav className="top-navigation">
            <div className="nav-left">
                <h2><Link to="/LandingPage">STUDY PORTAL</Link></h2>
            </div>

            <div className="nav-right">
                <Link to="/favs" className="soft-button">⭐ Favorites</Link>
                <div className="nav-profile-dropdown">
                    <span className="soft-button profile-toggle" onClick={toggleProfileDropdown}>
                        👤 Profile
                    </span>
                    {showProfileDropdown && (
                        <div className="profile-dropdown-content">
                            <a href="#" onClick={() => handleProfileAction('password')}>
                                Change Password
                            </a>
                            <a href="#" onClick={() => handleProfileAction('username-email')}>
                                Change Username/Email
                            </a>
                        </div>
                    )}
                </div>
                <span className="soft-button logout-button" onClick={onLogout}>🚪 Logout</span>

            </div>

            {showProfileModal && (
                <ProfileManagement 
                    onClose={closeProfileModal}
                    selectedAction={selectedAction}
                />
            )}
        </nav>
    );
}

export default TopNavigation;