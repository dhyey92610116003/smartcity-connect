// Common utility functions

// Toast Notification
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;
    
    container.appendChild(toast);
    
    // Trigger reflow for animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            container.removeChild(toast);
        }, 300);
    }, 3000);
}

// Format Date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Get Badge Class based on status
function getStatusBadgeClass(status) {
    switch(status) {
        case 'Pending': return 'badge-pending';
        case 'Under Review': return 'badge-review';
        case 'In Progress': return 'badge-progress';
        case 'Resolved': return 'badge-resolved';
        default: return 'badge-pending';
    }
}

// Sidebar toggle for mobile
document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    
    if (menuBtn && sidebar) {
        menuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('show');
        });
    }

    // Set user info in header
    const user = getCurrentUser();
    if (user) {
        const userInfoEl = document.getElementById('header-user-name');
        if (userInfoEl) {
            userInfoEl.textContent = `Hello, ${user.name}`;
        }
    }
});
