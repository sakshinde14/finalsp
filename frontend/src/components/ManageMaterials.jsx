// frontend/src/components/ManageMaterials.jsx
import React, { useState, useEffect } from 'react';
import EditMaterialForm from './EditMaterialForm'; // Assuming you have this
import './ManageMaterialsStyles.css'; // Add your styles here

function ManageMaterials({ selectedContext, onMaterialManaged, onCancelManage }) {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editingMaterial, setEditingMaterial] = useState(null); // Material being edited
    const [message, setMessage] = useState(''); // For success/error messages within this component
    const [refreshTrigger, setRefreshTrigger] = useState(0); // To re-fetch materials

    useEffect(() => {
        const fetchAdminMaterials = async () => {
            if (!selectedContext || !selectedContext.subject) {
                setMaterials([]);
                setMessage("Please select a subject to manage materials.");
                setLoading(false); // Ensure loading is false if no context
                return;
            }

            setLoading(true);
            setError(null);
            setMessage(''); // Clear previous messages

            try {
                // *** THIS IS THE CRITICAL PART: Ensure these variables are correctly destructured ***
                const { courseCode, year, semester, subject } = selectedContext;
                const encodedSubject = encodeURIComponent(subject);

                // Fetch materials for the selected subject
                const response = await fetch(
                    // *** VERIFY THIS URL CONSTRUCTION ***
                    `http://localhost:5000/api/admin/materials?courseCode=${courseCode}&year=${year}&semester=${semester}&subject=${encodedSubject}`,
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
    }, [selectedContext, refreshTrigger]); // Re-fetch when context changes or refreshTrigger is incremented

    const handleDelete = async (materialId) => {
        if (window.confirm("Are you sure you want to delete this material?")) {
            setLoading(true); // Set loading while deleting
            setMessage('');
            setError(null);
            try {
                const response = await fetch(`http://localhost:5000/api/admin/materials/${materialId}`, {
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
        // This material is already updated on the backend via EditMaterialForm.
        // Just refresh the list and clear editing state.
        setEditingMaterial(null);
        setRefreshTrigger(prev => prev + 1); // Trigger re-fetch to show latest data
        onMaterialManaged('Material updated successfully!'); // Notify parent
        setMessage('Material updated successfully!');
        setTimeout(() => setMessage(''), 3000); // Clear local message
    };

    const handleCancelEdit = () => {
        setEditingMaterial(null);
    };

    return (
        <div className="manage-materials-container">
            <h2 className="manage-materials-header">
                Manage Materials for: {selectedContext?.subject} ({selectedContext?.courseCode}, Year {selectedContext?.year}, Sem {selectedContext?.semester})
            </h2>

            {loading && <div className="loading-message">Loading materials...</div>}
            {error && <div className="error-message">Error: {error}</div>}
            {message && <div className={`system-message ${message.includes('successfully') ? 'success' : 'error'}`}>{message}</div>}


            {editingMaterial ? (
                <EditMaterialForm
                    material={editingMaterial}
                    onUpdate={handleUpdate}
                    onCancel={handleCancelEdit}
                />
            ) : (
                <>
                    {materials.length === 0 && !loading && !error && (
                        <p className="no-materials-message">No materials found for this subject.</p>
                    )}
                    <ul className="materials-list">
                        {materials.map((material) => (
                            <li key={material._id} className="material-item">
                                <div className="material-details">
                                    <h4>{material.title || material.subject} ({material.materialCategory})</h4>
                                    <p>Format: {material.materialFormat}</p>
                                    {material.contentUrl && <p>URL: <a href={material.contentUrl} target="_blank" rel="noopener noreferrer">{material.contentUrl}</a></p>}
                                    {material.textContent && <p>Content: {material.textContent.substring(0, 100)}...</p>}
                                    <p>Uploaded by: {material.uploadedBy} on {new Date(material.uploadedAt).toLocaleDateString()}</p>
                                </div>
                                <div className="material-actions">
                                    <button onClick={() => handleEditClick(material)} className="edit-button">Edit</button>
                                    <button onClick={() => handleDelete(material._id)} className="delete-button">Delete</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </>
            )}

            <button onClick={onCancelManage} className="back-button">Back to Study material view</button>
        </div>
    );
}

export default ManageMaterials;