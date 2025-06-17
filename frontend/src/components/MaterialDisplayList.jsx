// frontend/src/components/MaterialDisplayList.jsx
import React, { useState } from 'react';
import './MaterialDisplayListStyles.css';

function MaterialDisplayList({ materials }) {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedFormat, setSelectedFormat] = useState('All');

    const BASE_URL = 'http://localhost:5000';

    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
    };

    const handleFormatChange = (e) => {
        setSelectedFormat(e.target.value);
    };

    const filteredMaterials = materials.filter((material) => {
        const categoryMatch =
            selectedCategory === 'All' ||
            material.materialCategory?.toLowerCase() === selectedCategory.toLowerCase();

        const formatMatch =
            selectedFormat === 'All' ||
            material.materialFormat?.toLowerCase() === selectedFormat.toLowerCase();

        return categoryMatch && formatMatch;
    });

    const categoryEmojis = {
        Notes: '📝',
        Syllabus: '📘',
        Paper: '📄',
    };

    const formatEmojis = {
        PDF: '📄',
        Image: '🖼️',
        Document: '📃',
        Video: '🎥',
        Link: '🔗',
    };

    return (
        <div className="material-display-list-container">
            <h4>Study Materials</h4>

            <div className="material-filters">
                <div>
                    <label htmlFor="category">Material Category:</label>
                    <select id="category" value={selectedCategory} onChange={handleCategoryChange}>
                        <option value="All">All</option>
                        <option value="Syllabus">📘 Syllabus</option>
                        <option value="Notes">📝 Notes</option>
                        <option value="Paper">📄 Papers</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="format">Material Format:</label>
                    <select id="format" value={selectedFormat} onChange={handleFormatChange}>
                        <option value="All">All</option>
                        <option value="PDF">📄 PDF</option>
                        <option value="Image">🖼️ Image</option>
                        <option value="Document">📃 Document</option>
                        <option value="Video">🎥 Video</option>
                        <option value="Link">🔗 Link</option>
                    </select>
                </div>
            </div>

            {filteredMaterials.length === 0 ? (
                <div className="no-materials-found">
                    <p>No <strong>{selectedCategory}</strong> materials of format <strong>{selectedFormat}</strong> found.</p>
                    <p>Try a different category or format.</p>
                </div>
            ) : (
                <ul className="material-items-grid">
                    {filteredMaterials.map((material) => {
                        const cat = material.materialCategory;
                        const format = material.materialFormat;

                        return (
                            <li key={material._id || material.contentUrl || material.textContent} className="material-item-card">
                                <h4>{categoryEmojis[cat] || ''} {cat?.toUpperCase()}</h4>
                                <p className="mic-title">{material.title}</p>

                                {format === 'PDF' && material.contentUrl && (
                                    <p><a href={`${BASE_URL}${material.contentUrl}`} target="_blank" rel="noopener noreferrer" className="material-action-link">📄 View PDF Document</a></p>
                                )}

                                {format === 'Image' && material.contentUrl && (
                                    <p><a href={`${BASE_URL}${material.contentUrl}`} target="_blank" rel="noopener noreferrer" className="material-action-link">🖼️ View Image</a></p>
                                )}

                                {format === 'Document' && material.contentUrl && (
                                    <p><a href={`${BASE_URL}${material.contentUrl}`} target="_blank" rel="noopener noreferrer" className="material-action-link">📃 View Document</a></p>
                                )}

                                {format === 'Video' && material.contentUrl && (
                                    <p><a href={material.contentUrl} target="_blank" rel="noopener noreferrer" className="material-action-link">🎥 Watch Video</a></p>
                                )}

                                {format === 'Link' && material.contentUrl && (
                                    <p><a href={material.contentUrl} target="_blank" rel="noopener noreferrer" className="material-action-link">🔗 Visit Link</a></p>
                                )}

                                <div className="material-info-section">
                                    {material.uploadedBy && (
                                        <p className="material-info">👤 Uploaded By: {material.uploadedBy}</p>
                                    )}
                                    {material.uploadedAt && (
                                        <p className="material-info">🗓️ Uploaded: {new Date(material.uploadedAt).toLocaleDateString()}</p>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

export default MaterialDisplayList;
