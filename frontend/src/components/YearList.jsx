// YearList.jsx
import React, { useState, useEffect } from 'react';

function YearList({ courseCode, onYearSelect }) {
    const [years, setYears] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchYears = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/courses/${courseCode}/years`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setYears(data);
                setLoading(false);
            } catch (e) {
                setError(e.message);
                setLoading(false);
            }
        };

        fetchYears();
    }, [courseCode]); // Fetch years when courseCode changes

    if (loading) {
        return <div>Loading years...</div>;
    }

    if (error) {
        return <div>Error loading years: {error}</div>;
    }

    return (
        <div className="year-list">
            <h2>Select Year</h2>
            {years.map((year) => (
                <button key={year} onClick={() => onYearSelect(year)} className="year-button">
                    Year {year}
                </button>
            ))}
        </div>
    );
}

export default YearList;