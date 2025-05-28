import React from 'react';
import './DashboardStyles.css'; // Make sure to import the CSS

function Sidebar() {
  return (
    <div className="sidebar">
      <h3>Navigation</h3>
      <div>
        <strong>Course:</strong> [Current Course] <button>Change</button>
      </div>
      <div>
        <strong>Year:</strong> [Current Year] <button>Change</button>
      </div>
      <div>
        <strong>Semester:</strong> [Current Semester] <button>Change</button>
      </div>
      <div>
        <strong>Subject:</strong> [Current Subject]
      </div>
      <hr />
      <h4>Courses</h4>
      <ul>
        <li>[Course 1]</li>
        <li>[Course 2]</li>
        {/* ... more courses will be listed here */}
      </ul>
      {/* We'll add more interactive elements and dynamic data later */}
    </div>
  );
}

export default Sidebar;