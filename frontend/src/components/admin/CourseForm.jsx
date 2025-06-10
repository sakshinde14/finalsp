// frontend/src/components/admin/CourseForm.jsx
import React, { useState, useEffect } from 'react';
import { getAuthToken } from '../../utils/auth'; // Assuming you have a utility to get the token
import './CourseForm.css'; // Create this CSS file for styling

function CourseForm({ courseToEdit, onSubmitSuccess, onCancel }) {
    const [courseData, setCourseData] = useState({
        code: '',
        title: '',
        description: '',
        years: [] // Array of { year: number, semesters: [] }
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (courseToEdit) {
            // Deep copy to prevent direct modification of prop
            setCourseData(JSON.parse(JSON.stringify(courseToEdit)));
        } else {
            setCourseData({ code: '', title: '', description: '', years: [] });
        }
    }, [courseToEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCourseData(prev => ({ ...prev, [name]: value }));
    };

    // --- Dynamic Year, Semester, Subject Management ---

    const addYear = () => {
        setCourseData(prev => ({
            ...prev,
            years: [...prev.years, { year: prev.years.length + 1, semesters: [] }]
        }));
    };

    const removeYear = (yearIndex) => {
        setCourseData(prev => ({
            ...prev,
            years: prev.years.filter((_, i) => i !== yearIndex)
                .map((y, idx) => ({ ...y, year: idx + 1 })) // Re-number years
        }));
    };

    const addSemester = (yearIndex) => {
        const newYears = [...courseData.years];
        const newSemesterNumber = newYears[yearIndex].semesters.length + 1;
        newYears[yearIndex].semesters.push({ semester: newSemesterNumber, subjects: [] });
        setCourseData(prev => ({ ...prev, years: newYears }));
    };

    const removeSemester = (yearIndex, semIndex) => {
        const newYears = [...courseData.years];
        newYears[yearIndex].semesters = newYears[yearIndex].semesters.filter((_, i) => i !== semIndex)
            .map((s, idx) => ({ ...s, semester: idx + 1 })); // Re-number semesters
        setCourseData(prev => ({ ...prev, years: newYears }));
    };

    const addSubject = (yearIndex, semIndex) => {
        const newYears = [...courseData.years];
        newYears[yearIndex].semesters[semIndex].subjects.push({ name: '', description: '', materials: [] });
        setCourseData(prev => ({ ...prev, years: newYears }));
    };

    const removeSubject = (yearIndex, semIndex, subIndex) => {
        const newYears = [...courseData.years];
        newYears[yearIndex].semesters[semIndex].subjects = newYears[yearIndex].semesters[semIndex].subjects.filter((_, i) => i !== subIndex);
        setCourseData(prev => ({ ...prev, years: newYears }));
    };

    const handleSubjectChange = (yearIndex, semIndex, subIndex, field, value) => {
        const newYears = [...courseData.years];
        newYears[yearIndex].semesters[semIndex].subjects[subIndex][field] = value;
        setCourseData(prev => ({ ...prev, years: newYears }));
    };

    // --- Submission Logic ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setMessage('');
        const token = getAuthToken();

        const url = courseToEdit
            ? `http://localhost:5000/api/admin/courses/${courseData.code}`
            : 'http://localhost:5000/api/admin/courses';
        const method = courseToEdit ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(courseData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            setMessage(`Course ${courseToEdit ? 'updated' : 'added'} successfully!`);
            onSubmitSuccess(message); // Pass message back to parent
        } catch (e) {
            console.error(`Error ${courseToEdit ? 'updating' : 'adding'} course:`, e);
            setError(e.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="course-form-container">
            <h2>{courseToEdit ? 'Edit Course' : 'Add New Course'}</h2>
            {error && <div className="error-message">{error}</div>}
            {message && <div className="success-message">{message}</div>}

            <div className="form-section">
                <label>Course Code:</label>
                <input
                    type="text"
                    name="code"
                    value={courseData.code}
                    onChange={handleChange}
                    disabled={!!courseToEdit} // Disable code editing for existing courses
                    required
                />
            </div>
            <div className="form-section">
                <label>Course Title:</label>
                <input
                    type="text"
                    name="title"
                    value={courseData.title}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="form-section">
                <label>Course Description:</label>
                <textarea
                    name="description"
                    value={courseData.description}
                    onChange={handleChange}
                    rows="4"
                    required
                ></textarea>
            </div>

            <div className="course-structure-section">
                <h3>Course Structure (Years, Semesters, Subjects)</h3>
                <button type="button" onClick={addYear} className="add-button">Add Year</button>

                {courseData.years.map((year, yearIndex) => (
                    <div key={yearIndex} className="year-block">
                        <h4>Year {year.year}
                            <button type="button" onClick={() => removeYear(yearIndex)} className="remove-button">Remove Year</button>
                        </h4>
                        <button type="button" onClick={() => addSemester(yearIndex)} className="add-button">Add Semester</button>
                        {year.semesters.map((sem, semIndex) => (
                            <div key={semIndex} className="semester-block">
                                <h5>Semester {sem.semester}
                                    <button type="button" onClick={() => removeSemester(yearIndex, semIndex)} className="remove-button">Remove Semester</button>
                                </h5>
                                <button type="button" onClick={() => addSubject(yearIndex, semIndex)} className="add-button">Add Subject</button>
                                {sem.subjects.map((sub, subIndex) => (
                                    <div key={subIndex} className="subject-block">
                                        <h6>Subject {subIndex + 1}
                                            <button type="button" onClick={() => removeSubject(yearIndex, semIndex, subIndex)} className="remove-button">Remove Subject</button>
                                        </h6>
                                        <div className="form-group">
                                            <label>Name:</label>
                                            <input
                                                type="text"
                                                value={sub.name}
                                                onChange={(e) => handleSubjectChange(yearIndex, semIndex, subIndex, 'name', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Description (Optional):</label>
                                            <textarea
                                                value={sub.description || ''} // Ensure it's not undefined
                                                onChange={(e) => handleSubjectChange(yearIndex, semIndex, subIndex, 'description', e.target.value)}
                                                rows="2"
                                            ></textarea>
                                        </div>
                                        {/* Material management could go here, potentially a separate component */}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <div className="form-actions">
                <button type="submit" disabled={isSubmitting} className="submit-button">
                    {isSubmitting ? 'Saving...' : (courseToEdit ? 'Update Course' : 'Add Course')}
                </button>
                <button type="button" onClick={onCancel} className="cancel-button">
                    Cancel
                </button>
            </div>
        </form>
    );
}

export default CourseForm;