// frontend/src/components/SubjectList.jsx
import React, { useState, useEffect } from 'react';
import './SubjectListStyles.css'; // Import the new CSS file

// NEW: Added onSubjectSelect prop
function SubjectList({ courseCode, year, semester, onSubjectSelect, onReset }) {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSubjects = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`http://localhost:5000/api/courses/${courseCode}/years/${year}/semesters/${semester}/subjects`);
                if (!response.ok) {
                    // More specific error message for debugging
                    if (response.status === 404) {
                        throw new Error(`Subjects not found for ${courseCode} - Year ${year} - Semester ${semester}.`);
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setSubjects(data);
            } catch (e) {
                console.error("Error fetching subjects:", e);
                setError(e.message);
                setSubjects([]); // Clear subjects on error
            } finally {
                setLoading(false);
            }
        };

        // Only fetch if all required props are available
        if (courseCode && year && semester) {
            fetchSubjects();
        } else {
            // If props are missing, clear previous data and stop loading
            setSubjects([]);
            setLoading(false);
            setError(null); // No error if just waiting for props
        }
    }, [courseCode, year, semester]); // Dependencies for useEffect

    // Handler for when a subject is clicked
    const handleSubjectClick = (subjectName) => {
        if (onSubjectSelect) {
            onSubjectSelect(subjectName); // Call the prop function
        }
    };

    if (loading) return <div className="subject-list-message">Loading subjects...</div>;
    if (error) return <div className="subject-list-message subject-list-error">Error: {error}</div>;

    // Display a message if no subjects are found after loading
    if (subjects.length === 0 && !loading && !error) {
        return <div className="no-data-message">No subjects found for this semester.</div>;
    }

    return (
        <div className="subject-list-container"> {/* Updated class name */}
            <h3>Subjects for {courseCode} - Year {year} - Semester {semester}</h3>
            {/* Render subject items using list-item-card */}
            {subjects.map((subject, index) => (
                <div key={index} className="list-item-card" onClick={() => handleSubjectClick(subject)}>
                    {subject}
                </div>
            ))}
        </div>
    );
}

export default SubjectList;