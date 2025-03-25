document.addEventListener('DOMContentLoaded', function() {
    const CURRENT_TIMESTAMP = '2025-03-25 21:31:33';
    const CURRENT_USER = 'rkritzar54';

    // Set admin status
    localStorage.setItem('isAdmin', 'true');

    // Initialize the admin interface
    updateDateTime();
    loadDashboardData();
    setupEventListeners();
    loadBusinessHours();
    loadSettings();

    function updateDateTime() {
        const timeElement = document.getElementById('currentTime');
        if (timeElement) {
            const now = new Date(CURRENT_TIMESTAMP);
            timeElement.textContent = now.toLocaleString();
        }
    }

    function loadDashboardData() {
        const bookings = JSON.parse(localStorage.getItem('bookingResponses') || '[]');
        
        // Update dashboard numbers
        document.getElementById('totalBookings').textContent = bookings.length;
        document.getElementById('pendingBookings').textContent = 
            bookings.filter(b => b.status === 'pending').length;
        
        // Count today's bookings
        const today = new Date(CURRENT_TIMESTAMP).toDateString();
        document.getElementById('todayBookings').textContent = 
            bookings.filter(b => new Date(b.submissionTime).toDateString() === today).length;

        // Update business status
        updateBusinessStatus();
        updateActivityLog(bookings);
    }

    function updateActivityLog(bookings) {
        const activityLog = document.getElementById('activityLog');
        if (!activityLog) return;

        const recentBookings = bookings
            .sort((a, b) => new Date(b.submissionTime) - new Date(a.submissionTime))
            .slice(0, 5);

        const activityHTML = recentBookings.map(booking => `
            <div class="activity-item">
                <div class="activity-header">
                    <span class="activity-type">Booking Request</span>
                    <span class="activity-time">${formatTimeAgo(booking.submissionTime)}</span>
                </div>
                <div class="activity-details">
                    ${booking.name} - ${booking.date} at ${booking.time}
                    <span class="status ${booking.status}">${booking.status}</span>
                </div>
            </div>
        `).join('');

        activityLog.innerHTML = activityHTML || '<p>No recent activity</p>';
    }

    function setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.admin-sidebar li').forEach(tab => {
            tab.addEventListener('click', function() {
                switchTab(this.dataset.tab);
            });
        });

        // Business Hours Form
        const businessHoursForm = document.getElementById('businessHoursForm');
        if (businessHoursForm) {
            businessHoursForm.addEventListener('submit', saveBusinessHours);
            
            // Handle checkbox changes
            businessHoursForm.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                checkbox.addEventListener('change', function() {
                    const dayInputs = this.closest('.time-inputs').querySelectorAll('input[type="time"]');
                    dayInputs.forEach(input => input.disabled = !this.checked);
                });
            });
        }

        // Settings Form
        const settingsForm = document.getElementById('settingsForm');
        if (settingsForm) {
            settingsForm.addEventListener('submit', saveSettings);
        }

        // Booking filters
        const searchInput = document.getElementById('searchBookings');
        const statusFilter = document.getElementById('statusFilter');
        const dateFilter = document.getElementById('dateFilter');

        if (searchInput) searchInput.addEventListener('input', filterBookings);
        if (statusFilter) statusFilter.addEventListener('change', filterBookings);
        if (dateFilter) dateFilter.addEventListener('change', filterBookings);
    }

    function saveBusinessHours(e) {
        e.preventDefault();
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const businessHours = {};

        days.forEach(day => {
            const isOpen = document.querySelector(`[name="${day}-open"]`).checked;
            businessHours[day] = {
                closed: !isOpen,
                open: document.querySelector(`[name="${day}-start"]`).value,
                close: document.querySelector(`[name="${day}-end"]`).value
            };
        });

        localStorage.setItem('businessHours', JSON.stringify(businessHours));
        alert('Business hours updated successfully!');
    }

    function loadBusinessHours() {
        const businessHours = JSON.parse(localStorage.getItem('businessHours')) || {
            sunday: { closed: true },
            monday: { open: '10:00', close: '23:00', closed: false },
            tuesday: { open: '10:00', close: '23:00', closed: false },
            wednesday: { open: '10:00', close: '23:00', closed: false },
            thursday: { open: '10:00', close: '23:00', closed: false },
            friday: { open: '10:00', close: '23:00', closed: false },
            saturday: { open: '10:00', close: '23:00', closed: false }
        };

        Object.entries(businessHours).forEach(([day, hours]) => {
            const openCheckbox = document.querySelector(`[name="${day}-open"]`);
            const startInput = document.querySelector(`[name="${day}-start"]`);
            const endInput = document.querySelector(`[name="${day}-end"]`);

            if (openCheckbox && startInput && endInput) {
                openCheckbox.checked = !hours.closed;
                startInput.value = hours.open;
                endInput.value = hours.close;
                startInput.disabled = hours.closed;
                endInput.disabled = hours.closed;
            }
        });
    }

    function saveSettings(e) {
        e.preventDefault();
        const settings = {
            businessName: this.querySelector('[name="businessName"]').value,
            contactEmail: this.querySelector('[name="contactEmail"]').value,
            contactPhone: this.querySelector('[name="contactPhone"]').value,
            bookingSettings: {
                minNotice: parseInt(this.querySelector('[name="minNotice"]').value),
                maxFuture: parseInt(this.querySelector('[name="maxFuture"]').value)
            }
        };

        localStorage.setItem('businessSettings', JSON.stringify(settings));
        alert('Settings saved successfully!');
    }

    function loadSettings() {
        const settings = JSON.parse(localStorage.getItem('businessSettings')) || {
            businessName: "River's Portfolio",
            contactEmail: "",
            contactPhone: "",
            bookingSettings: {
                minNotice: 24,
                maxFuture: 30
            }
        };

        const form = document.getElementById('settingsForm');
        if (form) {
            form.querySelector('[name="businessName"]').value = settings.businessName;
            form.querySelector('[name="contactEmail"]').value = settings.contactEmail;
            form.querySelector('[name="contactPhone"]').value = settings.contactPhone;
            form.querySelector('[name="minNotice"]').value = settings.bookingSettings.minNotice;
            form.querySelector('[name="maxFuture"]').value = settings.bookingSettings.maxFuture;
        }
    }

    function filterBookings() {
        const searchTerm = document.getElementById('searchBookings').value.toLowerCase();
        const statusFilter = document.getElementById('statusFilter').value;
        const dateFilter = document.getElementById('dateFilter').value;

        const bookings = JSON.parse(localStorage.getItem('bookingResponses') || '[]');
        const filteredBookings = bookings.filter(booking => {
            const matchesSearch = !searchTerm || 
                booking.name.toLowerCase().includes(searchTerm) ||
                booking.email.toLowerCase().includes(searchTerm);
            const matchesStatus = !statusFilter || booking.status === statusFilter;
            const matchesDate = !dateFilter || booking.date === dateFilter;

            return matchesSearch && matchesStatus && matchesDate;
        });

        displayBookings(filteredBookings);
    }

    function displayBookings(bookings) {
        const bookingsList = document.getElementById('bookingsList');
        if (!bookingsList) return;

        const bookingsHTML = bookings.map(booking => `
            <div class="booking-card">
                <div class="booking-header">
                    <h3>${booking.name}</h3>
                    <span class="status ${booking.status}">${booking.status}</span>
                </div>
                <div class="booking-details">
                    <p><strong>Date:</strong> ${booking.date}</p>
                    <p><strong>Time:</strong> ${booking.time}</p>
                    <p><strong>Email:</strong> ${booking.email}</p>
                    <p><strong>Message:</strong> ${booking.message || 'N/A'}</p>
                    <p class="submission-info">Submitted on ${new Date(booking.submissionTime).toLocaleString()}</p>
                </div>
                <div class="booking-actions">
                    ${booking.status === 'pending' ? `
                        <button onclick="updateBookingStatus('${booking.id}', 'approved')" 
                                class="action-button approve">Approve</button>
                        <button onclick="updateBookingStatus('${booking.id}', 'rejected')" 
                                class="action-button reject">Reject</button>
                    ` : ''}
                    <button onclick="deleteBooking('${booking.id}')" 
                            class="action-button delete">Delete</button>
                </div>
            </div>
        `).join('');

        bookingsList.innerHTML = bookingsHTML || '<p>No bookings found</p>';
    }

    function updateBusinessStatus() {
        const businessHours = JSON.parse(localStorage.getItem('businessHours'));
        if (!businessHours) return;

        const now = new Date(CURRENT_TIMESTAMP);
        const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
        const status = document.getElementById('businessStatus');

        if (status) {
            const isOpen = !businessHours[currentDay].closed;
            status.textContent = isOpen ? 'OPEN' : 'CLOSED';
            status.className = `status-indicator ${isOpen ? 'open' : 'closed'}`;
        }
    }

    function switchTab(tabId) {
        document.querySelectorAll('.admin-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.admin-sidebar li').forEach(tab => tab.classList.remove('active'));

        document.getElementById(tabId).classList.add('active');
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');

        if (tabId === 'bookings') filterBookings();
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
        const index = bookings.findIndex(b => b.id === id);
        
        if (index !== -1) {
            bookings[index].status = status;
            localStorage.setItem('bookingResponses', JSON.stringify(bookings));
            filterBookings();
            loadDashboardData();
        }
    };

    window.deleteBooking = function(id) {
        if (confirm('Are you sure you want to delete this booking?')) {
            const bookings = JSON.parse(localStorage.getItem('bookingResponses') || '[]');
            const filteredBookings = bookings.filter(b => b.id !== id);
            localStorage.setItem('bookingResponses', JSON.stringify(filteredBookings));
            filterBookings();
            loadDashboardData();
        }
    };

    // Initial load
    filterBookings();
});
