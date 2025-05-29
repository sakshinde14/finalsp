import React, { useEffect, useState } from 'react';
import './MaterialDisplayListStyles.css';

function Favorites() {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // New state for error messages

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const response = await fetch('/api/favorites', {
                    credentials: 'include',
                });

                if (!response.ok) {
                    // If response is not 2xx (e.g., 401, 403, 500)
                    let errorData;
                    try {
                        // Try to parse as JSON first (if server *might* send JSON errors)
                        errorData = await response.json();
                    } catch (jsonError) {
                        // If it's not JSON (likely HTML in your case), get as text
                        errorData = await response.text();
                    }

                    // Depending on status, set a user-friendly error message
                    if (response.status === 401) {
                        setError('You need to be logged in to view your favorites. Please log in.');
                    } else {
                        setError(`Failed to load favorites: ${response.status} - ${errorData.message || errorData}`);
                    }
                    console.error('Failed to load favorites. Server Response:', response.status, errorData);
                    return; // Stop execution here
                }

                // If response.ok is true, it should be JSON
                const data = await response.json();
                setFavorites(data);
            } catch (err) {
                // This catch block handles network errors or errors from .json() parsing
                console.error('Failed to load favorites (network/parsing error):', err);
                setError(`An unexpected error occurred: ${err.message}. Please try again later.`);
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, []);

    if (loading) {
        return <div className="material-display-list-container"><p>Loading favorites...</p></div>;
    }

    if (error) {
        // Display the error message to the user
        return (
            <div className="material-display-list-container">
                <p className="error-message">{error}</p>
            </div>
        );
    }

    return (
        <div className="material-display-list-container">
            <h3>⭐ Your Favorite Materials</h3>

            {favorites.length === 0 ? (
                <div className="no-materials-found">
                    <p>You haven't added any favorites yet.</p>
                    <p>Click the ❤️ icon on a material to favorite it.</p>
                </div>
            ) : (
                <ul className="material-items-grid">
                    {favorites.map((material) => (
                        <li key={material._id} className="material-item-card">
                            <h4>{material.subject} - {material.materialCategory}</h4>

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

                            <p className="material-info">Course: {material.courseCode}, Year: {material.year}, Semester: {material.semester}</p>
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

export default Favorites;
