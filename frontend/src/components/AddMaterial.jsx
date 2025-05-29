// frontend/src/components/AddMaterial.jsx

import React, { useState, useEffect } from 'react';

import './AddMaterialStyles.css'; // We will create this CSS file next

function AddMaterial({ onMaterialAdded, onCancelAdd, selectedContext }) {
    // NEW STATE: For the title of the material
    const [title, setTitle] = useState('');

    const [materialFormat, setMaterialFormat] = useState('');
    const [materialCategory, setMaterialCategory] = useState('');
    const [contentUrl, setContentUrl] = useState('');
    const [textContent, setTextContent] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'

    // Destructure selectedContext for pre-populating fields
    const { courseCode, year, semester, subject } = selectedContext || {};

    // Effect to clear message after some time
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage('');
                setMessageType('');
            }, 3000); // Message disappears after 3 seconds
            return () => clearTimeout(timer);
        }
    }, [message]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(''); // Clear previous messages

        // Validate title
        if (!title.trim()) {
            setMessage('Please enter a title for the material.');
            setMessageType('error');
            return;
        }

        if (!materialFormat) {
            setMessage('Please select a material type.');
            setMessageType('error');
            return;
        }

        if (!materialCategory) { // NEW: Validate category as well
            setMessage('Please select a material category.');
            setMessageType('error');
            return;
        }


        const materialData = {
            title: title.trim(), // Include title in materialData
            courseCode: courseCode,
            year: year,
            semester: semester,
            subject: subject,
            materialFormat: materialFormat,
            materialCategory: materialCategory
        };


        if (materialFormat === 'Text') {
            if (!textContent.trim()) {
                setMessage('Text content cannot be empty for Text material.');
                setMessageType('error');
                return;
            }
            materialData.textContent = textContent.trim();
        } else { // PDF, Video, Link
            if (!contentUrl.trim()) {
                setMessage('Content URL cannot be empty for ' + materialFormat + ' material.');
                setMessageType('error');
                return;
            }
            // Basic URL validation (can be more robust)
            try {
                new URL(contentUrl.trim());
            } catch (error) {
                setMessage('Please enter a valid URL.');
                setMessageType('error');
                return;
            }
            materialData.contentUrl = contentUrl.trim();
        }

        try {
            const response = await fetch('http://localhost:5000/api/admin/materials/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(materialData),
                credentials: 'include'
            });

            if (response.ok) {
                setMessage('Material added successfully!');
                setMessageType('success');
                // Clear form fields
                setTitle(''); // Clear title after submission
                setMaterialFormat('');
                setMaterialCategory('');
                setContentUrl('');
                setTextContent('');
                if (onMaterialAdded) {
                    onMaterialAdded(); // Notify parent component (AdminDashboardLayout)
                }
            } else {
                const errorData = await response.json();
                setMessage(`Error: ${errorData.message || 'Failed to add material.'}`);
                setMessageType('error');
            }

        } catch (error) {
            console.error('Network or server error:', error);
            setMessage('Network error. Could not connect to server.');
            setMessageType('error');
        }
    };

    return (
        <div className="add-material-container">
            <h2>Add New Material</h2>
            <p className="context-info">For: <strong>{courseCode}</strong> - Year <strong>{year}</strong> - Semester <strong>{semester}</strong> - Subject: <strong>{subject}</strong></p>

            {message && <div className={`message ${messageType}`}>{message}</div>}

            <form onSubmit={handleSubmit} className="add-material-form">
                {/* NEW: Title input field */}
                <div className="form-group">
                    <label htmlFor="title">Material Title:</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., C++ Programming Notes"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="materialFormat">Material Type:</label>
                    <select
                        id="materialFormat"
                        value={materialFormat}
                        onChange={(e) => {
                            setMaterialFormat(e.target.value);
                            setContentUrl(''); // Clear URL/Text when type changes
                            setTextContent('');
                        }}
                        required
                    >
                        <option value="">Select Type</option>
                        <option value="PDF">PDF Document</option>
                        <option value="Video">Video Link</option>
                        <option value="Link">External Link</option>
                        <option value="Text">Text Content</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="materialCategory">Material Category:</label>
                    <select
                        id="materialCategory"
                        value={materialCategory}
                        onChange={(e) => {
                            setMaterialCategory(e.target.value);
                        }}
                        required
                    >
                        <option value="">Select Category</option>
                        <option value="syllabus">Syllabus</option>
                        <option value="notes">Notes</option>
                        <option value="paper">Papers</option>
                    </select>
                </div>

                {materialFormat && materialFormat !== 'Text' && (
                    <div className="form-group">
                        <label htmlFor="contentUrl">Content URL:</label>
                        <input
                            type="url"
                            id="contentUrl"
                            value={contentUrl}
                            onChange={(e) => setContentUrl(e.target.value)}
                            placeholder="e.g., https://example.com/document.pdf"
                            required={materialFormat !== 'Text'}
                        />
                    </div>
                )}

                {materialFormat === 'Text' && (
                    <div className="form-group">
                        <label htmlFor="textContent">Text Content:</label>
                        <textarea
                            id="textContent"
                            value={textContent}
                            onChange={(e) => setTextContent(e.target.value)}
                            placeholder="Enter your text notes or content here..."
                            rows="8"
                            required={materialFormat === 'Text'}
                        ></textarea>
                    </div>
                )}

                <div className="form-actions">
                    <button type="submit" className="submit-button">Add Material</button>
                    <button type="button" onClick={onCancelAdd} className="cancel-button">Cancel</button>
                </div>
            </form>
        </div>
    );
}

export default AddMaterial;