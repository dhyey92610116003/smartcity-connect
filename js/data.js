// Initial sample data
const initialComplaints = [
    {
        id: "SC-1001",
        title: "Broken Street Light",
        category: "Street Light",
        description: "The street light near the main intersection is not working, causing visibility issues at night.",
        location: "Main Road",
        date: "2026-10-09",
        status: "Resolved",
        user: "citizen",
        image: ""
    },
    {
        id: "SC-1002",
        title: "Garbage Not Collected",
        category: "Garbage/Waste",
        description: "Garbage has not been collected for the past 3 days in our area.",
        location: "Ward 5",
        date: "2026-10-10",
        status: "Pending",
        user: "citizen",
        image: ""
    },
    {
        id: "SC-1003",
        title: "Road Damage",
        category: "Road Damage",
        description: "There is a huge pothole in the middle of the road which is dangerous for two-wheelers.",
        location: "Station Road",
        date: "2026-10-11",
        status: "In Progress",
        user: "citizen",
        image: ""
    },
    {
        id: "SC-1004",
        title: "Water Leakage",
        category: "Water Leakage",
        description: "Main water pipe is leaking heavily near the park entrance.",
        location: "Shivaji Nagar",
        date: "2026-10-12",
        status: "Under Review",
        user: "citizen",
        image: ""
    },
    {
        id: "SC-1005",
        title: "Drainage Problem",
        category: "Drainage",
        description: "Sewage water is overflowing onto the streets.",
        location: "Ward 3",
        date: "2026-10-08",
        status: "Resolved",
        user: "citizen",
        image: ""
    }
];

// Initialize local storage if empty
function initData() {
    if (!localStorage.getItem('smartcity_complaints')) {
        localStorage.setItem('smartcity_complaints', JSON.stringify(initialComplaints));
    }
}

// Get all complaints
function getComplaints() {
    const data = localStorage.getItem('smartcity_complaints');
    return data ? JSON.parse(data) : [];
}

// Save all complaints
function saveComplaints(complaints) {
    localStorage.setItem('smartcity_complaints', JSON.stringify(complaints));
}

// Get complaints for a specific user
function getUserComplaints(username) {
    const complaints = getComplaints();
    return complaints.filter(c => c.user === username);
}

// Get complaint by ID
function getComplaintById(id) {
    const complaints = getComplaints();
    return complaints.find(c => c.id === id);
}

// Add new complaint
function addComplaint(complaintData) {
    const complaints = getComplaints();
    
    // Generate ID
    const lastId = complaints.length > 0 ? 
        Math.max(...complaints.map(c => parseInt(c.id.split('-')[1]))) : 1000;
    
    const newComplaint = {
        id: `SC-${lastId + 1}`,
        ...complaintData,
        status: 'Pending'
    };
    
    complaints.push(newComplaint);
    saveComplaints(complaints);
    return newComplaint;
}

// Update complaint status
function updateComplaintStatus(id, newStatus) {
    const complaints = getComplaints();
    const index = complaints.findIndex(c => c.id === id);
    if (index !== -1) {
        complaints[index].status = newStatus;
        saveComplaints(complaints);
        return true;
    }
    return false;
}

// Delete complaint
function deleteComplaint(id) {
    let complaints = getComplaints();
    complaints = complaints.filter(c => c.id !== id);
    saveComplaints(complaints);
}

// Calculate Statistics
function getStatistics(complaintsData) {
    return {
        total: complaintsData.length,
        pending: complaintsData.filter(c => c.status === 'Pending').length,
        review: complaintsData.filter(c => c.status === 'Under Review').length,
        progress: complaintsData.filter(c => c.status === 'In Progress').length,
        resolved: complaintsData.filter(c => c.status === 'Resolved').length
    };
}

// Run init on load
initData();
