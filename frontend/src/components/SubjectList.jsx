// frontend/src/components/SubjectList.jsx
import React, { useState, useEffect } from 'react';
import './SubjectListStyles.css'; // Assuming you have this CSS file

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
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setSubjects(data);
            } catch (e) {
                console.error("Error fetching subjects:", e);
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };

        if (courseCode && year && semester) {
            fetchSubjects();
        }
    }, [courseCode, year, semester]);

    // Handler for when a subject is clicked
    const handleSubjectClick = (subjectName) => {
        if (onSubjectSelect) {
            onSubjectSelect(subjectName); // Call the prop function
        }
    };

    if (loading) return <div className="loading-message">Loading subjects...</div>;
    if (error) return <div className="error-message">Error: {error}</div>;
    if (subjects.length === 0) return <div className="no-data-message">No subjects found for this semester.</div>;

    return (
        <div className="list-container">
            <h3>Subjects for {courseCode} - Year {year} - Semester {semester}</h3>
            <ul className="item-list">
                {subjects.map((subject, index) => (
                    <li key={index} className="list-item" onClick={() => handleSubjectClick(subject)}>
                        {subject}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default SubjectList;