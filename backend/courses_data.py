# course_data.py

courses_data = [
    {"code": "BSC-CS", "title": "B.Sc. (Computer Science)", "years": [1, 2, 3]},
    {"code": "BCA", "title": "B.C.A. (Science)", "years": [1, 2, 3]},
    {"code": "MSC-CS", "title": "M.Sc. (Computer Science)", "years": [1, 2]},
    {"code": "MSC-CA", "title": "M.Sc. (Computer Application)", "years": [1, 2]}
]


def get_subjects(course_code, year, semester):
    subjects = []
    if course_code == "BSC-CS":
        if year == 1 and semester == 1:
            subjects = ["C Programming", "HTML & CSS", "Lab on C & HTML"]
        elif year == 1 and semester == 2:
            subjects = ["Advanced C Programming", "Relational Database Systems", "Lab on Advanced C & RDBMS"]
        elif year == 2 and semester == 3:
            subjects = ["Data Structures", "Advanced RDBMS", "Mini Project on Database"]
        elif year == 2 and semester == 4:
            subjects = ["Advanced Data Structures", "OOP in C++", "Lab on Data Structures & OOP"]
        elif year == 3 and semester == 5:
            subjects = ["System Programming", "Networking", "Web Programming (PHP, JavaScript)", "Core Java"]
        elif year == 3 and semester == 6:
            subjects = ["Operating System", "Software Engineering", "Compiler Construction", "Business Application -II"]
    elif course_code == "BCA":
        if year == 1 and semester == 1:
            subjects = ["Discrete Mathematics-I", "Programming in 'C' and Problem-Solving Methods", "Fundamentals of Statistics", "Fundamentals of Web Technologies (HTML, CSS)"]
        elif year == 1 and semester == 2:
            subjects = ["Discrete Mathematics-II", "Data structure", "Computer Organization", "Database Management System"]
        elif year == 2 and semester == 3:
            subjects = ["Operating System", "Computer Networks", "Java Programming"]
        elif year == 2 and semester == 4:
            subjects = ["Software Engineering", "Web Technologies", "Computer Graphics"]
        elif year == 3 and semester == 5:
            subjects = ["Advanced Java", "Python Programming", "Cloud Computing"]
        elif year == 3 and semester == 6:
            subjects = ["Artificial Intelligence", "Machine Learning", "Cyber Security"]
    elif course_code == "MSC-CS":
        if year == 1 and semester == 1:
            subjects = ["Python", "DAA", "MongoDB"]
        elif year == 1 and semester == 2:
            subjects = ["Advanced OS", "Android Development", "Data Mining"]
        elif year == 2 and semester == 3:
            subjects = ["Cloud Computing", "UX/UI", "Machine Learning"]
        elif year == 2 and semester == 4:
            subjects = ["Research Project & Industrial Training"]
    elif course_code == "MSC-CA":
        if year == 1 and semester == 1:
            subjects = ["Advanced Java", "Software Project Management", "Mobile App Development"]
        elif year == 1 and semester == 2:
            subjects = ["Machine Learning", "IoT", "Big Data Analytics"]
        elif year == 2 and semester == 3:
            subjects = ["Cloud Computing", "Cyber Security", "Data Science"]
        elif year == 2 and semester == 4:
            subjects = ["Research Project"]
    return subjects