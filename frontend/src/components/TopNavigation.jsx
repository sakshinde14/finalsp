// TopNavigation.jsx
import React from 'react';
import './DashboardStyles.css'; // Assuming your top-navigation styles are here

function TopNavigation({ onLogout }) { // <--- NEW PROP: Receive onLogout
    return (
        <nav className="top-navigation">
            <div className="logo">Study Portal</div>
            <div className="nav-links">
                {/* <Link to="/profile">Profile</Link>  */}
                {/* If you have a profile page, you'd use Link */}
                <span>Profile</span> {/* Assuming this is just text for now */}
                
                {/* Add onClick handler to the Logout element */}
                <span onClick={onLogout} style={{ cursor: 'pointer' }}>Logout</span> {/* <--- NEW ONCLICK */}
            </div>
        </nav>
    );
}

export default TopNavigation;