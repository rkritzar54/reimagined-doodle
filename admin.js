document.addEventListener('DOMContentLoaded', function() {
    const CURRENT_TIMESTAMP = '2025-03-25 21:14:14';
    const CURRENT_USER = 'rkritzar54';

    // Initialize the admin interface
    updateDateTime();
    loadDashboardData();
    setupEventListeners();
    loadBookings();

    // Update date/time
    function updateDateTime() {
        const timeElement = document.getElementById('currentTime');
        if (timeElement) {
            const now = new Date(CURRENT_TIMESTAMP);
            timeElement.textContent = now.toLocaleString();
        }
    }

    // Load dashboard data
    function loadDashboardData() {
        // Get bookings from localStorage
        const bookings = JSON.parse(localStorage.getItem('bookingResponses') || '[]');
        
        // Update dashboard numbers
        document.getElementById('totalBookings').textContent = bookings.length;
        document.getElementById('pendingBookings').textContent = 
            bookings.filter(b => b.status === 'pending').length;
        
        // Count today's bookings
        const today = new Date(CURRENT_TIMESTAMP).toDateString();
        document.getElementById('todayBookings').textContent = 
            bookings.filter(b => new Date(b.timestamp).toDateString() === today).length;

        // Update business status
        updateBusinessStatus();

        // Update activity log
        updateActivityLog(bookings);
    }

    // Update activity log
    function updateActivityLog(bookings) {
        const activityLog = document.getElementById('activityLog');
        if (!activityLog) return;

        // Get recent bookings
        const recentBookings = bookings
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 5);

        const activityHTML = recentBookings.map(booking => `
            <div class="activity-item">
                <div class="activity-header">
                    <span class="activity-type">New Booking</span>
                    <span class="activity-time">${formatTimeAgo(booking.timestamp)}</span>
                </div>
                <div class="activity-details">
                    ${booking.data.name} - ${booking.data.service}
                    <span class="status ${booking.status}">${booking.status}</span>
                </div>
            </div>
        `).join('');

        activityLog.innerHTML = activityHTML;
    }

    // Load bookings
    function loadBookings() {
        const bookingsList = document.getElementById('bookingsList');
        if (!bookingsList) return;

        const bookings = JSON.parse(localStorage.getItem('bookingResponses') || '[]');
        
        const bookingsHTML = bookings.map(booking => `
            <div class="booking-card" data-id="${booking.id}">
                <div class="booking-header">
                    <h3>${booking.data.name}</h3>
                    <span class="status ${booking.status}">${booking.status}</span>
                </div>
                <div class="booking-details">
                    <p><strong>Service:</strong> ${booking.data.service}</p>
                    <p><strong>Date:</strong> ${booking.data.date}</p>
                    <p><strong>Time:</strong> ${booking.data.time}</p>
                    <p><strong>Email:</strong> ${booking.data.email}</p>
                    <p><strong>Phone:</strong> ${booking.data.phone || 'N/A'}</p>
                    <p><strong>Notes:</strong> ${booking.data.notes || 'N/A'}</p>
                </div>
                <div class="booking-actions">
                    ${booking.status === 'pending' ? `
                        <button onclick="updateBookingStatus(${booking.id}, 'approved')" 
                                class="action-button approve">Approve</button>
                        <button onclick="updateBookingStatus(${booking.id}, 'rejected')" 
                                class="action-button reject">Reject</button>
                    ` : ''}
                    <button onclick="deleteBooking(${booking.id})" 
                            class="action-button delete">Delete</button>
                </div>
            </div>
        `).join('');

        bookingsList.innerHTML = bookingsHTML;
    }

    // Setup event listeners
    function setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.admin-sidebar li').forEach(tab => {
            tab.addEventListener('click', function() {
                const tabId = this.dataset.tab;
                switchTab(tabId);
            });
        });

        // Search and filters
        const searchInput = document.getElementById('searchBookings');
        const statusFilter = document.getElementById('statusFilter');
        const dateFilter = document.getElementById('dateFilter');

        if (searchInput) {
            searchInput.addEventListener('input', filterBookings);
        }
        if (statusFilter) {
            statusFilter.addEventListener('change', filterBookings);
        }
        if (dateFilter) {
            dateFilter.addEventListener('change', filterBookings);
        }

        // Business hours form
        const businessHoursForm = document.getElementById('businessHoursForm');
        if (businessHoursForm) {
            businessHoursForm.addEventListener('submit', saveBusinessHours);
        }

        // Settings form
        const settingsForm = document.getElementById('settingsForm');
        if (settingsForm) {
            settingsForm.addEventListener('submit', saveSettings);
        }
    }

    // Helper functions
    function switchTab(tabId) {
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.admin-sidebar li').forEach(tab => {
            tab.classList.remove('active');
        });

        document.getElementById(tabId).classList.add('active');
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    }

    function formatTimeAgo(timestamp) {
        const now = new Date(CURRENT_TIMESTAMP);
        const then = new Date(timestamp);
        const seconds = Math.floor((now - then) / 1000);

        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        return `${Math.floor(seconds / 86400)} days ago`;
    }

    // Make these functions available globally
    window.updateBookingStatus = function(id, status) {
        const bookings = JSON.parse(localStorage.getItem('bookingResponses') || '[]');
        const bookingIndex = bookings.findIndex(b => b.id === id);
        
        if (bookingIndex !== -1) {
            bookings[bookingIndex].status = status;
            localStorage.setItem('bookingResponses', JSON.stringify(bookings));
            loadBookings();
            loadDashboardData();
        }
    };

    window.deleteBooking = function(id) {
        if (confirm('Are you sure you want to delete this booking?')) {
            const bookings = JSON.parse(localStorage.getItem('bookingResponses') || '[]');
            const filteredBookings = bookings.filter(b => b.id !== id);
            localStorage.setItem('bookingResponses', JSON.stringify(filteredBookings));
            loadBookings();
            loadDashboardData();
        }
    };
});
