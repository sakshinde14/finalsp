import React, { useState, useEffect } from 'react';

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
        return <div>Loading courses...</div>;
    }

    if (error) {
        return <div>Error loading courses: {error}</div>;
    }

    return (
        <div className="course-list">
            {courses.map((course) => (
                <button key={course.code} onClick={() => onCourseSelect(course)} className="course-button">
                    {course.title}
                </button>
            ))}
        </div>
    );
}

export default CourseList;