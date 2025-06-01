// frontend/src/components/AddMyNoteMaterial.jsx
import React, { useState } from 'react';
import './AddMyNoteMaterialStyles.css'; // Create this CSS file

function AddMyNoteMaterial({ onClose }) {
    const [title, setTitle] = useState('');
    const [materialType, setMaterialType] = useState('Text'); // Default to Text
    const [textContent, setTextContent] = useState('');
    const [contentUrl, setContentUrl] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setMessageType('');

        if (!title.trim()) {
            setMessage('Title is required.');
            setMessageType('error');
            return;
        }

        let materialData = { title, materialType };
        let apiEndpoint = 'http://localhost:5000/api/user/notes'; // Default for text/link
        let formData = new FormData(); // For file uploads

        if (materialType === 'Text') {
            if (!textContent.trim()) {
                setMessage('Text content cannot be empty.');
                setMessageType('error');
                return;
            }
            materialData.textContent = textContent;
        } else if (materialType === 'Link') {
            if (!contentUrl.trim()) {
                setMessage('Link URL is required.');
                setMessageType('error');
                return;
            }
            // Basic URL validation
            try {
                new URL(contentUrl);
            } catch (_) {
                setMessage('Please enter a valid URL.');
                setMessageType('error');
                return;
            }
            materialData.contentUrl = contentUrl;
        } else if (materialType === 'PDF' || materialType === 'Image') {
            if (!selectedFile) {
                setMessage(`Please select a ${materialType} file to upload.`);
                setMessageType('error');
                return;
            }
            // Set API endpoint for file upload
            apiEndpoint = 'http://localhost:5000/api/user/notes/upload';

            formData.append('file', selectedFile);
            formData.append('title', title);
            formData.append('materialType', materialType); // Send type for backend processing
        }

        try {
            const fetchOptions = {
                method: 'POST',
                credentials: 'include'
            };

            if (materialType === 'PDF' || materialType === 'Image') {
                fetchOptions.body = formData; // FormData sets 'Content-Type' automatically
            } else {
                fetchOptions.headers = { 'Content-Type': 'application/json' };
                fetchOptions.body = JSON.stringify(materialData);
            }

            const response = await fetch(apiEndpoint, fetchOptions);

            if (response.ok) {
                setMessage('Note added successfully!');
                setMessageType('success');
                setTitle('');
                setMaterialType('Text');
                setTextContent('');
                setContentUrl('');
                setSelectedFile(null);
                onClose(true); // Close and signal to refresh parent
            } else {
                const errorData = await response.json();
                setMessage(errorData.message || 'Failed to add note.');
                setMessageType('error');
            }
        } catch (error) {
            setMessage('Network error. Could not add note.');
            setMessageType('error');
            console.error('Error adding note:', error);
        }
    };

    return (
        <div className="add-my-note-material-form-container">
            <button className="close-button" onClick={() => onClose(false)}>&times;</button>
            <h3>Add New Note/Material</h3>

            {message && <div className={`add-note-message ${messageType}`}>{message}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="title">Title:</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., My Math Homework Notes"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="materialType">Material Type:</label>
                    <select
                        id="materialType"
                        value={materialType}
                        onChange={(e) => {
                            setMaterialType(e.target.value);
                            // Clear content fields when type changes
                            setTextContent('');
                            setContentUrl('');
                            setSelectedFile(null);
                        }}
                    >
                        <option value="Text">Text Note</option>
                        <option value="PDF">PDF Document</option>
                        <option value="Image">Image</option>
                        <option value="Link">Web Link</option>
                    </select>
                </div>

                {materialType === 'Text' && (
                    <div className="form-group">
                        <label htmlFor="textContent">Note Content:</label>
                        <textarea
                            id="textContent"
                            value={textContent}
                            onChange={(e) => setTextContent(e.target.value)}
                            placeholder="Start typing your notes here..."
                            rows="6"
                            required
                        ></textarea>
                    </div>
                )}

                {(materialType === 'PDF' || materialType === 'Image') && (
                    <div className="form-group">
                        <label htmlFor="fileUpload">Upload File:</label>
                        <input
                            type="file"
                            id="fileUpload"
                            onChange={handleFileChange}
                            accept={materialType === 'PDF' ? '.pdf' : 'image/*'}
                            required={!selectedFile} // Require if no file is selected yet
                        />
                    </div>
                )}

                {materialType === 'Link' && (
                    <div className="form-group">
                        <label htmlFor="contentUrl">URL:</label>
                        <input
                            type="url"
                            id="contentUrl"
                            value={contentUrl}
                            onChange={(e) => setContentUrl(e.target.value)}
                            placeholder="https://example.com/your-notes"
                            required
                        />
                    </div>
                )}

                <button type="submit" className="submit-note-button">Add Note</button>
            </form>
        </div>
    );
}

export default AddMyNoteMaterial;