// SearchResultsList.jsx
import React from 'react';
import './SearchResultsListStyles.css'; // You'll create this CSS file

function SearchResultsList({ results, onResultClick }) {
    if (!results || results.length === 0) {
        return <div className="no-results-message">No matching subjects found.</div>;
    }

    return (
        <div className="search-results-container">
            <h2>Search Results</h2>
            <ul className="search-results-list">
                {results.map((result, index) => (
                    <li key={index} className="search-result-item" onClick={() => onResultClick(result)}>
                        <div className="subject-name">📚 {result.subjectName}</div>
                        <div className="course-details">
                            🎓 {result.courseName} | 📅 Year {result.year}, Semester {result.semester}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default SearchResultsList;