import React, { useState, useEffect } from 'react';
import './CourseListStyles.css'; // Import the new styles

function CourseList({ onCourseSelect }) {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/courses');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setCourses(data);
                setLoading(false);
            } catch (e) {
                setError(e.message);
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    if (loading) {
        return <div className="course-list-message">Loading courses...</div>;
    }

    if (error) {
        return <div className="course-list-message course-list-error">Error loading courses: {error}</div>;
    }

    return (
        <div className="course-list">
            {courses.map((course) => (
                // Use a div with list-item-card class for consistent styling
                <div key={course.code} onClick={() => onCourseSelect(course)} className="list-item-card">
                    {course.title}
                </div>
            ))}
        </div>
    );
}

export default CourseList;