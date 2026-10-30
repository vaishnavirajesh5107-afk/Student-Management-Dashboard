from flask import Flask, jsonify, request
from flask_cors import CORS
from database import init_db
from models import query_all, query_one, run_write, placeholder

app = Flask(__name__)
CORS(app)
P = placeholder()

def ok(data=None, status=200):
    return jsonify({"success": True, "data": data}), status

def error(message, status=400):
    return jsonify({"success": False, "message": message}), status

def get_student(register_no):
    return query_one(f"SELECT * FROM students WHERE register_no={P}", (register_no,))

@app.get("/api/health")
def health():
    return ok({"message": "Student Dashboard API is running"})

@app.post("/api/login")
def login():
    body = request.get_json(silent=True) or {}
    register_no = str(body.get("register_no", "")).strip()
    password = str(body.get("password", "")).strip()
    # Demo project login; replace with hashed passwords before real deployment.
    if not register_no or not password:
        return error("Enter register number and password.")
    student = get_student(register_no)
    if not student or password != "password123":
        return error("Invalid register number or password.", 401)
    return ok({"student": student, "token": register_no})

@app.get("/api/student/<register_no>")
def student_profile(register_no):
    student = get_student(register_no)
    return ok(student) if student else error("Student not found.", 404)

@app.put("/api/student/<register_no>")
def update_profile(register_no):
    body = request.get_json(silent=True) or {}

    name = str(body.get("name", "")).strip()
    email = str(body.get("email", "")).strip()
    phone = str(body.get("phone", "")).strip()
    year_level = str(body.get("year_level", "III Year")).strip()
    semester = str(body.get("semester", "Semester 5")).strip()

    if not name:
        return error("Name is required.")

    valid_years = ["I Year", "II Year", "III Year", "IV Year"]
    valid_semesters = [f"Semester {i}" for i in range(1, 9)]

    if year_level not in valid_years:
        return error("Invalid academic year.")

    if semester not in valid_semesters:
        return error("Invalid semester.")

    run_write(
        f"""UPDATE students
        SET name={P}, email={P}, phone={P},
            year_level={P}, semester={P}
        WHERE register_no={P}""",
        (name, email, phone, year_level, semester, register_no)
    )

    student = get_student(register_no)
    return ok(student) if student else error("Student not found.", 404)
@app.get("/api/subjects/<register_no>")
def subjects(register_no):
    student = get_student(register_no)
    if not student:
        return error("Student not found.", 404)
    rows = query_all(f"SELECT id, subject_code, subject_name, credits, marks FROM subjects WHERE student_id={P} ORDER BY id",
                     (student["id"],))
    return ok(rows)

@app.post("/api/subjects/<register_no>")
def add_subject(register_no):
    student = get_student(register_no)
    if not student:
        return error("Student not found.", 404)
    body = request.get_json(silent=True) or {}
    subject_name = str(body.get("subject_name", "")).strip()
    if not subject_name:
        return error("Subject name is required.")
    try:
        credits = max(1, int(body.get("credits", 3)))
        marks = min(100, max(0, float(body.get("marks", 0))))
    except (TypeError, ValueError):
        return error("Credits and marks must be valid numbers.")
    code = str(body.get("subject_code", "")).strip()
    run_write(f"INSERT INTO subjects (student_id,subject_code,subject_name,credits,marks) VALUES ({P},{P},{P},{P},{P})",
              (student["id"], code, subject_name, credits, marks))
    return ok({"message": "Subject added."}, 201)

@app.put("/api/subjects/item/<int:subject_id>")
def update_subject(subject_id):
    body = request.get_json(silent=True) or {}
    try:
        marks = min(100, max(0, float(body.get("marks", 0))))
    except (TypeError, ValueError):
        return error("Marks must be a number from 0 to 100.")
    run_write(f"UPDATE subjects SET marks={P} WHERE id={P}", (marks, subject_id))
    return ok({"message": "Marks updated."})

@app.get("/api/attendance/<register_no>")
def attendance(register_no):
    student = get_student(register_no)
    if not student:
        return error("Student not found.", 404)
    rows = query_all(f"SELECT id,subject_name,total_classes,attended_classes FROM attendance WHERE student_id={P} ORDER BY id",
                     (student["id"],))
    for row in rows:
        total = int(row.get("total_classes") or 0)
        row["percentage"] = round((int(row.get("attended_classes") or 0) / total * 100), 1) if total else 0
    return ok(rows)

@app.post("/api/attendance/<register_no>")
def add_attendance(register_no):
    student = get_student(register_no)
    if not student:
        return error("Student not found.", 404)
    body = request.get_json(silent=True) or {}
    name = str(body.get("subject_name", "")).strip()
    try:
        total = int(body.get("total_classes", 0))
        attended = int(body.get("attended_classes", 0))
    except (TypeError, ValueError):
        return error("Class counts must be whole numbers.")
    if not name or total < 0 or attended < 0 or attended > total:
        return error("Enter a subject and valid class counts.")
    run_write(f"INSERT INTO attendance (student_id,subject_name,total_classes,attended_classes) VALUES ({P},{P},{P},{P})",
              (student["id"], name, total, attended))
    return ok({"message": "Attendance saved."}, 201)

@app.get("/api/results/<register_no>")
def results(register_no):
    student = get_student(register_no)
    if not student:
        return error("Student not found.", 404)
    rows = query_all(f"SELECT subject_code,subject_name,credits,marks FROM subjects WHERE student_id={P} ORDER BY id",
                     (student["id"],))
    for row in rows:
        marks = float(row.get("marks") or 0)
        row["grade"] = "O" if marks >= 90 else "A+" if marks >= 80 else "A" if marks >= 70 else "B+" if marks >= 60 else "B" if marks >= 50 else "RA"
    average = round(sum(float(r.get("marks") or 0) for r in rows) / len(rows), 1) if rows else 0
    return ok({"subjects": rows, "average": average, "grade": "Excellent" if average >= 85 else "Good" if average >= 70 else "Needs Improvement"})

@app.get("/api/schedule/<register_no>")
def schedule(register_no):
    student = get_student(register_no)
    if not student:
        return error("Student not found.", 404)
    rows = query_all(f"SELECT day_name,start_time,end_time,subject_name,room FROM schedule WHERE student_id={P} ORDER BY CASE day_name WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2 WHEN 'Wednesday' THEN 3 WHEN 'Thursday' THEN 4 WHEN 'Friday' THEN 5 ELSE 6 END, start_time",
                     (student["id"],))
    return ok(rows)

@app.get("/api/notifications/<register_no>")
def notifications(register_no):
    student = get_student(register_no)
    if not student:
        return error("Student not found.", 404)
    rows = query_all(f"SELECT title,message,created_at FROM notifications WHERE student_id={P} ORDER BY id DESC",
                     (student["id"],))
    return ok(rows)

if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5000)