// Handle authentication (Mock)

const users = {
    citizen: {
        username: 'citizen',
        password: 'citizen123',
        role: 'citizen',
        name: 'Demo Citizen'
    },
    admin: {
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        name: 'City Administrator'
    }
};

function login(username, password) {
    const user = users[username];
    if (user && user.password === password) {
        // Save session
        sessionStorage.setItem('smartcity_user', JSON.stringify({
            username: user.username,
            role: user.role,
            name: user.name
        }));
        return { success: true, role: user.role };
    }
    return { success: false, message: 'Invalid username or password' };
}

function logout() {
    sessionStorage.removeItem('smartcity_user');
    window.location.href = 'index.html';
}

function getCurrentUser() {
    const userStr = sessionStorage.getItem('smartcity_user');
    return userStr ? JSON.parse(userStr) : null;
}

function checkAuth(requiredRole) {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'index.html';
        return null;
    }
    if (requiredRole && user.role !== requiredRole) {
        // Redirect to appropriate dashboard if role mismatch
        window.location.href = user.role === 'admin' ? 'admin-dashboard.html' : 'citizen-dashboard.html';
        return null;
    }
    return user;
}
