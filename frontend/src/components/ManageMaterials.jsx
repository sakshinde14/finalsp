// frontend/src/components/ManageMaterials.jsx
import React, { useState, useEffect } from 'react';
import EditMaterialForm from './EditMaterialForm'; // Assuming you have this
import './ManageMaterialsStyles.css'; // Your custom styles

function ManageMaterials({ selectedContext, onMaterialManaged, onCancelManage }) {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editingMaterial, setEditingMaterial] = useState(null);
    const [message, setMessage] = useState('');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedFormat, setSelectedFormat] = useState('All');

    const BASE_URL = 'http://localhost:5000';

    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
    };

    const handleFormatChange = (e) => {
        setSelectedFormat(e.target.value);
    };

    useEffect(() => {
        const fetchAdminMaterials = async () => {
            if (!selectedContext || !selectedContext.subject) {
                setMaterials([]);
                setMessage("Please select a subject to manage materials.");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);
            setMessage('');

            try {
                const { courseCode, year, semester, subject } = selectedContext;
                const encodedSubject = encodeURIComponent(subject);

                const response = await fetch(
                    `${BASE_URL}/api/admin/materials?courseCode=${courseCode}&year=${year}&semester=${semester}&subject=${encodedSubject}`,
                    { credentials: 'include' }
                );

                if (!response.ok) {
                    if (response.status === 403) {
                        throw new Error('Forbidden: Admin access required.');
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setMaterials(data);
            } catch (e) {
                console.error("Error fetching admin materials:", e);
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAdminMaterials();
    }, [selectedContext, refreshTrigger]);

    const handleDelete = async (materialId) => {
        if (window.confirm("Are you sure you want to delete this material? This action cannot be undone.")) {
            setLoading(true);
            setMessage('');
            setError(null);
            try {
                const response = await fetch(`${BASE_URL}/api/admin/materials/${materialId}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                setMessage(result.message || 'Material deleted successfully!');
                onMaterialManaged('Material deleted successfully!'); // Notify parent
                setRefreshTrigger(prev => prev + 1); // Trigger re-fetch
            } catch (e) {
                console.error("Error deleting material:", e);
                setError(`Failed to delete material: ${e.message}`);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleEditClick = (material) => {
        setEditingMaterial(material);
        setMessage('');
        setError(null);
    };

    const handleUpdate = (updatedMaterial) => {
        setEditingMaterial(null); // Exit edit mode
        setRefreshTrigger(prev => prev + 1); // Trigger re-fetch to see changes
        onMaterialManaged('Material updated successfully!'); // Notify parent
        setMessage('Material updated successfully!');
        setTimeout(() => setMessage(''), 3000); // Clear message after 3 seconds
    };

    const handleCancelEdit = () => {
        setEditingMaterial(null);
        setMessage(''); // Clear any messages from previous state
        setError(null); // Clear any errors
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

    return (
        <div className="manage-materials-wrapper"> {/* New wrapper div */}
            <div className="manage-materials-container">
                <h2 className="manage-materials-header">
                    Manage Materials for: {selectedContext?.subject} ({selectedContext?.courseCode}, Year {selectedContext?.year}, Sem {selectedContext?.semester})
                </h2>

                {loading && <div className="loading-message">Loading materials...</div>}
                {error && <div className="error-message">Error: {error}</div>}
                {message && <div className={`system-message ${message.includes('successfully') ? 'success' : 'error'}`}>{message}</div>}

                {/* Filters Section */}
                <div className="material-filters">
                    <div> {/* Group label and select for category */}
                        <label htmlFor="category">Material Category:</label>
                        <select id="category" value={selectedCategory} onChange={handleCategoryChange}>
                            <option value="All">All</option>
                            <option value="Syllabus">Syllabus</option>
                            <option value="Notes">Notes</option>
                            <option value="Paper">Papers</option>
                        </select>
                    </div>

                    <div> {/* Group label and select for format */}
                        <label htmlFor="format">Material Format:</label>
                        <select id="format" value={selectedFormat} onChange={handleFormatChange}>
                            <option value="All">All</option>
                            <option value="PDF">PDF</option>
                            <option value="Image">Image</option>
                            <option value="Document">Document</option>
                            <option value="Video">Video</option>
                            <option value="Link">Link</option>
                        </select>
                    </div>
                </div>

                {editingMaterial ? (
                    // Render EditMaterialForm when a material is selected for editing
                    <EditMaterialForm
                        material={editingMaterial}
                        onUpdate={handleUpdate}
                        onCancel={handleCancelEdit}
                        selectedContext={selectedContext} // Pass context for potential re-uploads
                    />
                ) : (
                    // Display materials list or no materials message
                    <>
                        {filteredMaterials.length === 0 && !loading && !error && (
                            <div className="no-materials-found">
                                <p>No <strong>{selectedCategory === 'All' ? '' : selectedCategory}</strong> materials of format <strong>{selectedFormat === 'All' ? '' : selectedFormat}</strong> found for this subject.</p>
                                <p>Try a different category or format or add new materials.</p>
                            </div>
                        )}

                        {filteredMaterials.length > 0 && (
                            <ul className="materials-list">
                                {filteredMaterials.map((material) => (
                                    <li key={material._id} className="material-item">
                                        <div className="material-details">
                                            <h4>{material.title || material.subject} ({material.materialCategory})</h4>
                                            <p>Format: {material.materialFormat}</p>
                                            {material.contentUrl && (
                                                <p>URL: <a href={`${BASE_URL}${material.contentUrl}`} target="_blank" rel="noopener noreferrer">{material.contentUrl.length > 50 ? material.contentUrl.substring(0, 50) + '...' : material.contentUrl}</a></p>
                                            )}
                                            {material.textContent && (
                                                <p>Content: {material.textContent.substring(0, 100)}...</p>
                                            )}
                                            <p>Uploaded by: {material.uploadedBy} on {new Date(material.uploadedAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="material-actions">
                                            <button onClick={() => handleEditClick(material)} className="edit-button">Edit</button>
                                            <button onClick={() => handleDelete(material._id)} className="delete-button">Delete</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </>
                )}
            </div>
            {/* The back button is outside the main container to ensure it's always at the bottom */}
            {!editingMaterial && ( // Only show back button if not in edit mode
                <button onClick={onCancelManage} className="back-button">Back to Study Material View</button>
            )}
        </div>
    );
}

export default ManageMaterials;
