// src/components/WelcomeMessage.jsx (Corrected code)
import React from 'react';
import './DashboardStyles.css'; 

function WelcomeMessage({ message }) { // <--- Add 'message' as a prop
  return <h2 className="welcome-message">{message}</h2>; // <--- Use the 'message' prop here
}

export default WelcomeMessage;
