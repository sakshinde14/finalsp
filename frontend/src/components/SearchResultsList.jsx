// SearchResultsList.jsx
import React from 'react';
import './SearchResultsListStyles.css'; // Import the new CSS file

function SearchResultsList({ results, onResultClick }) {
    if (!results || results.length === 0) {
        return <div className="no-results-message">No matching subjects found.</div>;
    }

    return (
        <div className="search-results-container">
            <h2>Search Results</h2>
            <div className="search-results-list"> {/* Changed from ul to div for grid */}
                {results.map((result, index) => (
                    // Use a div for each search result item for consistency with cards
                    <div key={index} className="search-result-item" onClick={() => onResultClick(result)}>
                        <div className="subject-name">📚 {result.subjectName}</div>
                        <div className="course-details">
                            🎓 {result.courseName} | 📅 Year {result.year}, Semester {result.semester}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default SearchResultsList;