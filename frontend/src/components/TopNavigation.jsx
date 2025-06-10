// frontend/src/components/TopNavigation.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Assuming you use react-router-dom for navigation
import './TopNavigationStyles.css'; // Your existing CSS for top navigation


function TopNavigation({ onLogout }) {
    const [showProfileOptions, setShowProfileOptions] = useState(false);

    const handleProfileClick = () => {
        setShowProfileOptions(!showProfileOptions); // Toggle visibility
    };   

    return (
        <nav className="top-navigation">
            <div className="nav-left">
                <h2><Link to="/LandingPage">STUDY PORTAL</Link></h2>
            </div>
            <div className="nav-right">
                {/* Add the "My Notes" link here */}
                <Link to="/favs" className="nav-link">Favorites</Link>
                {/*
                    You might also want to add Favorites, but My Notes is a good start.
                    <span className='nav-link favorites'>Favorites</span>
                */}
                <div className="nav-profile-dropdown">
                    <span className="nav-link profile-toggle" onClick={handleProfileClick}>
                        Profile {/* This is the clickable element */}
                    </span>
                    {/* You can put profile options here if you want a dropdown */}
                    {/* {showProfileOptions && (
                        <div className="profile-dropdown-content">
                            <Link to="/profile">View Profile</Link>
                            <Link to="/settings">Settings</Link>
                        </div>
                    )} */}
                </div>
                <span className="nav-link logout-link" onClick={onLogout}>Logout</span>
            </div>
        </nav>
    );
}

export default TopNavigation;