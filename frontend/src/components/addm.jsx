// frontend/src/components/AddMaterial.jsx
import React, { useState, useEffect } from 'react';
import './AddMaterialStyles.css'; // We will create this CSS file next

function AddMaterial({ onMaterialAdded, onCancelAdd, selectedContext }) {
    const [materialFormat, setMaterialFormat] = useState('');
    const [materialCategory, setMaterialCategory] = useState('');
    const [contentUrl, setContentUrl] = useState('');
    const [textContent, setTextContent] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'

    // Destructure selectedContext for pre-populating fields
    const { courseCode, year, semester, subject } = selectedContext || {};

    // Effect to clear message after some time
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage('');
                setMessageType('');
            }, 3000); // Message disappears after 3 seconds
            return () => clearTimeout(timer);
        }
    }, [message]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(''); // Clear previous messages

        if (!materialFormat) {
            setMessage('Please select a material type.');
            setMessageType('error');
            return;
        }

        const materialData = {
            courseCode: courseCode,
            year: year,
            semester: semester,
            subject: subject,
            materialFormat: materialFormat,
        };

        if (materialFormat === 'Text') {
            if (!textContent.trim()) {
                setMessage('Text content cannot be empty for Text material.');
                setMessageType('error');
                return;
            }
            materialData.textContent = textContent.trim();
        } else { // PDF, Video, Link
            if (!contentUrl.trim()) {
                setMessage('Content URL cannot be empty for ' + materialFormat + ' material.');
                setMessageType('error');
                return;
            }
            // Basic URL validation (can be more robust)
            try {
                new URL(contentUrl.trim());
            } catch (error) {
                setMessage('Please enter a valid URL.');
                setMessageType('error');
                return;
            }
            materialData.contentUrl = contentUrl.trim();
        }

        try {
            const response = await fetch('http://localhost:5000/api/admin/materials/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(materialData),
                credentials: 'include'
            });

            if (response.ok) {
                setMessage('Material added successfully!');
                setMessageType('success');
                // Clear form fields
                setMaterialFormat('');
                setContentUrl('');
                setTextContent('');
                if (onMaterialAdded) {
                    onMaterialAdded(); // Notify parent component (AdminDashboardLayout)
                }
            } else {
                const errorData = await response.json();
                setMessage(`Error: ${errorData.message || 'Failed to add material.'}`);
                setMessageType('error');
            }
        } catch (error) {
            console.error('Network or server error:', error);
            setMessage('Network error. Could not connect to server.');
            setMessageType('error');
        }
    };

    return (
        <div className="add-material-container">
            <h2>Add New Material</h2>
            <p className="context-info">For: <strong>{courseCode}</strong> - Year <strong>{year}</strong> - Semester <strong>{semester}</strong> - Subject: <strong>{subject}</strong></p>

            {message && <div className={`message ${messageType}`}>{message}</div>}

            <form onSubmit={handleSubmit} className="add-material-form">
                <div className="form-group">
                    <label htmlFor="materialFormat">Material Type:</label>
                    <select
                        id="materialFormat"
                        value={materialFormat}
                        onChange={(e) => {
                            setMaterialFormat(e.target.value);
                            setContentUrl(''); // Clear URL/Text when type changes
                            setTextContent('');
                        }}
                        required
                    >
                        <option value="">Select Type</option>
                        <option value="PDF">PDF Document</option>
                        <option value="Video">Video Link</option>
                        <option value="Link">External Link</option>
                        <option value="Text">Text Content</option>
                    </select>
                </div>
                <div className="form-group">
                            <label htmlFor="materialCategory">Material Category:</label>
                            <select
                                id="materialCategory"
                                value={materialCategory}
                                onChange={(e) => setMaterialCategory(e.target.value)}
                                required
                                >
                                    <option value="">Select Category</option>
                                    <option value="syllabus">Syllabus</option>
                                    <option value="notes">Notes</option>
                                    <option value="papers">Papers</option>
                            </select>
                        </div>

                {materialFormat && materialFormat !== 'Text' && (
                    <div className="form-group">
                        <label htmlFor="contentUrl">Content URL:</label>
                        <input
                            type="url"
                            id="contentUrl"
                            value={contentUrl}
                            onChange={(e) => setContentUrl(e.target.value)}
                            placeholder="e.g., https://example.com/document.pdf"
                            required={materialFormat !== 'Text'}
                        />
                    </div>
                )}

                {materialFormat === 'Text' && (
                    <div className="form-group">
                        <label htmlFor="textContent">Text Content:</label>
                        <textarea
                            id="textContent"
                            value={textContent}
                            onChange={(e) => setTextContent(e.target.value)}
                            placeholder="Enter your text notes or content here..."
                            rows="8"
                            required={materialFormat === 'Text'}
                        ></textarea>
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






// frontend/src/components/AddMaterial.jsx
import React, { useState, useEffect } from 'react';
import './AddMaterialStyles.css'; // We will create this CSS file next

function AddMaterial({ onMaterialAdded, onCancelAdd, selectedContext }) {
    const [materialFormat, setMaterialFormat] = useState('');
    const [materialCategory, setMaterialCategory] = useState('');

    const [contentUrl, setContentUrl] = useState('');
    const [textContent, setTextContent] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'

    // Destructure selectedContext for pre-populating fields
    const { courseCode, year, semester, subject } = selectedContext || {};

    // Effect to clear message after some time
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage('');
                setMessageType('');
            }, 3000); // Message disappears after 3 seconds
            return () => clearTimeout(timer);
        }
    }, [message]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(''); // Clear previous messages

        if (!materialType) {
            setMessage('Please select a material type.');
            setMessageType('error');
            return;
        }

        const materialData = {
            courseCode: courseCode,
            year: year,
            semester: semester,
            subject: subject,
            materialFormat: format,
            materialCategory: category,
            ...(materialFormat === 'Text' ? { textContent } : { contentUrl })
        };

        if (materialformat === 'Text') {
            if (!textContent.trim()) {
                setMessage('Text content cannot be empty for Text material.');
                setMessageType('error');
                return;
            }
            materialData.textContent = textContent.trim();
        } else { // PDF, Video, Link
            if (!contentUrl.trim()) {
                setMessage('Content URL cannot be empty for ' + materialType + ' material.');
                setMessageType('error');
                return;
            }
            // Basic URL validation (can be more robust)
            try {
                new URL(contentUrl.trim());
            } catch (error) {
                setMessage('Please enter a valid URL.');
                setMessageType('error');
                return;
            }
            materialData.contentUrl = contentUrl.trim();
        }

        try {
            const response = await fetch('http://localhost:5000/api/admin/materials/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(materialData),
                credentials: 'include'
            });

            if (response.ok) {
                setMessage('Material added successfully!');
                setMessageType('success');
                // Clear form fields
                setMaterialFormat('');
                setContentUrl('');
                setTextContent('');
                if (onMaterialAdded) {
                    onMaterialAdded(); // Notify parent component (AdminDashboardLayout)
                }
            } else {
                const errorData = await response.json();
                setMessage(`Error: ${errorData.message || 'Failed to add material.'}`);
                setMessageType('error');
            }
        } catch (error) {
            console.error('Network or server error:', error);
            setMessage('Network error. Could not connect to server.');
            setMessageType('error');
        }
    };

    return (
        <div className="add-material-container">
            <h2>Add New Material</h2>
            <p className="context-info">For: <strong>{courseCode}</strong> - Year <strong>{year}</strong> - Semester <strong>{semester}</strong> - Subject: <strong>{subject}</strong></p>

            {message && <div className={`message ${messageType}`}>{message}</div>}

            <form onSubmit={handleSubmit} className="add-material-form">

            {materialFormat && materialFormat !== 'Text' && (
                    <div className="form-group">
                        <label htmlFor="contentUrl">Content URL:</label>
                        <input
                            type="url"
                            id="contentUrl"
                            value={contentUrl}
                            onChange={(e) => setContentUrl(e.target.value)}
                            placeholder="e.g., https://example.com/document.pdf"
                            required={materialFormat !== 'Text'}
                        />
                    </div>
                )}


                {materialFormat === 'Text' && (
                    <div>
                        <div className="form-group">
                            <label htmlFor="materialFormat">Material Format:</label>
                            <select
                                id="materialFormat"
                                value={materialFormat}
                                onChange={(e) => {
                                    setMaterialFormat(e.target.value);
                                    setContentUrl('');
                                    setTextContent('');
                                }}
                                required
                                >
                                    <option value="">Select Format</option>
                                    <option value="PDF">PDF Document</option>
                                    <option value="Video">Video Link</option>
                                    <option value="Link">External Link</option>
                                    <option value="Text">Text Content</option>
                            </select>
                        </div>
                            
                        <div className="form-group">
                            <label htmlFor="materialCategory">Material Category:</label>
                            <select
                                id="materialCategory"
                                value={materialCategory}
                                onChange={(e) => setMaterialCategory(e.target.value)}
                                required
                                >
                                    <option value="">Select Category</option>
                                    <option value="syllabus">Syllabus</option>
                                    <option value="notes">Notes</option>
                                    <option value="papers">Papers</option>
                            </select>
                        </div>
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





@app.route('/api/admin/change-password', methods=['POST'])
@admin_required
def change_password():
    data = request.get_json()
    current_password = data.get('currentPassword')
    new_password = data.get('newPassword')

    if not current_password or not new_password:
        return jsonify({'message': 'Missing password fields'}), 400

    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401

    try:
        user = admins_collection.find_one({'_id': ObjectId(user_id)})
    except Exception as e:
        print(f"Error fetching user in change_password: {e}")
        return jsonify({'message': 'Internal server error while fetching user data.'}), 500

    if not user:
        return jsonify({'message': 'User not found'}), 404

    stored_password_hash = user.get('password')

    # IMPORTANT: Use bcrypt.checkpw here if admin passwords are hashed with bcrypt
    # Your current login_admin uses bcrypt, so this should too for consistency.
    if stored_password_hash is None or not isinstance(stored_password_hash, bytes):
        print(f"Password hash not found or invalid type for user {user_id}. Type: {type(stored_password_hash)}")
        return jsonify({'message': 'Invalid stored password format for admin.'}), 500

    # Verify current password using bcrypt
    if not checkpw(current_password.encode('utf-8'), stored_password_hash):
        return jsonify({'message': 'Incorrect current password'}), 403

    if len(new_password) < 6:
        return jsonify({'message': 'New password must be at least 6 characters long.'}), 400

    # Hash the new password using bcrypt
    hashed_new_password = hashpw(new_password.encode('utf-8'), gensalt())

    try:
        admins_collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'password': hashed_new_password}}
        )
        return jsonify({'message': 'Password changed successfully'}), 200
    except Exception as e:
        print(f"Error updating password in change_password: {e}")
        return jsonify({'message': 'Internal server error while updating password.'}), 500

@app.route('/api/admin/change-username', methods=['POST'])
@admin_required
def change_username():
    data = request.get_json()
    new_username = data.get('newUsername')

    if not new_username:
        return jsonify({'message': 'Missing new username'}), 400

    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401

    user = admins_collection.find_one({'_id': ObjectId(user_id)})
    if not user:
        return jsonify({'message': 'User not found'}), 404

    if admins_collection.find_one({'username': new_username, '_id': {'$ne': ObjectId(user_id)}}):
        return jsonify({'message': 'Username already taken'}), 409

    admins_collection.update_one(
        {'_id': ObjectId(user_id)},
        {'$set': {'username': new_username}}
    )
    return jsonify({'message': 'Username updated successfully'}), 200

