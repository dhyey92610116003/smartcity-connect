// Admin specific functions

function renderAdminDashboard() {
    checkAuth('admin');
    
    const complaints = getComplaints();
    const stats = getStatistics(complaints);

    // Update stats cards
    document.getElementById('stat-total').innerText = stats.total;
    document.getElementById('stat-pending').innerText = stats.pending;
    document.getElementById('stat-review').innerText = stats.review;
    document.getElementById('stat-progress').innerText = stats.progress;
    document.getElementById('stat-resolved').innerText = stats.resolved;

    // Render recent complaints
    const recentTableBody = document.getElementById('recent-complaints-body');
    if (recentTableBody) {
        const recent = complaints.slice().reverse().slice(0, 5);
        recentTableBody.innerHTML = '';
        
        if (recent.length === 0) {
            recentTableBody.innerHTML = '<tr><td colspan="6" class="text-center">No complaints found.</td></tr>';
            return;
        }

        recent.forEach(c => {
            recentTableBody.innerHTML += `
                <tr>
                    <td>${c.id}</td>
                    <td>${c.title}</td>
                    <td>${c.category}</td>
                    <td>${formatDate(c.date)}</td>
                    <td><span class="badge ${getStatusBadgeClass(c.status)}">${c.status}</span></td>
                    <td><a href="complaint-details.html?id=${c.id}" class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.85rem;">Manage</a></td>
                </tr>
            `;
        });
    }
}

function renderAllComplaints() {
    checkAuth('admin');
    
    const allComplaints = getComplaints();
    renderAdminComplaintsTable(allComplaints);

    // Setup filters
    document.getElementById('search-input').addEventListener('input', () => filterAdminComplaints(allComplaints));
    document.getElementById('status-filter').addEventListener('change', () => filterAdminComplaints(allComplaints));
    document.getElementById('category-filter').addEventListener('change', () => filterAdminComplaints(allComplaints));
}

function filterAdminComplaints(complaints) {
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

    renderAdminComplaintsTable(filtered);
}

function renderAdminComplaintsTable(complaints) {
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
                <td>
                    <select class="form-control" style="padding: 0.25rem; font-size: 0.85rem;" onchange="quickUpdateStatus('${c.id}', this.value)">
                        <option value="Pending" ${c.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Under Review" ${c.status === 'Under Review' ? 'selected' : ''}>Under Review</option>
                        <option value="In Progress" ${c.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                        <option value="Resolved" ${c.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                    </select>
                </td>
                <td>
                    <div class="flex gap-1">
                        <a href="complaint-details.html?id=${c.id}" class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.85rem;">View</a>
                        <button onclick="quickDelete('${c.id}')" class="btn btn-danger" style="padding: 0.25rem 0.5rem; font-size: 0.85rem;">Del</button>
                    </div>
                </td>
            </tr>
        `;
    });
}

// Global functions for inline HTML event handlers
window.quickUpdateStatus = function(id, status) {
    updateComplaintStatus(id, status);
    showToast('Status updated successfully');
};

window.quickDelete = function(id) {
    if (confirm('Are you sure you want to delete this complaint?')) {
        deleteComplaint(id);
        showToast('Complaint deleted successfully');
        // Re-render
        renderAllComplaints();
    }
};
