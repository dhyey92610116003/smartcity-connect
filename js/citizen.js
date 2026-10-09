// Citizen specific functions

function renderCitizenDashboard() {
    const user = checkAuth('citizen');
    if (!user) return;

    const complaints = getUserComplaints(user.username);
    const stats = getStatistics(complaints);

    // Update stats cards
    document.getElementById('stat-total').innerText = stats.total;
    document.getElementById('stat-pending').innerText = stats.pending;
    document.getElementById('stat-progress').innerText = stats.progress;
    document.getElementById('stat-resolved').innerText = stats.resolved;

    // Render recent complaints (last 3)
    const recentTableBody = document.getElementById('recent-complaints-body');
    if (recentTableBody) {
        const recent = complaints.slice().reverse().slice(0, 3);
        recentTableBody.innerHTML = '';
        
        if (recent.length === 0) {
            recentTableBody.innerHTML = '<tr><td colspan="5" class="text-center">No complaints found.</td></tr>';
            return;
        }

        recent.forEach(c => {
            recentTableBody.innerHTML += `
                <tr>
                    <td>${c.id}</td>
                    <td>${c.title}</td>
                    <td>${formatDate(c.date)}</td>
                    <td><span class="badge ${getStatusBadgeClass(c.status)}">${c.status}</span></td>
                    <td><a href="complaint-details.html?id=${c.id}" class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.85rem;">View</a></td>
                </tr>
            `;
        });
    }
}

function handleComplaintSubmission(e) {
    e.preventDefault();
    const user = checkAuth('citizen');
    if (!user) return;

    const title = document.getElementById('title').value;
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value;
    const location = document.getElementById('location').value;
    const date = document.getElementById('date').value;

    if (!title || !category || !description || !location || !date) {
        showToast('Please fill all required fields.', 'error');
        return;
    }

    const newComplaint = addComplaint({
        title, category, description, location, date, user: user.username, image: ''
    });

    showToast(`Complaint submitted successfully. ID: ${newComplaint.id}`);
    e.target.reset();
}

function renderMyComplaints() {
    const user = checkAuth('citizen');
    if (!user) return;

    const allComplaints = getUserComplaints(user.username);
    renderComplaintsTable(allComplaints);

    // Setup filters
    document.getElementById('search-input').addEventListener('input', () => filterComplaints(allComplaints));
    document.getElementById('status-filter').addEventListener('change', () => filterComplaints(allComplaints));
    document.getElementById('category-filter').addEventListener('change', () => filterComplaints(allComplaints));
}

function filterComplaints(complaints) {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const statusFilter = document.getElementById('status-filter').value;
    const categoryFilter = document.getElementById('category-filter').value;

    const filtered = complaints.filter(c => {
        const matchesSearch = c.id.toLowerCase().includes(searchTerm) || 
                              c.title.toLowerCase().includes(searchTerm) ||
                              c.location.toLowerCase().includes(searchTerm);
        const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
        const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;
        
        return matchesSearch && matchesStatus && matchesCategory;
    });

    renderComplaintsTable(filtered);
}

function renderComplaintsTable(complaints) {
    const tbody = document.getElementById('complaints-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';
    if (complaints.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No complaints found.</td></tr>';
        return;
    }

    complaints.slice().reverse().forEach(c => {
        tbody.innerHTML += `
            <tr>
                <td>${c.id}</td>
                <td>${c.title}</td>
                <td>${c.category}</td>
                <td>${c.location}</td>
                <td>${formatDate(c.date)}</td>
                <td><span class="badge ${getStatusBadgeClass(c.status)}">${c.status}</span></td>
                <td><a href="complaint-details.html?id=${c.id}" class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.85rem;">View Details</a></td>
            </tr>
        `;
    });
}

function renderComplaintDetails() {
    const user = checkAuth();
    if (!user) return;

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    
    if (!id) {
        window.location.href = user.role === 'admin' ? 'admin-dashboard.html' : 'citizen-dashboard.html';
        return;
    }

    const complaint = getComplaintById(id);
    if (!complaint) {
        document.getElementById('details-container').innerHTML = '<p>Complaint not found.</p>';
        return;
    }

    // Security check: if citizen, ensure they own it
    if (user.role === 'citizen' && complaint.user !== user.username) {
        document.getElementById('details-container').innerHTML = '<p>Unauthorized access.</p>';
        return;
    }

    // Populate details
    document.getElementById('detail-id').innerText = complaint.id;
    document.getElementById('detail-title').innerText = complaint.title;
    document.getElementById('detail-category').innerText = complaint.category;
    document.getElementById('detail-date').innerText = formatDate(complaint.date);
    document.getElementById('detail-location').innerText = complaint.location;
    document.getElementById('detail-description').innerText = complaint.description;
    
    const statusBadge = document.getElementById('detail-status');
    statusBadge.innerText = complaint.status;
    statusBadge.className = `badge ${getStatusBadgeClass(complaint.status)}`;

    // Update timeline
    const steps = ['Pending', 'Under Review', 'In Progress', 'Resolved'];
    const currentIndex = steps.indexOf(complaint.status);
    
    steps.forEach((step, index) => {
        const el = document.getElementById(`tl-${step.replace(' ', '').toLowerCase()}`);
        if (index < currentIndex) {
            el.className = 'timeline-step completed';
        } else if (index === currentIndex) {
            el.className = 'timeline-step active';
        } else {
            el.className = 'timeline-step';
        }
    });

    // Admin controls
    const adminControls = document.getElementById('admin-controls');
    if (user.role === 'admin') {
        adminControls.style.display = 'block';
        document.getElementById('update-status-select').value = complaint.status;
        
        document.getElementById('btn-update-status').addEventListener('click', () => {
            const newStatus = document.getElementById('update-status-select').value;
            updateComplaintStatus(complaint.id, newStatus);
            showToast('Complaint status updated successfully.');
            setTimeout(() => location.reload(), 1000);
        });

        document.getElementById('btn-delete').addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this complaint?')) {
                deleteComplaint(complaint.id);
                showToast('Complaint deleted successfully.');
                setTimeout(() => window.location.href = 'all-complaints.html', 1000);
            }
        });
    }
}

function renderProfile() {
    const user = checkAuth();
    if (!user) return;

    document.getElementById('profile-name').innerText = user.name;
    document.getElementById('profile-username').innerText = user.username;
    document.getElementById('profile-role').innerText = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    
    // Setup proper dashboard link based on role
    const backBtn = document.getElementById('profile-back-btn');
    backBtn.href = user.role === 'admin' ? 'admin-dashboard.html' : 'citizen-dashboard.html';
}
