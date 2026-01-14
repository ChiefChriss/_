from flask import Flask, request, jsonify, send_from_directory
import sqlite3
import os
from werkzeug.security import generate_password_hash, check_password_hash

BASE_DIR = os.path.dirname(__file__)
DB_PATH = os.path.join(BASE_DIR, 'users_flask.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()
    c.execute('''
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    ''')
    conn.commit()
    conn.close()

app = Flask(__name__, static_folder=os.path.join(BASE_DIR, '..'), static_url_path='')

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    email = (data.get('email') or '').strip()
    password = data.get('password') or ''
    if not email or not password:
        return jsonify(error='Missing email or password'), 400
    pw_hash = generate_password_hash(password)
    conn = get_db()
    c = conn.cursor()
    try:
        c.execute('INSERT INTO users (email, password_hash) VALUES (?, ?)', (email, pw_hash))
        conn.commit()
        user_id = c.lastrowid
    except Exception as e:
        conn.close()
        return jsonify(error=str(e)), 500
    conn.close()
    return jsonify(ok=True, user={'id': user_id, 'email': email})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = (data.get('email') or '').strip()
    password = data.get('password') or ''
    if not email or not password:
        return jsonify(error='Missing email or password'), 400
    conn = get_db()
    c = conn.cursor()
    c.execute('SELECT * FROM users WHERE email = ? ORDER BY id DESC', (email,))
    rows = c.fetchall()
    conn.close()
    if not rows:
        return jsonify(error='Invalid credentials'), 401
    for row in rows:
        if check_password_hash(row['password_hash'], password):
            return jsonify(ok=True, user={'id': row['id'], 'email': row['email']})
    return jsonify(error='Invalid credentials'), 401

@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory(app.static_folder, filename)

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'practice.html')

if __name__ == '__main__':
    init_db()
    print(f"Starting Flask server on http://localhost:3000 (DB: {DB_PATH})")
    app.run(host='0.0.0.0', port=3000)
