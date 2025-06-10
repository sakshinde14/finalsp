// CourseDetails.jsx
import React from 'react';
//import './CourseDetailsStyles.css'; // Create this CSS file

function CourseDetails({ course, onBack }) {
    if (!course) {
        return <div className="course-details-message">Select a course to see details.</div>;
    }

    return (
        <section className="course-details-section container">
            <div className="card">
                <button onClick={onBack} className="back-button">← Back to Courses</button>
                <div className="card-header">
                    <h2 className="card-title">{course.title} ({course.code})</h2>
                    {/* Assuming you add a description field to your MongoDB course documents */}
                    <p className="card-subtitle">{course.description || "Detailed overview of the program."}</p>
                </div>

                <div className="years-container">
                    {course.years && course.years.map((yearData) => (
                        <div key={yearData.year} className="year-card">
                            <h3>Year {yearData.year}</h3>
                            <div className="semesters-grid">
                                {yearData.semesters && yearData.semesters.map((semesterData) => (
                                    <div key={semesterData.semester} className="semester-card">
                                        <h4>Semester {semesterData.semester}</h4>
                                        <ul className="subject-list">
                                            {semesterData.subjects && semesterData.subjects.map((subject, index) => (
                                                <li key={index}>{subject}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default CourseDetails;