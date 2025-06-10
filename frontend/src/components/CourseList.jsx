// CourseList.jsx
import React, { useState, useEffect } from 'react';
import './CourseListStyles.css'; // This CSS file will contain the styles for the new look

function CourseList({ onCourseSelect }) {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                // Fetch the list of courses with their display details
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
    }, []); // Empty dependency array means this runs once on component mount

    if (loading) {
        return <div className="course-list-message">Loading courses...</div>;
    }

    if (error) {
        return <div className="course-list-message course-list-error">Error loading courses: {error}</div>;
    }

    return (
        // The main container structure from your provided HTML snippet
        <section className="courses-overview container">
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Available Courses</h2>
                    <p className="card-subtitle">Explore our diverse computer science programs.</p> {/* Generic subtitle or fetch from backend */}
                </div>

                <div className="grid grid-2">
                    {/* Map over the fetched courses to render each one with the desired look */}
                    {courses.map((course) => (
                        <div key={course.code} className="course-overview"
                            onClick={() => onCourseSelect(course)} // Keep your existing click handler 
                        >
                            {/* Dynamically display course title and code */}
                            <h3>{course.title} ({course.code})</h3>
                            {/* Dynamically display course description */}
                            <p>{course.description}</p>
                            <div className="course-details">
                                {/* Dynamically display course duration (e.g., "3 Years") */}
                                <span className="tag tag-format">{course.duration}</span>
                                {/* Dynamically display number of semesters (e.g., "6 Semesters") */}
                                <span className="tag tag-category">{course.semesters}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default CourseList;