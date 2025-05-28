// src/components/ManageMaterials.jsx
import React, { useState, useEffect } from 'react';
//import './TableStyles.css'; // You'll need to create this CSS file or integrate

function ManageMaterials() {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editMaterialId, setEditMaterialId] = useState(null); // State to hold ID of material being edited
    const [editFormData, setEditFormData] = useState({}); // State for form data during editing

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        setLoading(true);
        setError('');
        try {
            // This API endpoint needs to be created on your backend
            const response = await fetch('http://localhost:5000/api/admin/materials');
            if (!response.ok) {
                throw new Error('Failed to fetch materials');
            }
            const data = await response.json();
            setMaterials(data);
        } catch (err) {
            console.error("Error fetching materials:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this material?')) {
            return;
        }
        try {
            const response = await fetch(`http://localhost:5000/api/admin/materials/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete material');
            }
            setMaterials(materials.filter(material => material._id !== id));
            alert('Material deleted successfully!');
        } catch (err) {
            console.error("Error deleting material:", err);
            setError(err.message);
        }
    };

    const handleEditClick = (material) => {
        setEditMaterialId(material._id);
        setEditFormData({
            title: material.title,
            description: material.description,
            courseCode: material.courseCode,
            year: material.year,
            semester: material.semester,
            subject: material.subject,
            // Add other fields as needed for editing
        });
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/admin/materials/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editFormData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update material');
            }
            // Refresh the list after update
            fetchMaterials();
            setEditMaterialId(null); // Exit edit mode
            alert('Material updated successfully!');
        } catch (err) {
            console.error("Error updating material:", err);
            setError(err.message);
        }
    };

    if (loading) return <div className="loading-message">Loading materials...</div>;
    if (error) return <div className="error-message">Error: {error}</div>;

    return (
        <div className="manage-materials-container">
            <h2>Manage Study Materials</h2>
            {materials.length === 0 ? (
                <p>No study materials found. Add some using the "Add New Material" tool.</p>
            ) : (
                <table className="materials-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Course</th>
                            <th>Year</th>
                            <th>Semester</th>
                            <th>Subject</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {materials.map(material => (
                            <tr key={material._id}>
                                {editMaterialId === material._id ? (
                                    <>
                                        <td><input type="text" name="title" value={editFormData.title} onChange={handleEditChange} /></td>
                                        <td><input type="text" name="courseCode" value={editFormData.courseCode} onChange={handleEditChange} /></td>
                                        <td><input type="number" name="year" value={editFormData.year} onChange={handleEditChange} /></td>
                                        <td><input type="number" name="semester" value={editFormData.semester} onChange={handleEditChange} /></td>
                                        <td><input type="text" name="subject" value={editFormData.subject} onChange={handleEditChange} /></td>
                                        <td>
                                            <button onClick={() => handleUpdate(material._id)} className="action-button edit-button">Save</button>
                                            <button onClick={() => setEditMaterialId(null)} className="action-button cancel-button">Cancel</button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td>{material.title}</td>
                                        <td>{material.courseCode}</td>
                                        <td>{material.year}</td>
                                        <td>{material.semester}</td>
                                        <td>{material.subject}</td>
                                        <td>
                                            <button onClick={() => handleEditClick(material)} className="action-button edit-button">Edit</button>
                                            <button onClick={() => handleDelete(material._id)} className="action-button delete-button">Delete</button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default ManageMaterials;