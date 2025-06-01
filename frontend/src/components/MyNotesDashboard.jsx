// frontend/src/pages/MyNotesDashboard.jsx
import React, { useState, useEffect } from 'react';
import './MyNotesDashboardStyles.css';
import AddMyNoteMaterial from '../components/AddMyNoteMaterial'; // New component for adding notes

function MyNotesDashboard() {
    const [notes, setNotes] = useState([]);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'
    const [showAddNoteForm, setShowAddNoteForm] = useState(false); // State to control add form visibility

    // Effect to clear messages
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage('');
                setMessageType('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    // Function to fetch all notes for the user
    const fetchNotes = async () => {
        setMessage('');
        setMessageType('');
        try {
            const response = await fetch('http://localhost:5000/api/user/notes');
            if (response.ok) {
                const data = await response.json();
                setNotes(data.notes || []);
            } else {
                const errorData = await response.json();
                setMessage(errorData.message || 'Failed to fetch notes.');
                setMessageType('error');
            }
        } catch (error) {
            setMessage('Network error. Could not fetch notes.');
            setMessageType('error');
            console.error('Error fetching notes:', error);
        }
    };

    // Fetch notes on component mount
    useEffect(() => {
        fetchNotes();
    }, []);

    // Handle note deletion
    const handleDeleteNote = async (noteId, title) => {
        if (window.confirm(`Are you sure you want to delete the note: "${title}"?`)) {
            setMessage('');
            setMessageType('');
            try {
                const response = await fetch(`http://localhost:5000/api/user/notes/${noteId}`, { // NEW API endpoint
                    method: 'DELETE',
                    credentials: 'include'
                });

                if (response.ok) {
                    setMessage('Note deleted successfully!');
                    setMessageType('success');
                    fetchNotes(); // Re-fetch notes to update the list
                } else {
                    const errorData = await response.json();
                    setMessage(errorData.message || 'Failed to delete note.');
                    setMessageType('error');
                }
            } catch (error) {
                setMessage('Network error. Could not delete note.');
                setMessageType('error');
                console.error('Error deleting note:', error);
            }
        }
    };

    // Callback after a new note is added or cancelled
    const handleNoteFormClose = (refresh = false) => {
        setShowAddNoteForm(false);
        if (refresh) {
            fetchNotes(); // Refresh list if a note was successfully added
        }
    };

    return (
        <div className="my-notes-dashboard-container">
            <h2>My Notes</h2>

            {message && <div className={`my-notes-message ${messageType}`}>{message}</div>}

            {/* Floating Add Button */}
            <button className="add-note-fab" onClick={() => setShowAddNoteForm(true)}>
                +
            </button>

            {/* Add New Note Form (as a modal/overlay) */}
            {showAddNoteForm && (
                <div className="add-note-modal-overlay">
                    <AddMyNoteMaterial onClose={handleNoteFormClose} />
                </div>
            )}

            <div className="my-materials-list">
                {notes.length === 0 ? (
                    <p className="no-items-message">You haven't added any notes yet. Click the '+' button to add one!</p>
                ) : (
                    notes.map(note => (
                        <div key={note._id} className="material-item-note">
                            <h4>{note.title}</h4>
                            <p className="material-type-tag">Type: {note.materialType}</p>

                            {note.materialType === 'PDF' && note.contentUrl && (
                                <p><a href={note.contentUrl} target="_blank" rel="noopener noreferrer">View PDF Document</a></p>
                            )}
                            {note.materialType === 'Image' && note.contentUrl && (
                                <p><a href={note.contentUrl} target="_blank" rel="noopener noreferrer">View Image</a></p>
                            )}
                            {note.materialType === 'Link' && note.contentUrl && (
                                <p><a href={note.contentUrl} target="_blank" rel="noopener noreferrer">Visit Link</a></p>
                            )}
                            {note.materialType === 'Text' && note.textContent && (
                                <div className="note-text-content">
                                    <p><strong>Content:</strong></p>
                                    <p className="note-text-preview-full">{note.textContent}</p>
                                </div>
                            )}

                            <div className="note-card-actions">
                                {/* Delete Button (Dustbin Icon) */}
                                <button className="delete-note-button" onClick={() => handleDeleteNote(note._id, note.title)}>
                                    <img src="/dustbin-icon.png" alt="Delete" className="dustbin-icon" /> {/* Make sure you have a dustbin-icon.png in your public folder */}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default MyNotesDashboard;