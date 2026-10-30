import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
SQLITE_PATH = BASE_DIR / "student_dashboard.db"


def get_connection():
    conn = sqlite3.connect(SQLITE_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def _execute(conn, sql, params=()):
    cur = conn.cursor()
    cur.execute(sql, params)
    return cur


def init_db():
    conn = get_connection()

    try:
        statements = [
            """
            CREATE TABLE IF NOT EXISTS students (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                register_no TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                email TEXT DEFAULT '',
                department TEXT DEFAULT 'EEE',
                year_level TEXT DEFAULT 'III Year',
                semester TEXT DEFAULT 'Semester 5',
                phone TEXT DEFAULT '',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS subjects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL,
                subject_code TEXT DEFAULT '',
                subject_name TEXT NOT NULL,
                credits INTEGER DEFAULT 3,
                marks REAL DEFAULT 0,
                FOREIGN KEY(student_id)
                    REFERENCES students(id) ON DELETE CASCADE
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS attendance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL,
                subject_name TEXT NOT NULL,
                total_classes INTEGER DEFAULT 0,
                attended_classes INTEGER DEFAULT 0,
                FOREIGN KEY(student_id)
                    REFERENCES students(id) ON DELETE CASCADE
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS schedule (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL,
                day_name TEXT NOT NULL,
                start_time TEXT NOT NULL,
                end_time TEXT NOT NULL,
                subject_name TEXT NOT NULL,
                room TEXT DEFAULT '',
                FOREIGN KEY(student_id)
                    REFERENCES students(id) ON DELETE CASCADE
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(student_id)
                    REFERENCES students(id) ON DELETE CASCADE
            )
            """
        ]

        for statement in statements:
            _execute(conn, statement)

        _seed_sqlite(conn)
        conn.commit()

    finally:
        conn.close()


def _seed_sqlite(conn):
    cur = conn.cursor()

    cur.execute(
        "SELECT id FROM students WHERE register_no = ?",
        ("2024EEE101",)
    )
    row = cur.fetchone()

    if row:
        return

    cur.execute(
        """
        INSERT INTO students
        (register_no, name, email, department,
         year_level, semester, phone)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            "2024EEE101",
            "Vaishnavi R",
            "vaishnavi@example.com",
            "EEE",
            "III Year",
            "Semester 5",
            ""
        )
    )

    sid = cur.lastrowid

    cur.executemany(
        """
        INSERT INTO subjects
        (student_id, subject_code, subject_name, credits, marks)
        VALUES (?, ?, ?, ?, ?)
        """,
        [
            (sid, "EE501", "Power System Analysis", 4, 86),
            (sid, "EE502", "Electrical Machines", 4, 91),
            (sid, "EE503", "Power Electronics", 3, 82),
            (sid, "EE504", "Control Systems", 3, 78),
            (sid, "EE505", "Measurements and Instrumentation", 3, 88),
            (sid, "HS501", "Professional Ethics", 2, 93),
        ]
    )

    cur.executemany(
        """
        INSERT INTO attendance
        (student_id, subject_name, total_classes, attended_classes)
        VALUES (?, ?, ?, ?)
        """,
        [
            (sid, "Power System Analysis", 30, 27),
            (sid, "Electrical Machines", 28, 25),
            (sid, "Power Electronics", 26, 23),
            (sid, "Control Systems", 30, 26),
            (sid, "Measurements and Instrumentation", 24, 22),
        ]
    )

    cur.executemany(
        """
        INSERT INTO schedule
        (student_id, day_name, start_time, end_time, subject_name, room)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        [
            (sid, "Monday", "09:00", "10:00",
             "Power System Analysis", "EEE-201"),
            (sid, "Monday", "10:15", "11:15",
             "Electrical Machines", "EEE-202"),
            (sid, "Tuesday", "09:00", "10:00",
             "Power Electronics", "Lab 2"),
            (sid, "Wednesday", "11:15", "12:15",
             "Control Systems", "EEE-201"),
            (sid, "Thursday", "13:00", "14:00",
             "Measurements and Instrumentation", "EEE-203"),
            (sid, "Friday", "09:00", "10:00",
             "Power System Analysis", "EEE-201"),
        ]
    )

    cur.executemany(
        """
        INSERT INTO notifications (student_id, title, message)
        VALUES (?, ?, ?)
        """,
        [
            (
                sid,
                "Welcome",
                "Welcome to your Student Management & Academic Dashboard."
            ),
            (
                sid,
                "Semester reminder",
                "Check your attendance and semester marks regularly."
            ),
        ]
    )