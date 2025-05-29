// frontend/src/components/EditMaterialForm.jsx
import React, { useState, useEffect } from 'react';
import './EditMaterialFormStyles.css'; // Add your styles here

function EditMaterialForm({ material, onUpdate, onCancel }) {
    const [formData, setFormData] = useState({
        title: material.title || '',
        materialFormat: material.materialFormat || '',
        materialCategory: material.materialCategory || '',
        contentUrl: material.contentUrl || '',
        textContent: material.textContent || '',
        // Include context fields for display, but usually not editable in this form
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
            textContent: material.textContent || '',
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
        if (['PDF', 'Video', 'Link'].includes(formData.materialFormat) && !formData.contentUrl) {
            setError('Content URL is required for the selected format.');
            setLoading(false);
            return;
        }
        if (formData.materialFormat === 'Text' && !formData.textContent) {
            setError('Text Content is required for Text format.');
            setLoading(false);
            return;
        }

        try {
            const payload = { ...formData };
            // Ensure year and semester are numbers if they are to be updated
            payload.year = parseInt(payload.year, 10);
            payload.semester = parseInt(payload.semester, 10);

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
                    <select name="materialFormat" value={formData.materialFormat} onChange={handleChange} required>
                        <option value="">Select Format</option>
                        <option value="PDF">PDF</option>
                        <option value="Video">Video</option>
                        <option value="Link">Link</option>
                        <option value="Text">Text</option>
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

                {['PDF', 'Video', 'Link'].includes(formData.materialFormat) && (
                    <div className="form-group">
                        <label>Content URL:</label>
                        <input type="url" name="contentUrl" value={formData.contentUrl} onChange={handleChange} />
                    </div>
                )}

                {formData.materialFormat === 'Text' && (
                    <div className="form-group">
                        <label>Text Content:</label>
                        <textarea name="textContent" value={formData.textContent} onChange={handleChange} rows="5"></textarea>
                    </div>
                )}

                {/* Display current context, but make them non-editable or read-only */}
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