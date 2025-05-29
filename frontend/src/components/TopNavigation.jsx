// TopNavigation.jsx
import React from 'react';
import './DashboardStyles.css';

function TopNavigation({ onLogout, onShowFavorites }) {
    return (
        <nav className="top-navigation">
            <div className="logo">Study Portal</div>
            <div className="nav-links">
                <span onClick={onShowFavorites} style={{ cursor: 'pointer' }}>Favorites</span>
                <span>Profile</span>
                <span onClick={onLogout} style={{ cursor: 'pointer' }}>Logout</span>
            </div>
        </nav>
    );
}

export default TopNavigation;
