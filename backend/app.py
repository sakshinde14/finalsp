from flask import Flask, request, jsonify, session, send_from_directory
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename # NEW: Import for secure file uploads
from pymongo import MongoClient
from bcrypt import hashpw, checkpw, gensalt
from bson.binary import Binary
from flask_cors import CORS
from datetime import datetime
from bson.objectid import ObjectId
import os # NEW: Import for file system operations
from functools import wraps # NEW: Import for decorators
import uuid

# --- Configuration ---
MONGO_URI = "mongodb+srv://sakshi:gaurinde@cluster0.vpbqv.mongodb.net/sp_db?retryWrites=true&w=majority&appName=Cluster0"
DB_NAME = "sp_db"
STUDENT_COLLECTION = "students"
ADMIN_COLLECTION = "admins"
COURSE_COLLECTION = "courses"
STUDY_MATERIALS_COLLECTION = "study_materials"
USER_NOTES_COLLECTION = "user_notes"

app = Flask(__name__)
app.config['SECRET_KEY'] = 'a_very_long_and_random_secret_key_here_that_is_unique_and_not_guessable'
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)

# --- File Upload Configuration for Admin Materials ---
# Define the upload folder. It's good practice to place it within a static directory.
# Ensure this directory exists! Example: your_project_root/static/uploads/admin_materials
UPLOAD_MATERIALS_FOLDER = os.path.join(app.root_path, 'static', 'uploads', 'admin_materials')
# Create the upload folder if it doesn't exist
if not os.path.exists(UPLOAD_MATERIALS_FOLDER):
    os.makedirs(UPLOAD_MATERIALS_FOLDER)
app.config['UPLOAD_MATERIALS_FOLDER'] = UPLOAD_MATERIALS_FOLDER

# Allowed extensions for admin-uploaded materials
ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx', 'txt'} # Added document extensions


# Helper function to check allowed file extensions
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

client = MongoClient(MONGO_URI)
db = client.get_database(DB_NAME)

students_collection = db[STUDENT_COLLECTION]
admins_collection = db[ADMIN_COLLECTION]
courses_collection = db[COURSE_COLLECTION]
study_materials_collection = db[STUDY_MATERIALS_COLLECTION]
user_notes_collection = db[USER_NOTES_COLLECTION] # Not used in this app.py, but kept for consistency

@app.route('/')
def hello_world():
    return 'Hello, World!'

@app.route('/test_db')
def test_database_connection():
    try:
        client.admin.command('ping')
        return "Successfully connected to MongoDB Atlas!"
    except Exception as e:
        return f"Could not connect to MongoDB Atlas: {e}"

@app.route('/api/auth/signup/student', methods=['POST'])
def signup_student():
    data = request.get_json()
    full_name = data.get('fullName')
    email = data.get('email')
    password = data.get('password')

    if not full_name or not email or not password:
        return jsonify({'message': 'Missing required fields'}), 400

    if students_collection.find_one({'email': email}):
        return jsonify({'message': 'Email already exists'}), 409

    salt = gensalt()
    hashed_password = hashpw(password.encode('utf-8'), salt)

    student_data = {'fullName': full_name, 'email': email, 'password': hashed_password, 'salt': salt}
    students_collection.insert_one(student_data)

    return jsonify({'message': 'Student registered successfully'}), 201

@app.route('/api/auth/login/student', methods=['POST'])
def login_student():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Missing email or password'}), 400

    student = students_collection.find_one({'email': email})

    if student:
        stored_password = student.get('password')
        if isinstance(stored_password, bytes) and checkpw(password.encode('utf-8'), stored_password):
            session['user_id'] = str(student['_id'])
            session['username'] = student['fullName']
            session['role'] = 'student'
            return jsonify({'message': 'Student login successful', 'role': 'student'}), 200

    return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/api/auth/login/admin', methods=['POST'])
def login_admin():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Missing username or password'}), 400

    admin = admins_collection.find_one({'username': username})

    if admin:
        stored_password_hash = admin.get('password')
        if stored_password_hash and isinstance(stored_password_hash, bytes) and checkpw(password.encode('utf-8'), stored_password_hash):
            session['user_id'] = str(admin['_id'])
            session['username'] = admin['username']
            session['role'] = 'admin'
            return jsonify({'message': 'Admin login successful', 'role': 'admin'}), 200

    return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/api/check_auth', methods=['GET'])
def check_auth():
    if 'user_id' in session:
        return jsonify({'isAuthenticated': True, 'role': session['role'], 'username': session['username']}), 200
    return jsonify({'isAuthenticated': False}), 200

@app.route('/api/logout', methods=['POST'])
def logout_user():
    session.clear()
    return jsonify({"message": "Successfully logged out"}), 200

@app.route('/api/admin/setup', methods=['POST'])
def admin_setup():
    if admins_collection.find_one({'username': 'superadmin'}):
        return jsonify({'message': 'Admin user already exists'}), 409

    hashed_password = hashpw('supersecurepassword'.encode('utf-8'), gensalt())
    admins_collection.insert_one({'username': 'superadmin', 'password': hashed_password, 'role': 'admin'})
    return jsonify({'message': 'Superadmin created successfully'}), 201

@app.route('/api/courses', methods=['GET'])
def get_courses():
    courses = list(courses_collection.find({}, {'_id': 0, 'code': 1, 'title': 1}))
    return jsonify(courses), 200

@app.route('/api/courses/<course_code>/years', methods=['GET'])
def get_years(course_code):
    course = courses_collection.find_one({'code': course_code}, {'_id': 0, 'years': 1})
    if course:
        years = [y['year'] for y in course.get('years', [])]
        return jsonify(years), 200
    return jsonify([]), 404

@app.route('/api/courses/<course_code>/years/<int:year>/semesters', methods=['GET'])
def get_semesters(course_code, year):
    course = courses_collection.find_one({'code': course_code}, {'_id': 0, 'years': 1})
    if course:
        year_data = next((y for y in course.get('years', []) if y['year'] == year), None)
        if year_data:
            semesters = [s['semester'] for s in year_data.get('semesters', [])]
            return jsonify(semesters), 200
    return jsonify([]), 404

@app.route('/api/courses/<course_code>/years/<int:year>/semesters/<int:semester>/subjects', methods=['GET'])
def get_subjects_route(course_code, year, semester):
    course = courses_collection.find_one({'code': course_code}, {'_id': 0, 'years': 1})
    if course:
        year_data = next((y for y in course.get('years', []) if y['year'] == year), None)
        if year_data:
            semester_data = next((s for s in year_data.get('semesters', []) if s['semester'] == semester), None)
            if semester_data:
                return jsonify(semester_data.get('subjects', [])), 200
    return jsonify([]), 404

@app.route('/api/search/subjects', methods=['GET'])
def search_subjects():
    search_term = request.args.get('q', '').strip()
    if not search_term:
        return jsonify([]), 200

    pipeline = [
        {"$unwind": "$years"},
        {"$unwind": "$years.semesters"},
        {"$unwind": "$years.semesters.subjects"},
        {"$match": {"years.semesters.subjects": {"$regex": search_term, "$options": "i"}}},
        {"$project": {
            "_id": 0,
            "subjectName": "$years.semesters.subjects",
            "courseName": "$title",
            "courseCode": "$code",
            "year": "$years.year",
            "semester": "$years.semesters.semester"
        }}
    ]

    results = list(courses_collection.aggregate(pipeline))
    return jsonify(results), 200

def is_admin():
    return session.get('role') == 'admin'

def admin_required(f):
    @wraps(f) # Use @wraps to preserve function metadata
    def wrapper(*args, **kwargs):
        if not is_admin():
            return jsonify({'message': 'Forbidden: Admin access required'}), 403
        return f(*args, **kwargs)
    return wrapper

# --- Admin Material Management ---
@app.route('/api/admin/materials/add', methods=['POST'])
@admin_required
def admin_add_material():
    data = request.get_json()
    title = data.get('title')
    course_code = data.get('courseCode')
    year = data.get('year')
    semester = data.get('semester')
    subject = data.get('subject')
    material_format = data.get('materialFormat', '')
    material_category = data.get('materialCategory', '')
    content_url = data.get('contentUrl')

    if not all([title, course_code, year, semester, subject, material_format, material_category]):
        return jsonify({'message': 'Missing required fields'}), 400

    # Ensure material_category is valid
    if material_category not in ['syllabus', 'notes', 'paper']:
        return jsonify({'message': 'Invalid material Category. Must be one of: syllabus, notes, paper'}), 400

    # This endpoint now handles only URL-based formats (Video, Link)
    if material_format not in ['Video', 'Link']:
        return jsonify({'message': 'Invalid material format for this endpoint. Use /api/admin/materials/upload for files.'}), 400

    if not content_url:
        return jsonify({'message': f"Content URL is required for {material_format} format"}), 400

    # Basic validation for year and semester if they are expected as integers
    try:
        year = int(year)
        semester = int(semester)
    except ValueError:
        return jsonify({'message': 'Year and Semester must be valid numbers.'}), 400

    material_doc = {
        'title': title,
        'courseCode': course_code,
        'year': year,
        'semester': semester,
        'subject': subject,
        'materialFormat': material_format,
        'materialCategory': material_category,
        'contentUrl': content_url,
        'uploadedBy': session.get('username'),
        'uploadedAt': datetime.utcnow()
    }

    try:
        study_materials_collection.insert_one(material_doc)
        return jsonify({'message': 'Material added successfully'}), 201
    except Exception as e:
        print(f"Error adding material: {e}")
        return jsonify({'message': 'Failed to add material', 'error': str(e)}), 500

# --- REINSTATED: Admin Material Upload Endpoint ---
@app.route('/api/admin/materials/upload', methods=['POST'])
@admin_required
def upload_admin_material():
    # Check if a file was sent
    if 'file' not in request.files:
        return jsonify({'message': 'No file part in the request'}), 400

    file = request.files['file']
    # If the user does not select a file, the browser submits an empty file without a filename.
    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400

    # Ensure file is allowed and process it
    if file and allowed_file(file.filename):
        try:
            # Get other form data
            title = request.form.get('title')
            course_code = request.form.get('courseCode')
            year = request.form.get('year')
            semester = request.form.get('semester')
            subject = request.form.get('subject')
            material_format = request.form.get('materialFormat')
            material_category = request.form.get('materialCategory')

            if not all([title, course_code, year, semester, subject, material_format, material_category]):
                return jsonify({'message': 'Missing required form data for material'}), 400

            if material_category not in ['syllabus', 'notes', 'paper']: # Validate category for uploads too
                return jsonify({'message': 'Invalid material Category. Must be one of: syllabus, notes, paper'}), 400

            # Secure the filename before saving
            filename = f"{uuid.uuid4().hex}_{secure_filename(file.filename)}"
            file_path = os.path.join(app.config['UPLOAD_MATERIALS_FOLDER'], filename)
            file.save(file_path)

            # Construct the URL to access the uploaded file
            content_url = f"/static/uploads/admin_materials/{filename}"

            # Save material data to MongoDB
            material_entry = {
                'title': title,
                'courseCode': course_code,
                'year': int(year), # Ensure year is stored as int
                'semester': int(semester), # Ensure semester is stored as int
                'subject': subject,
                'materialFormat': material_format,
                'materialCategory': material_category,
                'contentUrl': content_url, # Store the URL to the uploaded file
                'fileName': filename, # Store original filename for potential future use (e.g., deletion)
                'uploadedBy': session.get('username'), # Assuming admin username is in session
                'uploadedAt': datetime.utcnow()
            }
            
            inserted_result = study_materials_collection.insert_one(material_entry)
            
            material_entry['_id'] = str(inserted_result.inserted_id) # Convert ObjectId to string for JSON serialization

            return jsonify({'message': 'Material uploaded and added successfully', 'material': material_entry}), 201

        except ValueError as ve: # Catch specific ValueError for int conversion
            print(f"Validation error: {ve}")
            return jsonify({'message': f'Invalid data provided: {ve}'}), 400
        except Exception as e:
            print(f"Error uploading material: {e}")
            return jsonify({'message': 'Server error during file upload', 'error': str(e)}), 500
    else:
        return jsonify({'message': 'File type not allowed or no file provided'}), 400

# --- Get Materials for Student View ---
@app.route('/api/materials/<string:course_code>/<int:year>/<int:semester>/<string:subject>', methods=['GET'])
def get_study_materials(course_code, year, semester, subject):
    try:
        material_format = request.args.get('materialFormat')
        material_category = request.args.get('materialCategory')

        query = {
            'courseCode': course_code,
            'year': year,
            'semester': semester,
            'subject': subject
        }
        if material_format:
            query['materialFormat'] = material_format
        if material_category:
            query['materialCategory'] = material_category # match DB case

        materials_cursor = study_materials_collection.find(query)

        materials_list = []
        for material in materials_cursor:
            material['_id'] = str(material['_id'])
            if isinstance(material.get('uploadedAt'), datetime):
                material['uploadedAt'] = material['uploadedAt'].isoformat()
            materials_list.append(material)

        return jsonify(materials_list), 200
    except Exception as e:
        print(f"Error retrieving materials: {e}")
        return jsonify({'message': 'Failed to retrieve materials', 'error': str(e)}), 500

# --- Get Materials for Admin View (with filters) ---
@app.route('/api/admin/materials', methods=['GET'])
@admin_required
def admin_get_materials():
    course_code = request.args.get('courseCode')
    year = request.args.get('year')
    semester = request.args.get('semester')
    subject = request.args.get('subject')

    query = {}
    if course_code:
        query['courseCode'] = course_code
    if year:
        try:
            query['year'] = int(year) # Ensure year is int
        except ValueError:
            return jsonify({'message': 'Invalid year format, must be integer'}), 400
    if semester:
        try:
            query['semester'] = int(semester) # Ensure semester is int
        except ValueError:
            return jsonify({'message': 'Invalid semester format, must be integer'}), 400
    if subject:
        query['subject'] = subject

    try:
        materials = list(study_materials_collection.find(query))
        for material in materials:
            material['_id'] = str(material['_id']) # Convert ObjectId to string for JSON serialization
            if isinstance(material.get('uploadedAt'), datetime): # Convert datetime to string for JSON
                material['uploadedAt'] = material['uploadedAt'].isoformat()
        return jsonify(materials), 200
    except Exception as e:
        print(f"Error fetching materials for admin: {e}")
        return jsonify({'message': 'Failed to fetch materials', 'error': str(e)}), 500

# --- Delete Material ---
@app.route('/api/admin/materials/<string:material_id>', methods=['DELETE'])
@admin_required
def admin_delete_material(material_id):
    try:
        # Validate material_id as a valid ObjectId
        if not ObjectId.is_valid(material_id):
            return jsonify({'message': 'Invalid Material ID format'}), 400

        # Before deleting from DB, check if it's a file and delete the file from server
        material_doc = study_materials_collection.find_one({'_id': ObjectId(material_id)})
        if material_doc and 'fileName' in material_doc and material_doc.get('materialFormat') in ['PDF', 'Image', 'Document']:
            file_to_delete_path = os.path.join(app.config['UPLOAD_MATERIALS_FOLDER'], material_doc['fileName'])
            if os.path.exists(file_to_delete_path):
                try:
                    os.remove(file_to_delete_path)
                    print(f"Deleted file from server: {file_to_delete_path}")
                except Exception as e:
                    print(f"Error deleting file from server: {e}")
                    # Log error but proceed with DB deletion

        result = study_materials_collection.delete_one({'_id': ObjectId(material_id)})

        if result.deleted_count == 1:
            return jsonify({'message': 'Material deleted successfully'}), 200
        else:
            return jsonify({'message': 'Material not found'}), 404
    except Exception as e:
        print(f"Error deleting material: {e}")
        return jsonify({'message': 'Failed to delete material', 'error': str(e)}), 500


# --- Update Material ---
@app.route('/api/admin/materials/<string:material_id>', methods=['PUT'])
@admin_required
def admin_update_material(material_id):
    data = request.get_json()

    # Validate material_id as a valid ObjectId
    if not ObjectId.is_valid(material_id):
        return jsonify({'message': 'Invalid Material ID format'}), 400

    # Fields that can be updated
    update_fields = [
        'title', 'materialFormat', 'materialCategory', 'contentUrl',
        'courseCode', 'year', 'semester', 'subject'
    ]

    update_doc = {}
    for field in update_fields:
        if field in data: # Only update if the field is present in the request body
            # Specific type conversion for year/semester if they are updated
            if field in ['year', 'semester']:
                try:
                    update_doc[field] = int(data[field])
                except ValueError:
                    return jsonify({'message': f"Invalid format for {field}. Must be an integer."}), 400
            else:
                update_doc[field] = data[field]

    if not update_doc:
        return jsonify({'message': 'No fields provided for update'}), 400

    # Basic validation for materialFormat and associated content
    if 'materialFormat' in update_doc:
        material_format = update_doc['materialFormat']
        # If materialFormat is changing to a URL-based type, contentUrl becomes required
        if material_format in ['Video', 'Link'] and ('contentUrl' not in data or not data['contentUrl']):
            return jsonify({'message': f"Content URL is required for {material_format} format"}), 400
        # If materialFormat is changing to a file-based type, ensure 'fileName' is handled in the future if updates are made through PUT
        # For now, PUT is expected to update metadata, not re-upload files.
        if material_format in ['PDF', 'Image', 'Document'] and 'contentUrl' not in data:
            # If a file-based material is being updated, it should retain its contentUrl.
            # If the user wants to *change* the file, they'd need a separate upload mechanism.
            # Here, we assume contentUrl won't be empty for these types if it's not being changed
            pass # No strict validation for contentUrl on file types if it's not being changed

    # Also validate new category if it's provided
    if 'materialCategory' in update_doc:
        if update_doc['materialCategory'] not in ['syllabus', 'notes', 'paper']:
            return jsonify({'message': 'Invalid material Category. Must be one of: syllabus, notes, paper'}), 400

    try:
        result = study_materials_collection.update_one(
            {'_id': ObjectId(material_id)},
            {'$set': update_doc}
        )

        if result.matched_count == 0:
            return jsonify({'message': 'Material not found'}), 404
        elif result.modified_count == 0:
            return jsonify({'message': 'No changes made to material (data was identical or material not found)'}), 200
        else:
            return jsonify({'message': 'Material updated successfully'}), 200
    except Exception as e:
        print(f"Error updating material: {e}")
        return jsonify({'message': 'Failed to update material', 'error': str(e)}), 500

# --- Static File Serving ---
@app.route('/static/uploads/admin_materials/<filename>')
def serve_admin_material_file(filename):
    # This route serves files from the UPLOAD_MATERIALS_FOLDER
    # Ensure this folder is correctly configured and accessible
    print(f"Attempting to serve file: {filename} from {app.config['UPLOAD_MATERIALS_FOLDER']}")
    try:
        return send_from_directory(app.config['UPLOAD_MATERIALS_FOLDER'], filename)
    except FileNotFoundError:
        print(f"File not found: {filename} in {app.config['UPLOAD_MATERIALS_FOLDER']}")
        # You might want to log this or return a more specific error,
        # or handle it with an @app.errorhandler(404) if it should redirect.
        return jsonify({'message': 'File not found'}), 404

#PASSWORD CHANGE
@app.route('/api/admin/change-password', methods=['POST'])
@admin_required # Your admin login decorator
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
        # Assuming user IDs in session are strings, convert to ObjectId for MongoDB lookup
        user = admins_collection.find_one({'_id': ObjectId(user_id)})
    except Exception as e:
        # Log the error for debugging purposes
        print(f"Error fetching user in change_password: {e}")
        return jsonify({'message': 'Internal server error while fetching user data.'}), 500

    if not user:
        return jsonify({'message': 'User not found'}), 404

    stored_password_hash = user.get('password') # Use .get() for safety

    if stored_password_hash is None:
        return jsonify({'message': 'Password hash not found for user.'}), 500
    if isinstance(stored_password_hash, str):
        stored_password_hash_bytes = stored_password_hash.encode('utf-8')
    elif isinstance(stored_password_hash, bytes):
        stored_password_hash_bytes = stored_password_hash
    else:
        print(f"Unexpected type for stored password hash: {type(stored_password_hash)}")
        return jsonify({'message': 'Invalid stored password hash format.'}), 500

    # Verify current password using bcrypt.checkpw
    if not checkpw(current_password.encode('utf-8'), stored_password_hash_bytes):
        return jsonify({'message': 'Incorrect current password'}), 403

    # Basic new password validation (you might have more robust frontend validation)
    if len(new_password) < 6: # Example: Minimum password length
        return jsonify({'message': 'New password must be at least 6 characters long.'}), 400

    # Hash the new password using bcrypt.hashpw
    hashed_new_password = Binary(hashpw(new_password.encode('utf-8'), gensalt()))

    try:
        admins_collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'password': hashed_new_password}}
        )
        return jsonify({'message': 'Password changed successfully'}), 200
    except Exception as e:
        print(f"Error updating password in change_password: {e}")
        return jsonify({'message': 'Internal server error while updating password.'}), 500


#USERNAME CHANGE
@app.route('/api/admin/change-username', methods=['POST'])
@admin_required # Your admin login decorator
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

    # Check if username already exists (optional but recommended)
    if admins_collection.find_one({'username': new_username, '_id': {'$ne': ObjectId(user_id)}}):
        return jsonify({'message': 'Username already taken'}), 409

    # Update username
    admins_collection.update_one(
        {'_id': ObjectId(user_id)},
        {'$set': {'username': new_username}}
    )
    return jsonify({'message': 'Username updated successfully'}), 200


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0') # Make it accessible from your frontend

