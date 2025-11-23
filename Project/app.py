from flask import Flask, request, jsonify, session, render_template
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from datetime import datetime, timedelta
import sqlite3
import os
import secrets

app = Flask(__name__)
app.config['SECRET_KEY'] = secrets.token_hex(16)
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)
CORS(app, supports_credentials=True)
bcrypt = Bcrypt(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE = os.path.join(BASE_DIR, 'hellbook.db')

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    # Ensure foreign key constraints are enabled for this connection
    conn.execute('PRAGMA foreign_keys = ON')
    return conn

def init_db():
    with app.app_context():
        db = get_db()
        # Enforce foreign key constraints
        db.execute('PRAGMA foreign_keys = ON')
        
        # Users table
        db.execute('''CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            bio TEXT,
            avatar TEXT DEFAULT 'default.png',
            role TEXT DEFAULT 'spirit',
            is_banned INTEGER DEFAULT 0,
            warnings INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )''')
        
        # Categories table
        db.execute('''CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            icon TEXT
        )''')
        
        # Posts table
        db.execute('''CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            category_id INTEGER,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            image_url TEXT,
            video_url TEXT,
            views INTEGER DEFAULT 0,
            is_pinned INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (category_id) REFERENCES categories(id)
        )''')
        
        # Comments table
        db.execute('''CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (post_id) REFERENCES posts(id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )''')
        
        # Likes table
        db.execute('''CREATE TABLE IF NOT EXISTS likes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            type TEXT CHECK(type IN ('like', 'dislike')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(post_id, user_id),
            FOREIGN KEY (post_id) REFERENCES posts(id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )''')
        
        # Follows table
        db.execute('''CREATE TABLE IF NOT EXISTS follows (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            follower_id INTEGER NOT NULL,
            following_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(follower_id, following_id),
            FOREIGN KEY (follower_id) REFERENCES users(id),
            FOREIGN KEY (following_id) REFERENCES users(id)
        )''')
        
        # Thread follows table
        db.execute('''CREATE TABLE IF NOT EXISTS thread_follows (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            post_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, post_id),
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (post_id) REFERENCES posts(id)
        )''')
        
        # Tags table
        db.execute('''CREATE TABLE IF NOT EXISTS tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL
        )''')
        
        # Post tags table
        db.execute('''CREATE TABLE IF NOT EXISTS post_tags (
            post_id INTEGER NOT NULL,
            tag_id INTEGER NOT NULL,
            PRIMARY KEY (post_id, tag_id),
            FOREIGN KEY (post_id) REFERENCES posts(id),
            FOREIGN KEY (tag_id) REFERENCES tags(id)
        )''')
        
        # Reports table
        db.execute('''CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id INTEGER NOT NULL,
            reporter_id INTEGER NOT NULL,
            reason TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (post_id) REFERENCES posts(id),
            FOREIGN KEY (reporter_id) REFERENCES users(id)
        )''')
        
        # Polls table
        db.execute('''CREATE TABLE IF NOT EXISTS polls (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id INTEGER NOT NULL,
            question TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (post_id) REFERENCES posts(id)
        )''')
        
        # Poll options table
        db.execute('''CREATE TABLE IF NOT EXISTS poll_options (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            poll_id INTEGER NOT NULL,
            option_text TEXT NOT NULL,
            votes INTEGER DEFAULT 0,
            FOREIGN KEY (poll_id) REFERENCES polls(id)
        )''')
        
        db.commit()

        # Insert sample data
        seed_data(db)
        db.close()

def seed_data(db):
    # Check if data already exists
    cursor = db.execute('SELECT COUNT(*) FROM users')
    if cursor.fetchone()[0] > 0:
        return
    
    # Sample users
    users = [
        ('Lucifer', 'lucifer@hell.com', 'Lord of the Underworld', 'devil.png', 'admin'),
        ('Damned_Soul', 'damned@hell.com', 'Forever tormented', 'ghost.png', 'spirit'),
        ('Hell_Hound', 'hound@hell.com', 'Guardian of the gates', 'hound.png', 'spirit'),
        ('Burning_Spirit', 'burn@hell.com', 'Consumed by eternal flames', 'fire.png', 'spirit')
    ]
    
    for username, email, bio, avatar, role in users:
        hashed_pw = bcrypt.generate_password_hash('password123').decode('utf-8')
        db.execute('INSERT INTO users (username, email, password, bio, avatar, role) VALUES (?, ?, ?, ?, ?, ?)',
                   (username, email, hashed_pw, bio, avatar, role))
    
    # Sample categories
    categories = [
        ('Eternal Torment', 'Share your endless suffering', '🔥'),
        ('Dark Confessions', 'Secrets from the damned', '💀'),
        ('Underworld Drama', 'Gossip from below', '⚡'),
        ('Evil Tales', 'Stories of wickedness', '😈'),
        ('Soul Trading', 'Bargains and deals', '🎭')
    ]
    
    for name, desc, icon in categories:
        db.execute('INSERT INTO categories (name, description, icon) VALUES (?, ?, ?)',
                   (name, desc, icon))
    
    # Sample posts
    posts = [
        (1, 1, 'Welcome to Hellbook', 'This is your eternal home for sharing darkness, suffering, and evil tales. Post freely, for here there are no rules but chaos.', None, None),
        (2, 2, 'My First Day in Hell', 'I arrived today and the heat is unbearable. The screaming never stops. Is this normal?', None, None),
        (3, 3, 'The River Styx is Flooding', 'Charon is overwhelmed with new arrivals. Ferry service delayed by 100 years.', None, None),
        (4, 1, 'Cerberus Lost Again', 'Has anyone seen the three-headed beast? He wandered off chasing souls.', None, None)
    ]
    
    for user_id, cat_id, title, content, img, vid in posts:
        db.execute('INSERT INTO posts (user_id, category_id, title, content, image_url, video_url, views) VALUES (?, ?, ?, ?, ?, ?, ?)',
                   (user_id, cat_id, title, content, img, vid, 0))
    
    # Sample comments
    comments = [
        (1, 2, 'Thanks for the welcome! This place is terrifying.'),
        (2, 3, 'Yes, the heat is normal. Wait until the freezing torment begins.'),
        (3, 1, 'Cerberus probably found fresh souls to torture.')
    ]
    
    for post_id, user_id, content in comments:
        db.execute('INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
                   (post_id, user_id, content))
    
    # Sample tags
    tags = ['torment', 'suffering', 'demons', 'fire', 'darkness', 'eternity']
    for tag in tags:
        db.execute('INSERT INTO tags (name) VALUES (?)', (tag,))
    
    db.commit()

# Authentication routes
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    if not username or not email or not password:
        return jsonify({'error': 'All fields required'}), 400
    
    db = get_db()
    
    # Check if user exists
    existing = db.execute('SELECT * FROM users WHERE username = ? OR email = ?', 
                         (username, email)).fetchone()
    if existing:
        return jsonify({'error': 'User already exists'}), 400
    
    hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
    db.execute('INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
               (username, email, hashed_pw))
    db.commit()
    
    return jsonify({'message': 'Registration successful'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    db = get_db()
    user = db.execute('SELECT * FROM users WHERE username = ?', (username,)).fetchone()
    
    if not user or not bcrypt.check_password_hash(user['password'], password):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    if user['is_banned']:
        return jsonify({'error': 'Account is banned'}), 403
    
    session['user_id'] = user['id']
    session['username'] = user['username']
    session['role'] = user['role']
    
    return jsonify({
        'message': 'Login successful',
        'user': {
            'id': user['id'],
            'username': user['username'],
            'role': user['role'],
            'avatar': user['avatar']
        }
    }), 200

@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out'}), 200

@app.route('/api/me', methods=['GET'])
def get_current_user():
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    db = get_db()
    user = db.execute('SELECT id, username, email, bio, avatar, role, warnings FROM users WHERE id = ?',
                     (session['user_id'],)).fetchone()
    
    return jsonify(dict(user)), 200

# Posts routes
@app.route('/api/posts', methods=['GET'])
def get_posts():
    db = get_db()
    sort = request.args.get('sort', 'newest')
    category = request.args.get('category')
    search = request.args.get('search')
    
    query = '''
        SELECT p.*, u.username, u.avatar, c.name as category_name,
               COUNT(DISTINCT cm.id) as comment_count,
               SUM(CASE WHEN l.type = 'like' THEN 1 ELSE 0 END) as likes,
               SUM(CASE WHEN l.type = 'dislike' THEN 1 ELSE 0 END) as dislikes
        FROM posts p
        JOIN users u ON p.user_id = u.id
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN comments cm ON p.id = cm.post_id
        LEFT JOIN likes l ON p.id = l.post_id
    '''
    
    conditions = []
    params = []
    
    if category:
        conditions.append('p.category_id = ?')
        params.append(category)
    
    if search:
        conditions.append('(p.title LIKE ? OR p.content LIKE ?)')
        params.extend([f'%{search}%', f'%{search}%'])
    
    if conditions:
        query += ' WHERE ' + ' AND '.join(conditions)
    
    query += ' GROUP BY p.id'
    
    if sort == 'popular':
        query += ' ORDER BY (likes - dislikes) DESC, p.views DESC'
    elif sort == 'trending':
        query += ' ORDER BY comment_count DESC, p.views DESC'
    else:
        query += ' ORDER BY p.created_at DESC'
    
    posts = db.execute(query, params).fetchall()
    
    return jsonify([dict(post) for post in posts]), 200

@app.route('/api/posts/<int:post_id>', methods=['GET'])
def get_post(post_id):
    db = get_db()
    
    # Increment views
    db.execute('UPDATE posts SET views = views + 1 WHERE id = ?', (post_id,))
    db.commit()
    
    post = db.execute('''
        SELECT p.*, u.username, u.avatar, c.name as category_name,
               COUNT(DISTINCT cm.id) as comment_count,
               SUM(CASE WHEN l.type = 'like' THEN 1 ELSE 0 END) as likes,
               SUM(CASE WHEN l.type = 'dislike' THEN 1 ELSE 0 END) as dislikes
        FROM posts p
        JOIN users u ON p.user_id = u.id
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN comments cm ON p.id = cm.post_id
        LEFT JOIN likes l ON p.id = l.post_id
        WHERE p.id = ?
        GROUP BY p.id
    ''', (post_id,)).fetchone()
    
    if not post:
        return jsonify({'error': 'Post not found'}), 404
    
    return jsonify(dict(post)), 200

@app.route('/api/posts', methods=['POST'])
def create_post():
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    data = request.get_json()
    title = data.get('title')
    content = data.get('content')
    category_id = data.get('category_id')
    
    if not title or not content:
        return jsonify({'error': 'Title and content required'}), 400
    
    db = get_db()
    cursor = db.execute('''
        INSERT INTO posts (user_id, category_id, title, content, image_url, video_url)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (session['user_id'], category_id, title, content, 
          data.get('image_url'), data.get('video_url')))
    db.commit()
    
    return jsonify({'message': 'Post created', 'post_id': cursor.lastrowid}), 201

@app.route('/api/posts/<int:post_id>', methods=['PUT'])
def update_post(post_id):
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    db = get_db()
    post = db.execute('SELECT * FROM posts WHERE id = ?', (post_id,)).fetchone()
    
    if not post:
        return jsonify({'error': 'Post not found'}), 404
    
    if post['user_id'] != session['user_id'] and session.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    db.execute('''
        UPDATE posts SET title = ?, content = ?, category_id = ?, 
               image_url = ?, video_url = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    ''', (data.get('title', post['title']), 
          data.get('content', post['content']),
          data.get('category_id', post['category_id']),
          data.get('image_url', post['image_url']),
          data.get('video_url', post['video_url']),
          post_id))
    db.commit()
    
    return jsonify({'message': 'Post updated'}), 200

@app.route('/api/posts/<int:post_id>', methods=['DELETE'])
def delete_post(post_id):
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    db = get_db()
    post = db.execute('SELECT * FROM posts WHERE id = ?', (post_id,)).fetchone()
    
    if not post:
        return jsonify({'error': 'Post not found'}), 404
    
    if post['user_id'] != session['user_id'] and session.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    db.execute('DELETE FROM posts WHERE id = ?', (post_id,))
    db.commit()
    
    return jsonify({'message': 'Post deleted'}), 200

# Comments routes
@app.route('/api/posts/<int:post_id>/comments', methods=['GET'])
def get_comments(post_id):
    db = get_db()
    comments = db.execute('''
        SELECT c.*, u.username, u.avatar
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.post_id = ?
        ORDER BY c.created_at DESC
    ''', (post_id,)).fetchall()
    
    return jsonify([dict(comment) for comment in comments]), 200

@app.route('/api/posts/<int:post_id>/comments', methods=['POST'])
def create_comment(post_id):
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    data = request.get_json()
    content = data.get('content')
    
    if not content:
        return jsonify({'error': 'Content required'}), 400
    
    db = get_db()
    db.execute('INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
               (post_id, session['user_id'], content))
    db.commit()
    
    return jsonify({'message': 'Comment created'}), 201

# Likes routes
@app.route('/api/posts/<int:post_id>/like', methods=['POST'])
def like_post(post_id):
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    data = request.get_json()
    like_type = data.get('type', 'like')
    
    db = get_db()
    existing = db.execute('SELECT * FROM likes WHERE post_id = ? AND user_id = ?',
                         (post_id, session['user_id'])).fetchone()
    
    if existing:
        if existing['type'] == like_type:
            db.execute('DELETE FROM likes WHERE post_id = ? AND user_id = ?',
                      (post_id, session['user_id']))
        else:
            db.execute('UPDATE likes SET type = ? WHERE post_id = ? AND user_id = ?',
                      (like_type, post_id, session['user_id']))
    else:
        db.execute('INSERT INTO likes (post_id, user_id, type) VALUES (?, ?, ?)',
                   (post_id, session['user_id'], like_type))
    
    db.commit()
    return jsonify({'message': 'Like updated'}), 200

# Categories routes
@app.route('/api/categories', methods=['GET'])
def get_categories():
    db = get_db()
    categories = db.execute('SELECT * FROM categories').fetchall()
    return jsonify([dict(cat) for cat in categories]), 200

# User profile routes
@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user_profile(user_id):
    db = get_db()
    user = db.execute('''
        SELECT id, username, bio, avatar, role, created_at,
               (SELECT COUNT(*) FROM posts WHERE user_id = ?) as post_count,
               (SELECT COUNT(*) FROM follows WHERE following_id = ?) as follower_count
        FROM users WHERE id = ?
    ''', (user_id, user_id, user_id)).fetchone()
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify(dict(user)), 200

# Admin routes
@app.route('/api/admin/users/<int:user_id>/ban', methods=['POST'])
def ban_user(user_id):
    if session.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    db = get_db()
    db.execute('UPDATE users SET is_banned = 1 WHERE id = ?', (user_id,))
    db.commit()
    
    return jsonify({'message': 'User banned'}), 200

@app.route('/api/admin/users/<int:user_id>/warn', methods=['POST'])
def warn_user(user_id):
    if session.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    db = get_db()
    db.execute('UPDATE users SET warnings = warnings + 1 WHERE id = ?', (user_id,))
    db.commit()
    
    return jsonify({'message': 'User warned'}), 200

@app.route('/api/reports', methods=['POST'])
def create_report():
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    data = request.get_json()
    db = get_db()
    db.execute('INSERT INTO reports (post_id, reporter_id, reason) VALUES (?, ?, ?)',
               (data['post_id'], session['user_id'], data['reason']))
    db.commit()
    
    return jsonify({'message': 'Report submitted'}), 201

@app.route('/')
def home():
    return render_template('index.html')  # Serve the frontend template


if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)
