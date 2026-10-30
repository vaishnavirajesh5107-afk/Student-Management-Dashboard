from database import get_connection

def query_all(sql, params=()):
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(sql, params)
        rows = cur.fetchall()
        if not rows:
            return []
        if isinstance(rows[0], dict):
            return rows
        names = [d[0] for d in cur.description]
        return [dict(zip(names, row)) for row in rows]
    finally:
        conn.close()

def query_one(sql, params=()):
    rows = query_all(sql, params)
    return rows[0] if rows else None

def run_write(sql, params=()):
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(sql, params)
        conn.commit()
        return getattr(cur, "lastrowid", None)
    finally:
        conn.close()

def placeholder():
    import os
    return "%s" if os.getenv("DB_TYPE", "sqlite").lower() == "mysql" else "?"