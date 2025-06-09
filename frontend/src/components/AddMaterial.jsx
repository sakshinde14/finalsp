// frontend/src/components/AddMaterial.jsx
import React, { useState, useEffect } from 'react';
import './AddMaterialStyles.css'; // We will create this CSS file next

function AddMaterial({ onMaterialAdded, onCancelAdd, selectedContext }) {
    const [title, setTitle] = useState('');
    const [materialFormat, setMaterialFormat] = useState('');
    const [materialCategory, setMaterialCategory] = useState('');
    const [contentUrl, setContentUrl] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const { courseCode, year, semester, subject } = selectedContext || {};

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => { setMessage(''); setMessageType('');}, 3000);
            return () => clearTimeout(timer); }
    }, [message]);

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setMessageType('');

        if (!title.trim()) {
            setMessage('Please enter a title for the material.');
            setMessageType('error');
            return; }

        if (!materialFormat) {
            setMessage('Please select a material type.');
            setMessageType('error');
            return; }

        if (!materialCategory) {
            setMessage('Please select a material category.');
            setMessageType('error');
            return; }

        let apiEndpoint;
        let fetchOptions = {
            method: 'POST',
            credentials: 'include', };

        const isFileUpload = ['PDF', 'Image', 'Document'].includes(materialFormat);

        if (isFileUpload) {
            if (!selectedFile) {
                setMessage(`Please select a ${materialFormat} file to upload.`);
                setMessageType('error');
                return; }

            apiEndpoint = 'http://localhost:5000/api/admin/materials/upload';
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('title', title.trim());
            formData.append('courseCode', courseCode);
            formData.append('year', year);
            formData.append('semester', semester);
            formData.append('subject', subject);
            formData.append('materialFormat', materialFormat);
            formData.append('materialCategory', materialCategory);

            fetchOptions.body = formData;
            for (let pair of formData.entries()) {
                console.log(pair[0]+ ': ' + pair[1]); }
            console.log('Sending FormData...');

        } else {
            if (!contentUrl.trim()) {
                setMessage('Content URL cannot be empty for ' + materialFormat + ' material.');
                setMessageType('error');
                return; }
            try {
                new URL(contentUrl.trim());
            } catch (error) {
                setMessage('Please enter a valid URL.');
                setMessageType('error');
                return;  }

            apiEndpoint = 'http://localhost:5000/api/admin/materials/add';
            const requestBody = {
                title: title.trim(),
                courseCode: courseCode,
                year: year,
                semester: semester,
                subject: subject,
                materialFormat: materialFormat,
                materialCategory: materialCategory,
                contentUrl: contentUrl.trim(), };

            fetchOptions.body = JSON.stringify(requestBody);
            fetchOptions.headers = {
                'Content-Type': 'application/json', };
            console.log('Sending JSON payload:', requestBody); }

        try {
            const response = await fetch(apiEndpoint, fetchOptions);

            if (response.ok) {
                setMessage('Material added successfully!');
                setMessageType('success');
                setTitle('');
                setMaterialFormat('');
                setMaterialCategory('');
                setContentUrl('');
                setSelectedFile(null);
                if (onMaterialAdded) {
                    onMaterialAdded(); }
            } else {
                const errorData = await response.json();
                setMessage(`Error: ${errorData.message || 'Failed to add material.'}`);
                setMessageType('error'); }

        } catch (error) {
            console.error('Network or server error:', error);
            setMessage('Network error. Could not connect to server.');
            setMessageType('error'); }
    };

    const getAcceptedFileTypes = (type) => {
        switch (type) {
            case 'PDF':
                return '.pdf';
            case 'Image':
                return 'image/*';
            case 'Document':
                return '.doc,.docx,.txt';
            default:
                return ''; } };

    return (
        <div className="add-material-container">
            <h2>Add New Material</h2>
            <p className="context-info">For: <strong>{courseCode}</strong> - Year <strong>{year}</strong> - Semester <strong>{semester}</strong> - Subject: <strong>{subject}</strong></p>

            {message && <div className={`message ${messageType}`}>{message}</div>}

            <form onSubmit={handleSubmit} className="add-material-form">
                <div className="form-group">
                    <label htmlFor="title">Material Title:</label>
                    <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., C++ Programming Notes"
                        required/>
                </div>

                <div className="form-group">
                    <label htmlFor="materialFormat">Material Type:</label>
                    <select id="materialFormat" value={materialFormat}
                        onChange={(e) => { setMaterialFormat(e.target.value); setContentUrl(''); setSelectedFile(null); }} required>
                        <option value="">Select Type</option>
                        <option value="PDF">PDF Document</option>
                        <option value="Image">Image (JPG, PNG, GIF)</option>
                        <option value="Document">Document (DOC, DOCX, TXT)</option>
                        <option value="Video">Video Link</option>
                        <option value="Link">External Link</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="materialCategory">Material Category:</label>
                    <select id="materialCategory" value={materialCategory}
                        onChange={(e) => { setMaterialCategory(e.target.value); }} required >
                        <option value="">Select Category</option>
                        <option value="syllabus">Syllabus</option>
                        <option value="notes">Notes</option>
                        <option value="paper">Papers</option>
                    </select>
                </div>

                {(['PDF', 'Image', 'Document'].includes(materialFormat)) ? (
                    <div className="form-group">
                        <label htmlFor="fileUpload">Upload File:</label>
                        <input type="file" id="fileUpload" onChange={handleFileChange} accept={getAcceptedFileTypes(materialFormat)} required={!selectedFile} />
                    </div>
                ) : (materialFormat && (materialFormat === 'Video' || materialFormat === 'Link')) && (
                    <div className="form-group">
                        <label htmlFor="contentUrl">Content URL:</label>
                        <input type="url" id="contentUrl" value={contentUrl} onChange={(e) => setContentUrl(e.target.value)}
                            placeholder="e.g., https://example.com/document.pdf or https://youtube.com/video" required />
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