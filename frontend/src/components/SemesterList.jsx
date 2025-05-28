// SemesterList.jsx
import React, { useState, useEffect } from 'react';

function SemesterList({ onSemesterSelect, courseCode, selectedYear }) {
    const [semesters, setSemesters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Essential: Only attempt to fetch if we have both a courseCode and a selectedYear
        if (!courseCode || !selectedYear) {
            setSemesters([]); // Clear any previous semesters
            setLoading(false);
            // Optionally, you might want to set an error or message here if it's expected
            // that courseCode and selectedYear should always be present when this component renders.
            return; // Exit early, no fetch needed yet
        }

        const fetchSemesters = async () => {
            setLoading(true); // Indicate loading when fetch starts
            setError(null);   // Clear previous errors

            try {
                // Construct the URL dynamically using the props
                const response = await fetch(`http://localhost:5000/api/courses/${courseCode}/years/${selectedYear}/semesters`);
                
                if (!response.ok) {
                    // Provide more specific error messages for debugging
                    if (response.status === 404) {
                        throw new Error(`Data not found for Course: ${courseCode}, Year: ${selectedYear}. Please check your selections and database.`);
                    }
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                setSemesters(data);
            } catch (e) {
                console.error("Error fetching semesters:", e); // Log the error for debugging
                setError(e.message);
                setSemesters([]); // Clear semesters on error
            } finally {
                setLoading(false); // Always set loading to false when fetch finishes
            }
        };

        fetchSemesters();
    }, [courseCode, selectedYear]); // Dependency array: re-run useEffect when these props change

    if (loading) {
        return <div className="loading-message">Loading semesters...</div>;
    }

    if (error) {
        return <div className="error-message">Error: {error}</div>;
    }

    // Display a message if no semesters are returned (e.g., if a year has no semesters)
    if (semesters.length === 0) {
        return <div className="no-data-message">No semesters found for the selected year.</div>;
    }

    return (
        <div className="semester-list">
            <h2>Select Semester</h2>
            {semesters.map((semester) => (
                <button 
                    key={semester} 
                    onClick={() => onSemesterSelect(semester)} 
                    className="semester-button"
                >
                    Semester {semester}
                </button>
            ))}
        </div>
    );
}

export default SemesterList;