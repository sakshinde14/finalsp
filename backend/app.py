from flask import Flask, request, jsonify, session, send_from_directory
from werkzeug.security import check_password_hash, generate_password_hash # Not directly used for bcrypt, but kept if you have other uses
from werkzeug.utils import secure_filename
from pymongo import MongoClient
from bcrypt import hashpw, checkpw, gensalt
from bson.binary import Binary # Not directly used for password, but kept if you use for other binary data
from flask_cors import CORS
from datetime import datetime
from bson.objectid import ObjectId
import os
from functools import wraps
import uuid

# --- Configuration ---
MONGO_URI = "mongodb+srv://sakshi:gaurinde@cluster0.vpbqv.mongodb.net/sp_db?retryWrites=true&w=majority&appName=Cluster0"
DB_NAME = "sp_db"
STUDENT_COLLECTION = "students"
ADMIN_COLLECTION = "admins"
COURSE_COLLECTION = "courses"
STUDY_MATERIALS_COLLECTION = "study_materials"

app = Flask(__name__)
app.config['SECRET_KEY'] = 'a_very_long_and_random_secret_key_here_that_is_unique_and_not_guessable'
CORS(app, supports_credentials=True)

# --- File Upload Configuration for Admin Materials ---
UPLOAD_MATERIALS_FOLDER = os.path.join(app.root_path, 'static', 'uploads', 'admin_materials')
if not os.path.exists(UPLOAD_MATERIALS_FOLDER):
    os.makedirs(UPLOAD_MATERIALS_FOLDER)
app.config['UPLOAD_MATERIALS_FOLDER'] = UPLOAD_MATERIALS_FOLDER

# --- File Upload Configuration for User Notes ---
UPLOAD_USER_NOTES_FOLDER = os.path.join(app.root_path, 'static', 'uploads', 'user_notes')
if not os.path.exists(UPLOAD_USER_NOTES_FOLDER):
    os.makedirs(UPLOAD_USER_NOTES_FOLDER)
app.config['UPLOAD_USER_NOTES_FOLDER'] = UPLOAD_USER_NOTES_FOLDER

# Allowed extensions for admin-uploaded materials
ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx', 'txt'}

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

def is_student():
    print(f"DEBUG: Inside is_student(). Session: {session.get('role')}")
    return session.get('role') == 'student'

def login_required(role=None):
    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            if 'user_id' not in session:
                return jsonify({'message': 'Unauthorized'}), 401
            if role and session.get('role') != role:
                return jsonify({'message': 'Forbidden'}), 403
            return f(*args, **kwargs)
        return wrapped
    return decorator

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

        if stored_password is None:
            print(f"DEBUG: Password hash not found for student: {email}")
            return jsonify({'message': 'Internal error: Password data missing for user.'}), 500

        if isinstance(stored_password, str):
            stored_password_bytes = stored_password.encode('utf-8')
        elif isinstance(stored_password, bytes):
            stored_password_bytes = stored_password
        else:
            print(f"DEBUG: Unexpected type for stored password: {type(stored_password)}")
            return jsonify({'message': 'Invalid stored password format.'}), 500

        if checkpw(password.encode('utf-8'), stored_password_bytes):
            session['user_id'] = str(student['_id'])
            session['username'] = student['fullName']
            session['role'] = 'student'
            print(f"DEBUG: Student login successful for {email}. Session after login: {session}")
            return jsonify({'message': 'Student login successful', 'role': 'student'}), 200
        else:
            print(f"DEBUG: Student login failed for {email} - incorrect password. Session: {session}")
            return jsonify({'message': 'Invalid credentials'}), 401
    else:
        print(f"DEBUG: Student login failed for {email} - user not found. Session: {session}")
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

# --- Public Course Browse Endpoints ---
@app.route('/api/courses', methods=['GET'])
def get_all_courses():
    all_courses_from_db = []
    for course_doc in courses_collection.find({}):
        total_years = len(course_doc.get('years', []))
        total_semesters = 0
        for year_data in course_doc.get('years', []):
            total_semesters += len(year_data.get('semesters', []))

        all_courses_from_db.append({
            "code": course_doc.get('code'),
            "title": course_doc.get('title'),
            "description": course_doc.get('description', 'No description available.'),
            "duration": f"{total_years} Years",
            "semesters": f"{total_semesters} Semesters"
        })
    return jsonify(all_courses_from_db)

@app.route('/api/courses/<course_code>', methods=['GET'])
def get_course_details(course_code):
    course_doc = courses_collection.find_one({"code": course_code})
    if course_doc:
        course_doc['_id'] = str(course_doc['_id'])
        return jsonify(course_doc)
    return jsonify({"message": "Course not found"}), 404

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

# --- Admin Material Management Endpoints ---
@app.route('/api/admin/materials/add', methods=['POST'])
@login_required(role='admin')
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

    if material_category not in ['syllabus', 'notes', 'paper']:
        return jsonify({'message': 'Invalid material Category. Must be one of: syllabus, notes, paper'}), 400

    if material_format not in ['Video', 'Link']:
        return jsonify({'message': 'Invalid material format for this endpoint. Use /api/admin/materials/upload for files.'}), 400

    if not content_url:
        return jsonify({'message': f"Content URL is required for {material_format} format"}), 400

    try:
        year = int(year)
        semester = int(semester)
    except ValueError:
        return jsonify({'message': 'Year and Semester must be valid numbers.'}), 400

    material_doc = {
        'title': title,
        'courseCode': course_code.upper(), # Standardize course code
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

@app.route('/api/admin/materials/upload', methods=['POST'])
@login_required(role='admin')
def upload_admin_material():
    if 'file' not in request.files:
        return jsonify({'message': 'No file part in the request'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        try:
            title = request.form.get('title')
            course_code = request.form.get('courseCode')
            year = request.form.get('year')
            semester = request.form.get('semester')
            subject = request.form.get('subject')
            material_format = request.form.get('materialFormat')
            material_category = request.form.get('materialCategory')

            if not all([title, course_code, year, semester, subject, material_format, material_category]):
                return jsonify({'message': 'Missing required form data for material'}), 400

            if material_category not in ['syllabus', 'notes', 'paper']:
                return jsonify({'message': 'Invalid material Category. Must be one of: syllabus, notes, paper'}), 400

            # Secure the filename and create a unique name
            filename = f"{uuid.uuid4().hex}_{secure_filename(file.filename)}"
            file_path = os.path.join(app.config['UPLOAD_MATERIALS_FOLDER'], filename)
            file.save(file_path)

            content_url = f"/static/uploads/admin_materials/{filename}"

            material_entry = {
                'title': title,
                'courseCode': course_code.upper(), # Standardize course code
                'year': int(year),
                'semester': int(semester),
                'subject': subject,
                'materialFormat': material_format, # This should be 'File' or specific like 'PDF', 'Image' etc.
                'materialCategory': material_category,
                'contentUrl': content_url,
                'fileName': filename,
                'uploadedBy': session.get('username'),
                'uploadedAt': datetime.utcnow()
            }

            inserted_result = study_materials_collection.insert_one(material_entry)

            material_entry['_id'] = str(inserted_result.inserted_id)

            return jsonify({'message': 'Material uploaded and added successfully', 'material': material_entry}), 201

        except ValueError as ve:
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
@login_required(role='admin')
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
@login_required(role='admin')
def admin_delete_material(material_id):
    try:
        if not ObjectId.is_valid(material_id):
            return jsonify({'message': 'Invalid Material ID format'}), 400

        material_doc = study_materials_collection.find_one({'_id': ObjectId(material_id)})

        # Check if it's a file stored on the server and delete it
        # Assuming 'File' is the materialFormat for all file uploads
        if material_doc and 'fileName' in material_doc and material_doc.get('materialFormat') in ['File', 'PDF', 'Image', 'Document', 'Text']: # Added more explicit formats based on potential frontend naming
            file_to_delete_path = os.path.join(app.config['UPLOAD_MATERIALS_FOLDER'], material_doc['fileName'])
            if os.path.exists(file_to_delete_path):
                try:
                    os.remove(file_to_delete_path)
                    print(f"Deleted file from server: {file_to_delete_path}")
                except Exception as e:
                    print(f"Error deleting file from server: {e}")
                    # Log error but proceed with DB deletion, as the main goal is to remove the record

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
@login_required(role='admin')
def admin_update_material(material_id):
    data = request.get_json()

    if not ObjectId.is_valid(material_id):
        return jsonify({'message': 'Invalid Material ID format'}), 400

    update_fields = [
        'title', 'materialFormat', 'materialCategory', 'contentUrl',
        'courseCode', 'year', 'semester', 'subject'
    ]

    update_doc = {}
    for field in update_fields:
        if field in data:
            if field in ['year', 'semester']:
                try:
                    update_doc[field] = int(data[field])
                except ValueError:
                    return jsonify({'message': f"Invalid format for {field}. Must be an integer."}), 400
            elif field == 'courseCode': # Standardize course code on update
                update_doc[field] = data[field].upper()
            else:
                update_doc[field] = data[field]

    if not update_doc:
        return jsonify({'message': 'No fields provided for update'}), 400

    if 'materialFormat' in update_doc:
        material_format = update_doc['materialFormat']
        if material_format in ['Video', 'Link'] and ('contentUrl' not in data or not data['contentUrl']):
            return jsonify({'message': f"Content URL is required for {material_format} format"}), 400
        # For file types, contentUrl is managed by upload endpoint, not direct PUT

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

# --- Admin Course Management Endpoints (Newly Added) ---
@app.route('/api/admin/courses', methods=['GET'])
@login_required(role='admin')
def admin_get_all_courses_for_admin():
    """
    Admin endpoint to get all courses with their full structure for management.
    """
    try:
        courses = list(courses_collection.find({})) # Fetch all courses
        for course in courses:
            course['_id'] = str(course['_id']) # Convert ObjectId to string
            # No need to convert inner ObjectIds unless you specifically need them
            # on the frontend for nested updates by _id. For now, course_code is key.
        return jsonify(courses), 200
    except Exception as e:
        print(f"Error fetching courses for admin: {e}")
        return jsonify({'message': 'Failed to fetch courses', 'error': str(e)}), 500

@app.route('/api/admin/courses', methods=['POST'])
@login_required(role='admin')
def admin_add_course():
    """
    Admin endpoint to add a new course with its complete structure (years, semesters, subjects).
    Expected data:
    {
        "code": "CS101",
        "title": "Introduction to Computer Science",
        "description": "...",
        "years": [
            {
                "year": 1,
                "semesters": [
                    {
                        "semester": 1,
                        "subjects": [
                            {"name": "Programming Fundamentals", "description": "..."}
                        ]
                    }
                ]
            }
        ]
    }
    """
    data = request.get_json()

    required_fields = ['code', 'title', 'description', 'years']
    if not all(field in data for field in required_fields):
        return jsonify({'message': f'Missing required fields: {", ".join(required_fields)}'}), 400

    course_code = data['code'].upper() # Standardize course code to uppercase
    if courses_collection.find_one({'code': course_code}):
        return jsonify({'message': f'Course with code {course_code} already exists'}), 409

    if not isinstance(data.get('years'), list):
        return jsonify({'message': 'Years must be a list'}), 400

    for year_data in data['years']:
        if not isinstance(year_data.get('year'), int) or not isinstance(year_data.get('semesters'), list):
            return jsonify({'message': 'Each year must have a numeric year and a list of semesters'}), 400
        for semester_data in year_data['semesters']:
            if not isinstance(semester_data.get('semester'), int) or not isinstance(semester_data.get('subjects'), list):
                return jsonify({'message': 'Each semester must have a numeric semester and a list of subjects'}), 400
            for subject_data in semester_data['subjects']:
                if not isinstance(subject_data.get('name'), str):
                    return jsonify({'message': 'Each subject must have a name string'}), 400
                if 'description' in subject_data and not isinstance(subject_data['description'], str):
                    return jsonify({'message': 'Subject description must be a string if provided'}), 400
                subject_data['materials'] = [] # Materials will be added via separate material endpoints

    new_course = {
        'code': course_code,
        'title': data['title'],
        'description': data['description'],
        'years': data['years']
    }

    try:
        courses_collection.insert_one(new_course)
        # Convert _id to string for the response
        new_course['_id'] = str(new_course['_id'])
        return jsonify({'message': 'Course added successfully', 'course': new_course}), 201
    except Exception as e:
        print(f"Error adding course: {e}")
        return jsonify({'message': 'Failed to add course', 'error': str(e)}), 500

@app.route('/api/admin/courses/<course_code>', methods=['PUT'])
@login_required(role='admin')
def admin_update_course(course_code):
    """
    Admin endpoint to update an existing course's details and its structure.
    The entire course document (excluding _id) should be sent.
    """
    data = request.get_json()

    required_fields = ['code', 'title', 'description', 'years']
    if not all(field in data for field in required_fields):
        return jsonify({'message': f'Missing required fields for update: {", ".join(required_fields)}'}), 400

    # Ensure the code in the URL matches the code in the payload
    if data['code'].upper() != course_code.upper():
        return jsonify({'message': 'Course code in URL and payload mismatch'}), 400

    if not isinstance(data.get('years'), list):
        return jsonify({'message': 'Years must be a list'}), 400

    for year_data in data['years']:
        if not isinstance(year_data.get('year'), int) or not isinstance(year_data.get('semesters'), list):
            return jsonify({'message': 'Each year must have a numeric year and a list of semesters'}), 400
        for semester_data in year_data['semesters']:
            if not isinstance(semester_data.get('semester'), int) or not isinstance(semester_data.get('subjects'), list):
                return jsonify({'message': 'Each semester must have a numeric semester and a list of subjects'}), 400
            for subject_data in semester_data['subjects']:
                if not isinstance(subject_data.get('name'), str):
                    return jsonify({'message': 'Each subject must have a name string'}), 400
                if 'description' in subject_data and not isinstance(subject_data['description'], str):
                    return jsonify({'message': 'Subject description must be a string if provided'}), 400

                # IMPORTANT: Remove 'materials' field from incoming subject data to prevent accidental overwrite
                # Materials are managed by separate material upload/management endpoints.
                if 'materials' in subject_data:
                    del subject_data['materials']


    updated_course = {
        'code': course_code.upper(), # Ensure consistent casing
        'title': data['title'],
        'description': data['description'],
        'years': data['years']
    }

    try:
        result = courses_collection.replace_one({'code': course_code.upper()}, updated_course)
        if result.matched_count == 0:
            return jsonify({'message': 'Course not found'}), 404

        # Convert _id to string for the response if the course was found
        # Fetch the updated course to return its _id if needed, or simply return the payload
        # For PUT, returning the sent payload (updated_course) is common as it represents the new state
        return jsonify({'message': 'Course updated successfully', 'course': updated_course}), 200
    except Exception as e:
        print(f"Error updating course {course_code}: {e}")
        return jsonify({'message': 'Failed to update course', 'error': str(e)}), 500

@app.route('/api/admin/courses/<course_code>', methods=['DELETE'])
@login_required(role='admin')
def admin_delete_course(course_code):
    """
    Admin endpoint to delete a course.
    Also deletes all associated study materials and their files from the server.
    """
    try:
        course_code_upper = course_code.upper()

        # 1. Delete the course document itself
        course_delete_result = courses_collection.delete_one({'code': course_code_upper})

        if course_delete_result.deleted_count == 0:
            return jsonify({'message': 'Course not found'}), 404

        # 2. Delete all study materials associated with this course from disk
        materials_on_disk = list(study_materials_collection.find(
            {'courseCode': course_code_upper, 'fileName': {'$exists': True}}, # Only materials that have a 'fileName' field
            {'fileName': 1} # Only fetch the filename
        ))

        for material in materials_on_disk:
            if 'fileName' in material:
                file_path = os.path.join(app.config['UPLOAD_MATERIALS_FOLDER'], material['fileName'])
                if os.path.exists(file_path):
                    try:
                        os.remove(file_path)
                        print(f"Deleted file from disk: {file_path}")
                    except Exception as e:
                        print(f"Error deleting file {file_path} from disk: {e}")

        # 3. Delete all study material records associated with this course from the database
        material_delete_result = study_materials_collection.delete_many({'courseCode': course_code_upper})
        print(f"Deleted {material_delete_result.deleted_count} material records associated with course {course_code}")

        return jsonify({'message': 'Course and all associated materials deleted successfully'}), 200
    except Exception as e:
        print(f"Error deleting course {course_code}: {e}")
        return jsonify({'message': 'Failed to delete course', 'error': str(e)}), 500

# --- Serve uploaded files (e.g., admin materials, user notes) ---
@app.route('/static/uploads/admin_materials/<filename>')
def serve_admin_material(filename):
    """Serves files uploaded by admins."""
    print(f"Attempting to serve file: {filename} from {app.config['UPLOAD_MATERIALS_FOLDER']}")
    try:
        return send_from_directory(app.config['UPLOAD_MATERIALS_FOLDER'], filename)
    except FileNotFoundError:
        print(f"File not found: {filename} in {app.config['UPLOAD_MATERIALS_FOLDER']}")
        return jsonify({'message': 'File not found'}), 404

@app.route('/static/uploads/user_notes/<filename>')
def serve_user_note(filename):
    """Serves user-uploaded notes."""
    print(f"Attempting to serve user note: {filename} from {app.config['UPLOAD_USER_NOTES_FOLDER']}")
    try:
        return send_from_directory(app.config['UPLOAD_USER_NOTES_FOLDER'], filename)
    except FileNotFoundError:
        print(f"User note file not found: {filename} in {app.config['UPLOAD_USER_NOTES_FOLDER']}")
        return jsonify({'message': 'File not found'}), 404

# One line analysis: The code adds missing imports for password hashing to the flask app.
# --- Profile Management Endpoints ---
@app.route('/api/profile', methods=['GET'])
@login_required()
def get_profile():
    """Get current user's profile data"""
    try:
        user_id = session.get('user_id')
        role = session.get('role')
        
        if role == 'admin':
            user = admins_collection.find_one({'_id': ObjectId(user_id)})
            if user:
                return jsonify({
                    'role': 'admin',
                    'username': user.get('username'),
                    'id': str(user['_id'])
                }), 200
        elif role == 'student':
            user = students_collection.find_one({'_id': ObjectId(user_id)})
            if user:
                return jsonify({
                    'role': 'student',
                    'email': user.get('email'),
                    'fullName': user.get('fullName'),
                    'id': str(user['_id'])
                }), 200
        
        return jsonify({'message': 'User not found'}), 404
    except Exception as e:
        print(f"Error fetching profile: {e}")
        return jsonify({'message': 'Failed to fetch profile'}), 500

@app.route('/api/admin/change-password', methods=['POST'])
@login_required(role='admin')
def admin_change_password():
    """Change admin password"""
    data = request.get_json()
    current_password = data.get('currentPassword')
    new_password = data.get('newPassword')
    
    if not current_password or not new_password:
        return jsonify({'message': 'Current password and new password are required'}), 400
    
    try:
        user_id = session.get('user_id')
        admin = admins_collection.find_one({'_id': ObjectId(user_id)})
        
        if not admin:
            return jsonify({'message': 'Admin not found'}), 404
        
        # Verify current password
        stored_password = admin.get('password')
        if not checkpw(current_password.encode('utf-8'), stored_password):
            return jsonify({'message': 'Current password is incorrect'}), 401
        
        # Hash new password
        new_hashed_password = hashpw(new_password.encode('utf-8'), gensalt())
        
        # Update password in database
        admins_collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'password': new_hashed_password}}
        )
        
        return jsonify({'message': 'Password changed successfully'}), 200
    except Exception as e:
        print(f"Error changing admin password: {e}")
        return jsonify({'message': 'Failed to change password'}), 500

@app.route('/api/admin/change-username', methods=['POST'])
@login_required(role='admin')
def admin_change_username():
    """Change admin username"""
    data = request.get_json()
    new_username = data.get('newUsername')
    
    if not new_username:
        return jsonify({'message': 'New username is required'}), 400
    
    try:
        user_id = session.get('user_id')
        
        # Check if username already exists
        existing_admin = admins_collection.find_one({'username': new_username})
        if existing_admin and str(existing_admin['_id']) != user_id:
            return jsonify({'message': 'Username already exists'}), 409
        
        # Update username
        result = admins_collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'username': new_username}}
        )
        
        if result.modified_count == 0:
            return jsonify({'message': 'No changes made or admin not found'}), 404
        
        # Update session username
        session['username'] = new_username
        
        return jsonify({'message': 'Username updated successfully'}), 200
    except Exception as e:
        print(f"Error changing admin username: {e}")
        return jsonify({'message': 'Failed to update username'}), 500

@app.route('/api/student/change-password', methods=['POST'])
@login_required(role='student')
def student_change_password():
    """Change student password"""
    data = request.get_json()
    current_password = data.get('currentPassword')
    new_password = data.get('newPassword')
    
    if not current_password or not new_password:
        return jsonify({'message': 'Current password and new password are required'}), 400
    
    try:
        user_id = session.get('user_id')
        student = students_collection.find_one({'_id': ObjectId(user_id)})
        
        if not student:
            return jsonify({'message': 'Student not found'}), 404
        
        # Verify current password
        stored_password = student.get('password')
        if isinstance(stored_password, str):
            stored_password = stored_password.encode('utf-8')
        
        if not checkpw(current_password.encode('utf-8'), stored_password):
            return jsonify({'message': 'Current password is incorrect'}), 401
        
        # Hash new password
        new_hashed_password = hashpw(new_password.encode('utf-8'), gensalt())
        
        # Update password in database
        students_collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'password': new_hashed_password}}
        )
        
        return jsonify({'message': 'Password changed successfully'}), 200
    except Exception as e:
        print(f"Error changing student password: {e}")
        return jsonify({'message': 'Failed to change password'}), 500

@app.route('/api/student/change-email', methods=['POST'])
@login_required(role='student')
def student_change_email():
    """Change student email"""
    data = request.get_json()
    new_email = data.get('newEmail')
    
    if not new_email:
        return jsonify({'message': 'New email is required'}), 400
    
    try:
        user_id = session.get('user_id')
        
        # Check if email already exists
        existing_student = students_collection.find_one({'email': new_email})
        if existing_student and str(existing_student['_id']) != user_id:
            return jsonify({'message': 'Email already exists'}), 409
        
        # Update email
        result = students_collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'email': new_email}}
        )
        
        if result.modified_count == 0:
            return jsonify({'message': 'No changes made or student not found'}), 404
        
        return jsonify({'message': 'Email updated successfully'}), 200
    except Exception as e:
        print(f"Error changing student email: {e}")
        return jsonify({'message': 'Failed to update email'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)