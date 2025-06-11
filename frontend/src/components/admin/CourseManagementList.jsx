// frontend/src/components/admin/CourseManagementList.jsx
import React, { useState, useEffect } from 'react';
import { getAuthToken } from '../../utils/auth'; // Assuming you have a utility to get the token
import './CourseManagementList.css'; // Create this CSS file for styling

function CourseManagementList({ onEdit }) {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');

    // CourseManagementList.jsx (or similar)
const fetchCourses = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/admin/courses', {
            method: 'GET', // Or POST, PUT, DELETE as needed
            headers: {
                'Content-Type': 'application/json',
                // You don't usually set 'Cookie' header manually, browser handles it
            },
            credentials: 'include', // <--- THIS IS CRUCIAL
        });

        if (!response.ok) {
            // Check for specific status codes
            if (response.status === 401) {
                throw new Error('Unauthorized'); // Custom error for 401
            }
            if (response.status === 403) {
                throw new Error('Forbidden'); // Custom error for 403
            }
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch courses');
        }

        const data = await response.json();
        // Set your courses state here
        setCourses(data); // Assuming you have a state for courses
        setLoading(false); // Assuming you have a loading state

    } catch (error) {
        console.error("Error fetching admin courses:", error);
        setError(error.message); // Set error state if you have one
        setLoading(false);
    }
};

// Make sure this is called, e.g., in a useEffect
useEffect(() => {
    fetchCourses();
}, []);

    const handleDelete = async (courseCode) => {
        if (!window.confirm(`Are you sure you want to delete course ${courseCode}? This action is irreversible.`)) {
            return;
        }

        const token = getAuthToken();
        try {
            const response = await fetch(`http://localhost:5000/api/admin/courses/${courseCode}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            setMessage('Course deleted successfully!');
            fetchCourses(); // Re-fetch the list to show updated data
            setTimeout(() => setMessage(''), 3000);
        } catch (e) {
            console.error("Error deleting course:", e);
            setError(`Failed to delete course: ${e.message}`);
            setTimeout(() => setError(''), 5000);
        }
    };

    if (loading) {
        return <div className="loading-message">Loading courses...</div>;
    }

    if (error) {
        return <div className="error-message">Error: {error}</div>;
    }

    return (
        <div className="admin-course-list-container">
            <h2>Manage Courses</h2>
            {message && <div className="success-message">{message}</div>}
            {courses.length === 0 ? (
                <p>No courses found. Add a new course using the "Manage Courses" button.</p>
            ) : (
                <div className="course-cards-grid">
                    {courses.map((course) => (
                        <div key={course.code} className="admin-course-card">
                            <h3>{course.title} ({course.code})</h3>
                            <p className="course-description">{course.description}</p>
                            <div className="admin-course-actions">
                                <button onClick={() => onEdit(course)} className="admin-button edit-button">Edit</button>
                                <button onClick={() => handleDelete(course.code)} className="admin-button delete-button">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default CourseManagementList;