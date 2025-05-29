import React, { useState } from 'react';
import './MaterialDisplayListStyles.css';

function MaterialDisplayList({ materials }) {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedFormat, setSelectedFormat] = useState('All');

    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
    };

    const handleFormatChange = (e) => {
        setSelectedFormat(e.target.value);
    };

    // Filter materials based on selected category and format (case-insensitive)
    const filteredMaterials = materials.filter((material) => {
        const categoryMatch =
            selectedCategory === 'All' ||
            material.materialCategory?.toLowerCase() === selectedCategory.toLowerCase();

        const formatMatch =
            selectedFormat === 'All' ||
            material.materialFormat?.toLowerCase() === selectedFormat.toLowerCase();

        return categoryMatch && formatMatch;
    });

    return (
        <div className="material-display-list-container">
            
            <h4>Study Materials</h4>

            <div className="material-filters">
                <label htmlFor="category">Material Category:</label>
                <select id="category" value={selectedCategory} onChange={handleCategoryChange}>
                    <option value="All">All</option>
                    <option value="Syllabus">Syllabus</option>
                    <option value="Notes">Notes</option>
                    <option value="Paper">Papers</option>
                </select>

                <label htmlFor="format" style={{ marginLeft: '15px' }}>Material Format:</label>
                <select id="format" value={selectedFormat} onChange={handleFormatChange}>
                    <option value="All">All</option>
                    <option value="PDF">PDF</option>
                    <option value="Video">Video</option>
                    <option value="Link">Link</option>
                    <option value="Text">Text</option>
                </select>
            </div>

            {filteredMaterials.length === 0 ? (
                <div className="no-materials-found">
                    <p>No <strong>{selectedCategory}</strong> materials of format <strong>{selectedFormat}</strong> found.</p>
                    <p>Try a different category or format.</p>
                </div>
            ) : (
                <ul className="material-items-grid">
                    {filteredMaterials.map((material) => (
                        <li key={material._id || material.contentUrl || material.textContent} className="material-item-card">
                            <h4>{material.materialCategory.toUpperCase()}</h4>

                            {material.title}


                            {material.materialFormat === 'PDF' && material.contentUrl && (
                                <p><a href={material.contentUrl} target="_blank" rel="noopener noreferrer">View PDF Document</a></p>
                            )}
                            {material.materialFormat === 'Video' && material.contentUrl && (
                                <p><a href={material.contentUrl} target="_blank" rel="noopener noreferrer">Watch Video</a></p>
                            )}
                            {material.materialFormat === 'Link' && material.contentUrl && (
                                <p><a href={material.contentUrl} target="_blank" rel="noopener noreferrer">Visit Link</a></p>
                            )}
                            {material.materialFormat === 'Text' && material.textContent && (
                                <div className="material-text-content">
                                    <p><strong>Content:</strong></p>
                                    <p>{material.textContent}</p>
                                </div>
                            )}

                            

                            



                            {material.uploadedBy && (
                                <p className="material-info">Uploaded By: {material.uploadedBy}</p>
                            )}
                            {material.uploadedAt && (
                                <p className="material-info">Uploaded: {new Date(material.uploadedAt).toLocaleDateString()}</p>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default MaterialDisplayList;
