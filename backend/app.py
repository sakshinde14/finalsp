from flask import Flask, request, jsonify, session
from pymongo import MongoClient
from bcrypt import hashpw, checkpw, gensalt
from flask_cors import CORS
from datetime import datetime

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

client = MongoClient(MONGO_URI)
db = client.get_database(DB_NAME)

students_collection = db[STUDENT_COLLECTION]
admins_collection = db[ADMIN_COLLECTION]
courses_collection = db[COURSE_COLLECTION]
study_materials_collection = db[STUDY_MATERIALS_COLLECTION]
user_notes_collection = db[USER_NOTES_COLLECTION]

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
    def wrapper(*args, **kwargs):
        if not is_admin():
            return jsonify({'message': 'Forbidden: Admin access required'}), 403
        return f(*args, **kwargs)
    wrapper.__name__ = f.__name__
    return wrapper

@app.route('/api/admin/materials/add', methods=['POST'])
@admin_required
def admin_add_material():
    data = request.get_json()
    course_code = data.get('courseCode')
    year = data.get('year')
    semester = data.get('semester')
    subject = data.get('subject')
    material_format = data.get('materialFormat', '')  # rename to match frontend
    material_category = data.get('materialCategory', '')  # PDF, Link, etc.

    content_url = data.get('contentUrl')
    text_content = data.get('textContent')

    if not all([course_code, year, semester, subject, material_format]):
        return jsonify({'message': 'Missing required fields'}), 400

    if material_category not in ['syllabus', 'notes', 'paper']:
        return jsonify({'message': 'Invalid material type. Must be one of: syllabus, notes, paper'}), 400

    material_doc = {
        'courseCode': course_code,
        'year': year,
        'semester': semester,
        'subject': subject,
        'materialFormat': material_format,
        'materialCategory': material_category, 
        'uploadedBy': session.get('username'),
        'uploadedAt': datetime.utcnow()
    }

    if material_category == 'notes' and not content_url:
        return jsonify({'message': 'Content URL is required for notes'}), 400
    if material_category == 'syllabus' and not content_url:
        return jsonify({'message': 'Content URL is required for syllabus'}), 400
    if material_category == 'paper' and not content_url:
        return jsonify({'message': 'Content URL is required for paper'}), 400

    if content_url:
        material_doc['contentUrl'] = content_url
    if text_content:
        material_doc['textContent'] = text_content

    try:
        study_materials_collection.insert_one(material_doc)
        return jsonify({'message': 'Material added successfully'}), 201
    except Exception as e:
        return jsonify({'message': 'Failed to add material', 'error': str(e)}), 500

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
            query['materialCategory'] = material_category  # match DB case

        materials_cursor = study_materials_collection.find(query)

        materials_list = []
        for material in materials_cursor:
            material['_id'] = str(material['_id'])
            if isinstance(material.get('uploadedAt'), datetime):
                material['uploadedAt'] = material['uploadedAt'].isoformat()
            material['typeLabel'] = material.get('materialFormat', '')
            materials_list.append(material)

        return jsonify(materials_list), 200
    except Exception as e:
        return jsonify({'message': 'Failed to retrieve materials', 'error': str(e)}), 500




# --- NEW: User Notes Endpoints (Placeholders for later) ---
# @app.route('/api/user/notes/add', methods=['POST'])
# def add_user_note():
#     pass

# @app.route('/api/user/notes', methods=['GET'])
# def get_user_notes():
#     pass

# @app.route('/api/user/notes/<string:note_id>', methods=['PUT'])
# def update_user_note(note_id):
#     pass

# @app.route('/api/user/notes/<string:note_id>', methods=['DELETE'])
# def delete_user_note(note_id):
#     pass

# --- NEW: Favorites Endpoints (Placeholders for later) ---
# @app.route('/api/favorites/add', methods=['POST'])
# def add_favorite():
#     pass

# @app.route('/api/favorites', methods=['GET'])
# def get_favorites():
#     pass

# --- NEW: Profile Management Endpoints (Placeholders for later) ---
# @app.route('/api/profile/update_username', methods=['PUT'])
# def update_username():
#     pass

# @app.route('/api/profile/update_password', methods=['PUT'])
# def update_password():
#     pass


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0') # Make it accessible from your frontend