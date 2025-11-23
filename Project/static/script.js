// API Configuration - use same origin as the served page so it works in dev and deployed environments
const API_URL = window.location.origin + '/api';
let currentUser = null;
let currentSort = 'newest';
let currentCategory = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadCategories();
    loadPosts();
    loadActiveUsers();
});

// Authentication
async function checkAuth() {
    try {
        const response = await fetch(`${API_URL}/me`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            currentUser = await response.json();
            updateUIForAuth(true);
        } else {
            updateUIForAuth(false);
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        updateUIForAuth(false);
    }
}

function updateUIForAuth(isAuthenticated) {
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    
    if (isAuthenticated && currentUser) {
        authButtons.classList.add('hidden');
        userMenu.classList.remove('hidden');
        document.getElementById('username').textContent = currentUser.username;
        document.getElementById('userAvatar').src = `/static/avatars/${currentUser.avatar}`;
    } else {
        authButtons.classList.remove('hidden');
        userMenu.classList.add('hidden');
    }
}

async function login(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: formData.get('username'),
                password: formData.get('password')
            }),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = data.user;
            updateUIForAuth(true);
            closeModal('loginModal');
            showNotification('Welcome to Hell!', 'success');
            loadPosts();
        } else {
            showNotification(data.error || 'Login failed', 'error');
        }
    } catch (error) {
        showNotification('Connection error', 'error');
        console.error('Login error:', error);
    }
}

async function register(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: formData.get('username'),
                email: formData.get('email'),
                password: formData.get('password')
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Soul damned successfully! Please login.', 'success');
            closeModal('registerModal');
            showModal('loginModal');
        } else {
            showNotification(data.error || 'Registration failed', 'error');
        }
    } catch (error) {
        showNotification('Connection error', 'error');
        console.error('Register error:', error);
    }
}

async function logout() {
    try {
        await fetch(`${API_URL}/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        
        currentUser = null;
        updateUIForAuth(false);
        showNotification('You have left Hell', 'success');
        loadPosts();
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Categories
async function loadCategories() {
    try {
        const response = await fetch(`${API_URL}/categories`);
        const categories = await response.json();
        
        const categoriesList = document.getElementById('categoriesList');
        const postCategory = document.getElementById('postCategory');
        
        categoriesList.innerHTML = categories.map(cat => `
            <div class="category-item" onclick="filterByCategory(${cat.id})">
                <span>${cat.icon}</span> ${cat.name}
            </div>
        `).join('');
        
        postCategory.innerHTML = '<option value="">Select a circle of hell...</option>' +
            categories.map(cat => `
                <option value="${cat.id}">${cat.icon} ${cat.name}</option>
            `).join('');
    } catch (error) {
        console.error('Failed to load categories:', error);
    }
}

function filterByCategory(categoryId) {
    currentCategory = categoryId;
    loadPosts();
}

// Posts
async function loadPosts() {
    try {
        let url = `${API_URL}/posts?sort=${currentSort}`;
        if (currentCategory) {
            url += `&category=${currentCategory}`;
        }
        
        const response = await fetch(url);
        const posts = await response.json();
        
        displayPosts(posts);
    } catch (error) {
        console.error('Failed to load posts:', error);
        showNotification('Failed to load posts', 'error');
    }
}

function displayPosts(posts) {
    const container = document.getElementById('postsContainer');
    
    if (posts.length === 0) {
        container.innerHTML = '<div class="card"><p>No confessions found in this realm...</p></div>';
        return;
    }
    
    container.innerHTML = posts.map(post => `
        <div class="post-card" onclick="viewPost(${post.id})">
            <div class="post-header">
                <img src="/static/avatars/${post.avatar}" alt="${post.username}" class="post-avatar" onerror="this.onerror=null;this.src='/static/avatars/default.svg'">
                <div class="post-author-info">
                    <div class="post-author">${escapeHtml(post.username)}</div>
                    <div class="post-meta">
                        ${formatDate(post.created_at)} • ${post.views || 0} views
                    </div>
                </div>
                ${post.category_name ? `<span class="post-category">${escapeHtml(post.category_name)}</span>` : ''}
            </div>
            
            <h3 class="post-title">${escapeHtml(post.title)}</h3>
            <p class="post-content">${truncateText(escapeHtml(post.content), 300)}</p>
            
            ${post.image_url ? `<img src="${escapeHtml(post.image_url)}" alt="Post image" class="post-image">` : ''}
            ${post.video_url ? `<video src="${escapeHtml(post.video_url)}" controls class="post-video"></video>` : ''}
            
            <div class="post-actions">
                <button class="action-btn" onclick="event.stopPropagation(); likePost(${post.id}, 'like')">
                    👍 ${post.likes || 0}
                </button>
                <button class="action-btn" onclick="event.stopPropagation(); likePost(${post.id}, 'dislike')">
                    👎 ${post.dislikes || 0}
                </button>
                <button class="action-btn">
                    💬 ${post.comment_count || 0}
                </button>
                <button class="action-btn" onclick="event.stopPropagation(); sharePost(${post.id})">
                    🔗 Share
                </button>
            </div>
        </div>
    `).join('');
}

async function viewPost(postId) {
    try {
        const response = await fetch(`${API_URL}/posts/${postId}`);
        const post = await response.json();
        
        const commentsResponse = await fetch(`${API_URL}/posts/${postId}/comments`);
        const comments = await commentsResponse.json();
        
        const modalContent = document.getElementById('postDetailContent');
        modalContent.innerHTML = `
            <div class="post-header">
                <img src="/static/avatars/${post.avatar}" alt="${post.username}" class="post-avatar">
                <div class="post-author-info">
                    <div class="post-author">${escapeHtml(post.username)}</div>
                    <div class="post-meta">
                        ${formatDate(post.created_at)} • ${post.views || 0} views
                    </div>
                </div>
                ${post.category_name ? `<span class="post-category">${escapeHtml(post.category_name)}</span>` : ''}
            </div>
            
            <h2 class="post-title">${escapeHtml(post.title)}</h2>
            <p class="post-content">${escapeHtml(post.content)}</p>
            
            ${post.image_url ? `<img src="${escapeHtml(post.image_url)}" alt="Post image" class="post-image">` : ''}
            ${post.video_url ? `<video src="${escapeHtml(post.video_url)}" controls class="post-video"></video>` : ''}
            
            <div class="post-actions">
                <button class="action-btn" onclick="likePost(${post.id}, 'like')">
                    👍 ${post.likes || 0}
                </button>
                <button class="action-btn" onclick="likePost(${post.id}, 'dislike')">
                    👎 ${post.dislikes || 0}
                </button>
                ${currentUser && currentUser.id === post.user_id ? `
                    <button class="action-btn" onclick="deletePost(${post.id})">
                        🗑️ Delete
                    </button>
                ` : ''}
            </div>
            
            <div class="comments-section">
                <h3>💬 Tormented Responses (${comments.length})</h3>
                
                ${currentUser ? `
                    <form onsubmit="addComment(event, ${post.id})" style="margin: 20px 0;">
                        <div class="form-group">
                            <textarea name="content" class="input textarea" rows="3" placeholder="Add your tormented thoughts..." required></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary">Post Comment</button>
                    </form>
                ` : '<p>Login to leave a comment</p>'}
                
                <div class="comments-list">
                    ${comments.map(comment => `
                        <div class="comment">
                            <div class="comment-header">
                                <img src="/static/avatars/${comment.avatar}" alt="${comment.username}" class="avatar" style="width: 30px; height: 30px;" onerror="this.onerror=null;this.src='/static/avatars/default.svg'">
                                <span class="comment-author">${escapeHtml(comment.username)}</span>
                                <span class="comment-date">${formatDate(comment.created_at)}</span>
                            </div>
                            <p class="comment-content">${escapeHtml(comment.content)}</p>
                        </div>
                    `).join('') || '<p>No comments yet...</p>'}
                </div>
            </div>
        `;
        
        showModal('postDetailModal');
    } catch (error) {
        console.error('Failed to load post:', error);
        showNotification('Failed to load post', 'error');
    }
}

async function createPost(event) {
    event.preventDefault();
    
    if (!currentUser) {
        showNotification('Please login first', 'error');
        return;
    }
    
    const form = event.target;
    const formData = new FormData(form);
    
    try {
        const response = await fetch(`${API_URL}/posts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: formData.get('title'),
                content: formData.get('content'),
                category_id: formData.get('category_id') || null,
                image_url: formData.get('image_url') || null,
                video_url: formData.get('video_url') || null
            }),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Confession published!', 'success');
            closeModal('createPostModal');
            form.reset();
            loadPosts();
        } else {
            showNotification(data.error || 'Failed to create post', 'error');
        }
    } catch (error) {
        showNotification('Connection error', 'error');
        console.error('Create post error:', error);
    }
}

async function deletePost(postId) {
    if (!confirm('Delete this confession forever?')) return;
    
    try {
        const response = await fetch(`${API_URL}/posts/${postId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        if (response.ok) {
            showNotification('Post deleted', 'success');
            closeModal('postDetailModal');
            loadPosts();
        } else {
            showNotification('Failed to delete post', 'error');
        }
    } catch (error) {
        showNotification('Connection error', 'error');
        console.error('Delete post error:', error);
    }
}

async function likePost(postId, type) {
    if (!currentUser) {
        showNotification('Please login first', 'error');
        return;
    }
    
    try {
        await fetch(`${API_URL}/posts/${postId}/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type }),
            credentials: 'include'
        });
        
        loadPosts();
    } catch (error) {
        console.error('Like error:', error);
    }
}

async function addComment(event, postId) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    try {
        const response = await fetch(`${API_URL}/posts/${postId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: formData.get('content')
            }),
            credentials: 'include'
        });
        
        if (response.ok) {
            form.reset();
            viewPost(postId);
        } else {
            showNotification('Failed to add comment', 'error');
        }
    } catch (error) {
        showNotification('Connection error', 'error');
        console.error('Comment error:', error);
    }
}

function sharePost(postId) {
    const url = `${window.location.origin}/?post=${postId}`;
    navigator.clipboard.writeText(url).then(() => {
        showNotification('Link copied to clipboard!', 'success');
    });
}

// Sorting and filtering
function sortPosts(sort) {
    currentSort = sort;
    
    // Update active button
    document.querySelectorAll('[data-sort]').forEach(btn => {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-small');
    });
    document.querySelector(`[data-sort="${sort}"]`).classList.add('btn-primary');
    
    loadPosts();
}

// Active users
async function loadActiveUsers() {
    // Mock data - in real app, fetch from backend
    const activeUsers = [
        { username: 'Lucifer', avatar: 'devil.png' },
        { username: 'Damned_Soul', avatar: 'ghost.png' },
        { username: 'Hell_Hound', avatar: 'hound.png' }
    ];
    
    const container = document.getElementById('activeUsers');
    container.innerHTML = activeUsers.map(user => `
        <div class="user-item">
            <img src="/static/avatars/${user.avatar}" alt="${user.username}">
            <span>${escapeHtml(user.username)}</span>
        </div>
    `).join('');
}

// Modal functions
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#00ff00' : type === 'error' ? '#ff0000' : '#ff6600'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
        z-index: 10000;
        animation: slideIn 0.3s;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Utility functions
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function truncateText(text, length) {
    return text.length > length ? text.substring(0, length) + '...' : text;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);