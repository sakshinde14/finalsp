import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './TopNavigationStyles.css';
import ProfileManagement from './ProfileManagement';

function TopNavigation({ onLogout }) {
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [showProfileForm, setShowProfileForm] = useState(false);
    const [selectedProfileAction, setSelectedProfileAction] = useState('');

    const handleProfileClick = () => {
        setShowProfileDropdown(!showProfileDropdown);
        setShowProfileForm(false);
    };

    const handleProfileActionSelect = (action) => {
        setSelectedProfileAction(action);
        setShowProfileForm(true);
        setShowProfileDropdown(false);
    };

    const handleCloseProfileForm = () => {
        setShowProfileForm(false);
        setSelectedProfileAction('');
    };

    return (
        <nav className="top-navigation">
            <div className="nav-left">
                <h2><Link to="/LandingPage">STUDY PORTAL</Link></h2>
            </div>

            <div className="nav-right">
                <Link to="/favs" className="nav-link">Favorites</Link>
                <div className="nav-profile-dropdown">
                    <span className="nav-link profile-toggle" onClick={handleProfileClick}>
                        Profile
                    </span>
                    {showProfileDropdown && (
                        <div className="profile-dropdown-content">
                            <a href="#" onClick={() => handleProfileActionSelect('password')}>
                                Change Password
                            </a>
                            <a href="#" onClick={() => handleProfileActionSelect('username-email')}>
                                Change Username/Email
                            </a>
                        </div>
                    )}
                </div>
                <span className="nav-link logout-link" onClick={onLogout}>Logout</span>
            </div>
            
            {showProfileForm && (
                <ProfileManagement 
                    onClose={handleCloseProfileForm}
                    selectedAction={selectedProfileAction}
                />
            )}
        </nav>
    );
}

export default TopNavigation;