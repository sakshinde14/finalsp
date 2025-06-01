// frontend/src/components/EditMaterialForm.jsx
import React, { useState, useEffect } from 'react';
import './EditMaterialFormStyles.css'; // Add your styles here

function EditMaterialForm({ material, onUpdate, onCancel }) {
    const [formData, setFormData] = useState({
        title: material.title || '',
        materialFormat: material.materialFormat || '',
        materialCategory: material.materialCategory || '',
        contentUrl: material.contentUrl || '',
        // Removed textContent as per alignment with AddMaterial.jsx and current backend structure
        courseCode: material.courseCode || '',
        year: material.year || '',
        semester: material.semester || '',
        subject: material.subject || '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Update form data if the 'material' prop changes (e.g., when editing a different material)
        setFormData({
            title: material.title || '',
            materialFormat: material.materialFormat || '',
            materialCategory: material.materialCategory || '',
            contentUrl: material.contentUrl || '',
            // Removed textContent to align with AddMaterial.jsx and backend capabilities
            courseCode: material.courseCode || '',
            year: material.year || '',
            semester: material.semester || '',
            subject: material.subject || '',
        });
        setError(null);
        setMessage('');
    }, [material]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage('');

        // Basic validation
        if (!formData.title || !formData.materialFormat || !formData.materialCategory) {
            setError('Title, Material Format, and Category are required.');
            setLoading(false);
            return;
        }

        // Conditional validation for content based on format
        // 'Text' format and its contentUrl validation has been removed
        if (['PDF', 'Image', 'Document', 'Video', 'Link'].includes(formData.materialFormat) && !formData.contentUrl) {
            setError('Content URL is required for the selected format (or a file was expected for uploaded types).');
            setLoading(false);
            return;
        }

        try {
            const payload = { ...formData };
            // Ensure year and semester are numbers if they are to be updated
            payload.year = parseInt(payload.year, 10);
            payload.semester = parseInt(payload.semester, 10);

            // Remove fileName and textContent from payload if they exist,
            // as this PUT endpoint handles metadata and contentUrl, not file re-uploads or text content updates directly.
            if ('fileName' in payload) {
                delete payload.fileName;
            }
            if ('textContent' in payload) {
                delete payload.textContent;
            }

            const response = await fetch(`http://localhost:5000/api/admin/materials/${material._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            setMessage(result.message || 'Material updated successfully!');
            setTimeout(() => setMessage(''), 3000); // Clear after 3 seconds
            onUpdate(payload); // Notify parent of successful update
        } catch (e) {
            console.error("Error updating material:", e);
            setError(`Failed to update material: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="edit-material-form-container">
            <h3>Edit Material: {material.title || material.subject}</h3>
            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Title:</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label>Material Format:</label>
                    {/* Updated options to match AddMaterial.jsx's formats */}
                    <select name="materialFormat" value={formData.materialFormat} onChange={handleChange} required>
                        <option value="">Select Format</option>
                        <option value="PDF">PDF</option>
                        <option value="Image">Image</option>
                        <option value="Document">Document</option>
                        <option value="Video">Video</option>
                        <option value="Link">External Link</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Material Category:</label>
                    <select name="materialCategory" value={formData.materialCategory} onChange={handleChange} required>
                        <option value="">Select Category</option>
                        <option value="syllabus">Syllabus</option>
                        <option value="notes">Notes</option>
                        <option value="paper">Previous Year Paper</option>
                    </select>
                </div>

                {/* Content URL field is now displayed for all non-text, non-file-upload formats */}
                {(['PDF', 'Image', 'Document', 'Video', 'Link'].includes(formData.materialFormat)) && (
                    <div className="form-group">
                        <label>Content URL:</label>
                        <input type="url" name="contentUrl" value={formData.contentUrl} onChange={handleChange} />
                        <small className="form-hint">For uploaded files (PDF, Image, Document), this is the current file path. For Video/External Link, this is the URL.</small>
                    </div>
                )}

                {/* Display current context as read-only */}
                <div className="form-group">
                    <label>Course Code:</label>
                    <input type="text" value={formData.courseCode} readOnly className="read-only" />
                </div>
                <div className="form-group">
                    <label>Year:</label>
                    <input type="text" value={formData.year} readOnly className="read-only" />
                </div>
                <div className="form-group">
                    <label>Semester:</label>
                    <input type="text" value={formData.semester} readOnly className="read-only" />
                </div>
                <div className="form-group">
                    <label>Subject:</label>
                    <input type="text" value={formData.subject} readOnly className="read-only" />
                </div>

                <div className="form-actions">
                    <button type="submit" disabled={loading} className="submit-button">
                        {loading ? 'Updating...' : 'Update Material'}
                    </button>
                    <button type="button" onClick={onCancel} className="cancel-button">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditMaterialForm;