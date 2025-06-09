// YearList.jsx
import React, { useState, useEffect } from 'react';
import './YearListStyles.css'; // Import the new styles

function YearList({ courseCode, onYearSelect }) {
    const [years, setYears] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Essential: Only attempt to fetch if we have a courseCode
        if (!courseCode) {
            setYears([]);
            setLoading(false);
            return;
        }

        const fetchYears = async () => {
            setLoading(true); // Indicate loading when fetch starts
            setError(null);   // Clear previous errors

            try {
                const response = await fetch(`http://localhost:5000/api/courses/${courseCode}/years`);
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error(`Data not found for Course: ${courseCode}. Please check your selections and database.`);
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setYears(data);
            } catch (e) {
                console.error("Error fetching years:", e);
                setError(e.message);
                setYears([]);
            } finally {
                setLoading(false);
            }
        };

        fetchYears();
    }, [courseCode]); // Fetch years when courseCode changes

    if (loading) {
        return <div className="year-list-message">Loading years...</div>;
    }

    if (error) {
        return <div className="year-list-message year-list-error">Error loading years: {error}</div>;
    }

    if (years.length === 0) {
        return <div className="no-data-message">No years found for this course.</div>;
    }

    return (
        <div className="year-list">
            <h2>Select Year</h2> {/* Heading for the year list */}
            {years.map((year) => (
                // Use a div with list-item-card class for consistent styling
                <div
                    key={year}
                    onClick={() => onYearSelect(year)}
                    className="list-item-card" // Apply the consistent list item card style
                >
                    Year {year}
                </div>
            ))}
        </div>
    );
}

export default YearList;