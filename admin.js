// Constants
const CURRENT_TIMESTAMP = '2025-03-25 23:37:52';
const CURRENT_USER = 'rkritzar54';

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is admin
    if (localStorage.getItem('isAdmin') !== 'true') {
        console.log('Not an admin user');
        return;
    }

    // Initialize if we're on the admin page
    if (window.location.pathname.includes('admin.html')) {
        initializeAdminPortal();
    }

    // Add admin link to navigation if not already present
    addAdminNavLink();
});

function initializeAdminPortal() {
    // Initialize all admin sections
    initializeTabs();
    initializeBusinessHours();
    initializeSettings();
    initializeBookings();
    initializeDashboard();
    loadInitialData();
}

// Tab Management
function initializeTabs() {
    const tabs = document.querySelectorAll('.admin-tab');
    const tabLinks = document.querySelectorAll('.admin-sidebar li');

    tabLinks.forEach(link => {
        link.addEventListener('click', () => {
            const tabId = link.getAttribute('data-tab');
            
            // Update active states
            tabLinks.forEach(l => l.classList.remove('active'));
            tabs.forEach(t => t.classList.remove('active'));
            
            link.classList.add('active');
            document.getElementById(tabId).classList.add('active');
            
            // Update URL hash
            window.location.hash = tabId;
            
            // Load tab-specific data
            loadTabData(tabId);
        });
    });

    // Handle initial load
    const hash = window.location.hash.slice(1) || 'dashboard';
    document.querySelector(`[data-tab="${hash}"]`)?.click();
}

function loadTabData(tabId) {
    switch(tabId) {
        case 'dashboard':
            updateDashboardStats();
            loadRecentActivity();
            break;
        case 'bookings':
            loadBookings();
            break;
        case 'hours':
            loadBusinessHours();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

// Business Hours Management
function initializeBusinessHours() {
    const form = document.getElementById('businessHoursForm');
    if (!form) return;

    form.addEventListener('submit', saveBusinessHours);

    // Initialize day toggles
    document.querySelectorAll('[type="checkbox"][name$="-open"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const day = this.name.replace('-open', '');
            const timeInputs = document.querySelectorAll(`[name^="${day}-"]:not([name$="-open"])`);
            timeInputs.forEach(input => input.disabled = !this.checked);
        });
    });
}

function loadBusinessHours() {
    const hours = JSON.parse(localStorage.getItem('businessHours')) || getDefaultBusinessHours();
    
    Object.entries(hours).forEach(([day, schedule]) => {
        const openCheckbox = document.querySelector(`[name="${day}-open"]`);
        const startInput = document.querySelector(`[name="${day}-start"]`);
        const endInput = document.querySelector(`[name="${day}-end"]`);
        
        if (openCheckbox && startInput && endInput) {
            openCheckbox.checked = !schedule.closed;
            startInput.value = schedule.open || '09:00';
            endInput.value = schedule.close || '17:00';
            startInput.disabled = schedule.closed;
            endInput.disabled = schedule.closed;
        }
    });
}

function saveBusinessHours(e) {
    e.preventDefault();
    const hours = {};
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    
    days.forEach(day => {
        hours[day] = {
            open: this.querySelector(`[name="${day}-start"]`).value,
            close: this.querySelector(`[name="${day}-end"]`).value,
            closed: !this.querySelector(`[name="${day}-open"]`).checked
        };
    });

    localStorage.setItem('businessHours', JSON.stringify(hours));
    addActivity('Business hours updated');
    showNotification('Business hours saved successfully!');
}

// Settings Management
function initializeSettings() {
    setupServiceManagement();
    setupSocialMediaManagement();
    setupHolidayManagement();
    
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', saveSettings);
        loadSettings();
    }
}

function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('businessSettings')) || getDefaultSettings();
    
    // Load business info
    Object.entries(settings.businessInfo).forEach(([key, value]) => {
        const input = document.querySelector(`[name="${key}"]`);
        if (input) input.value = value;
    });

    // Load other settings
    loadSocialMedia(settings.socialMedia);
    loadHolidays(settings.holidays);
    loadServices(settings.bookingSettings.services);
}

function saveSettings(e) {
    e.preventDefault();
    const settings = {
        businessInfo: {
            name: this.querySelector('[name="businessName"]').value,
            contactEmail: this.querySelector('[name="contactEmail"]').value,
            emergencyPhone: this.querySelector('[name="emergencyPhone"]').value,
            contactPhone: this.querySelector('[name="contactPhone"]').value,
            businessDescription: this.querySelector('[name="businessDescription"]').value,
            location: this.querySelector('[name="location"]').value,
            missionStatement: this.querySelector('[name="missionStatement"]').value
        },
        socialMedia: getSocialMediaData(),
        holidays: getHolidayData(),
        bookingSettings: {
            minNotice: parseInt(this.querySelector('[name="minNotice"]').value),
            maxFuture: parseInt(this.querySelector('[name="maxFuture"]').value),
            services: getServiceData()
        },
        lastUpdated: CURRENT_TIMESTAMP,
        lastUpdatedBy: CURRENT_USER
    };

    localStorage.setItem('businessSettings', JSON.stringify(settings));
    addActivity('Settings updated');
    showNotification('Settings saved successfully!');
}

// Service Management
function setupServiceManagement() {
    const addButton = document.getElementById('addService');
    if (addButton) {
        addButton.addEventListener('click', () => {
            const serviceCount = document.querySelectorAll('.service-item').length + 1;
            addServiceItem('', serviceCount);
        });
    }
}

function addServiceItem(value, index) {
    const servicesList = document.getElementById('servicesList');
    if (!servicesList) return;

    const item = document.createElement('div');
    item.className = 'service-item';
    item.innerHTML = `
        <input type="text" name="service-${index}" value="${value}" placeholder="Service name">
        <button type="button" class="remove-service">&times;</button>
    `;

    servicesList.appendChild(item);
    item.querySelector('.remove-service').addEventListener('click', () => item.remove());
}

function loadServices(services = []) {
    const servicesList = document.getElementById('servicesList');
    if (!servicesList) return;

    servicesList.innerHTML = '';
    services.forEach((service, index) => addServiceItem(service, index + 1));
}

// Social Media Management
function setupSocialMediaManagement() {
    const addButton = document.getElementById('addSocialMedia');
    if (!addButton) return;

    initializeSocialMediaModal();
}

function initializeSocialMediaModal() {
    const modal = document.getElementById('socialMediaModal');
    const addButton = document.getElementById('addSocialMedia');
    const confirmButton = document.getElementById('addSocialMediaConfirm');
    const cancelButton = document.getElementById('cancelSocialMedia');
    const platformSelect = document.getElementById('socialPlatform');
    const customPlatformGroup = document.getElementById('customPlatformGroup');

    addButton.addEventListener('click', () => modal.style.display = 'block');

    platformSelect.addEventListener('change', () => {
        customPlatformGroup.style.display = 
            platformSelect.value === 'custom' ? 'block' : 'none';
    });

    confirmButton.addEventListener('click', () => {
        const platform = platformSelect.value;
        const url = document.getElementById('socialUrl').value;
        const customPlatform = document.getElementById('customPlatform').value;

        if (url) {
            addSocialMediaItem(platform === 'custom' ? customPlatform : platform, url);
            modal.style.display = 'none';
            resetSocialMediaForm();
        }
    });

    cancelButton.addEventListener('click', () => {
        modal.style.display = 'none';
        resetSocialMediaForm();
    });
}

function resetSocialMediaForm() {
    document.getElementById('socialUrl').value = '';
    document.getElementById('customPlatform').value = '';
    document.getElementById('socialPlatform').value = 'facebook';
    document.getElementById('customPlatformGroup').style.display = 'none';
}

function addSocialMediaItem(platform, url) {
    const socialMediaList = document.getElementById('socialMediaList');
    if (!socialMediaList) return;

    const item = document.createElement('div');
    item.className = 'social-media-item';
    item.innerHTML = `
        <div class="input-with-icon">
            <i class="fab fa-${platform.toLowerCase()}"></i>
            <input type="url" name="social-${platform}" value="${url}">
            <button type="button" class="remove-social">&times;</button>
        </div>
    `;

    socialMediaList.appendChild(item);
    item.querySelector('.remove-social').addEventListener('click', () => item.remove());
}

// Holiday Management
function setupHolidayManagement() {
    const addButton = document.getElementById('addHoliday');
    if (addButton) {
        addButton.addEventListener('click', () => {
            const holidayCount = document.querySelectorAll('.holiday-item').length + 1;
            addHolidayItem({}, holidayCount);
        });
    }
}

function addHolidayItem(holiday = {}, index) {
    const holidayList = document.getElementById('holidayList');
    if (!holidayList) return;

    const item = document.createElement('div');
    item.className = 'holiday-item';
    item.innerHTML = `
        <div class="holiday-main">
            <input type="text" name="holiday-name-${index}" 
                value="${holiday.name || ''}" placeholder="Holiday Name" required>
            <input type="date" name="holiday-date-${index}" 
                value="${holiday.date || ''}" required>
        </div>
        <div class="holiday-hours">
            <label class="checkbox-label">
                <input type="checkbox" name="holiday-closed-${index}" 
                    ${holiday.closed ? 'checked' : ''}>
                Closed
            </label>
            <div class="time-inputs" ${holiday.closed ? 'style="display: none;"' : ''}>
                <input type="time" name="holiday-open-${index}" 
                    value="${holiday.open || '09:00'}" 
                    ${holiday.closed ? 'disabled' : ''}>
                <span>to</span>
                <input type="time" name="holiday-close-${index}" 
                    value="${holiday.close || '17:00'}" 
                    ${holiday.closed ? 'disabled' : ''}>
            </div>
        </div>
        <button type="button" class="remove-holiday">&times;</button>
    `;

    holidayList.appendChild(item);

    // Setup event listeners
    const closedCheckbox = item.querySelector(`[name="holiday-closed-${index}"]`);
    const timeInputs = item.querySelector('.time-inputs');
    const openInput = item.querySelector(`[name="holiday-open-${index}"]`);
    const closeInput = item.querySelector(`[name="holiday-close-${index}"]`);

    closedCheckbox.addEventListener('change', function() {
        timeInputs.style.display = this.checked ? 'none' : 'flex';
        openInput.disabled = this.checked;
        closeInput.disabled = this.checked;
    });

    item.querySelector('.remove-holiday').addEventListener('click', () => item.remove());
}

// Booking Management
function initializeBookings() {
    setupBookingFilters();
    loadBookings();
}

function setupBookingFilters() {
    const searchInput = document.getElementById('searchBookings');
    const statusFilter = document.getElementById('statusFilter');
    const dateFilter = document.getElementById('dateFilter');

    [searchInput, statusFilter, dateFilter].forEach(element => {
        if (element) {
            element.addEventListener('change', loadBookings);
        }
    });
}

function loadBookings() {
    const bookingsList = document.getElementById('bookingsList');
    if (!bookingsList) return;

    const bookings = getAllBookings();
    const filteredBookings = filterBookings(bookings);
    
    bookingsList.innerHTML = filteredBookings.map(booking => createBookingCard(booking)).join('');
}

function filterBookings(bookings) {
    const searchTerm = document.getElementById('searchBookings')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    const dateFilter = document.getElementById('dateFilter')?.value || '';

    return bookings.filter(booking => {
        const matchesSearch = !searchTerm || 
            booking.name.toLowerCase().includes(searchTerm) ||
            booking.service.toLowerCase().includes(searchTerm);
        const matchesStatus = !statusFilter || booking.status === statusFilter;
        const matchesDate = !dateFilter || booking.date.startsWith(dateFilter);
        
        return matchesSearch && matchesStatus && matchesDate;
    });
}

function createBookingCard(booking) {
    return `
        <div class="booking-card ${booking.status}">
            <div class="booking-header">
                <h3>${booking.name}</h3>
                <span class="booking-status">${booking.status}</span>
            </div>
            <div class="booking-details">
                <p><i class="fas fa-calendar"></i> ${new Date(booking.date).toLocaleDateString()}</p>
                <p><i class="fas fa-clock"></i> ${booking.time}</p>
                <p><i class="fas fa-tag"></i> ${booking.service}</p>
            </div>
            <div class="booking-actions">
                <button onclick="updateBookingStatus('${booking.id}', 'approved')" 
                        class="approve-btn" ${booking.status !== 'pending' ? 'disabled' : ''}>
                    <i class="fas fa-check"></i> Approve
                </button>
                <button onclick="updateBookingStatus('${booking.id}', 'rejected')"
                        class="reject-btn" ${booking.status !== 'pending' ? 'disabled' : ''}>
                    <i class="fas fa-times"></i> Reject
                </button>
            </div>
        </div>
    `;
}

// Dashboard Management
function initializeDashboard() {
    updateDashboardStats();
    loadRecentActivity();
    
    // Set up auto-refresh
    setInterval(() => {
        if (document.querySelector('#dashboard.active')) {
            updateDashboardStats();
            loadRecentActivity();
        }
    }, 60000);
}

function updateDashboardStats() {
    const stats = {
        todayBookings: getTodayBookings().length,
        pendingBookings: getPendingBookings().length,
        totalBookings: getAllBookings().length,
        isOpen: checkBusinessStatus()
    };

    Object.entries(stats).forEach(([key, value]) => {
        const element = document.getElementById(key);
        if (element) {
            if (key === 'isOpen') {
                element.textContent = value ? 'OPEN' : 'CLOSED';
                element.className = `status-indicator ${value ? 'open' : 'closed'}`;
            } else {
                element.textContent = value;
            }
        }
    });
}

// Helper Functions
function getDefaultBusinessHours() {
    return {
        sunday: { open: '09:00', close: '17:00', closed: true },
        monday: { open: '09:00', close: '17:00', closed: false },
        tuesday: { open: '09:00', close: '17:00', closed: false },
        wednesday: { open: '09:00', close: '17:00', closed: false },
        thursday: { open: '09:00', close: '17:00', closed: false },
        friday: { open: '09:00', close: '16:00', closed: false },
        saturday: { open: '10:00', close: '15:00', closed: true }
    };
}

function getDefaultSettings() {
    return {
        businessInfo: {
            name: "River's Portfolio",
            contactEmail: "contact@example.com",
            emergencyPhone: "555-123-4567",
            contactPhone: "567-436-8082",
            businessDescription: "Professional web design and development services",
            location: "Hidden",
            missionStatement: "To provide accessible and clean design for all."
        },
        socialMedia: [],
        holidays: [
            { 
                name: "New Year's Day", 
                date: "2025-01-01",
                closed: true,
                open: "",
                close: ""
            },
            { 
                name: "Independence Day", 
                date: "2025-07-04",
                closed: true,
                open: "",
                close: ""
            },
            { 
                name: "Thanksgiving", 
                date: "2025-11-28",
                closed: true,
                open: "",
                close: ""
            },
            { 
                name: "Christmas", 
                date: "2025-12-25",
                closed: true,
                open: "",
                close: ""
            }
        ],
        bookingSettings: {
            minNotice: 24,
            maxFuture: 30,
            services: ["Initial Consultation", "Follow-up Visit", "General Appointment", "Urgent Care"]
        }
    };
}

function getSocialMediaData() {
    const items = document.querySelectorAll('.social-media-item input');
    return Array.from(items).map(input => ({
        platform: input.name.replace('social-', ''),
        url: input.value
    }));
}

function getHolidayData() {
    const items = document.querySelectorAll('.holiday-item');
    return Array.from(items).map(item => ({
        name: item.querySelector('input[type="text"]').value,
        date: item.querySelector('input[type="date"]').value,
        closed: item.querySelector('input[type="checkbox"]').checked,
        open: item.querySelector('input[name^="holiday-open"]').value,
        close: item.querySelector('input[name^="holiday-close"]').value
    }));
}

function getServiceData() {
    const inputs = document.querySelectorAll('#servicesList input');
    return Array.from(inputs).map(input => input.value).filter(Boolean);
}

function loadSocialMedia(socialMedia = []) {
    const list = document.getElementById('socialMediaList');
    if (!list) return;

    list.innerHTML = '';
    socialMedia.forEach(item => addSocialMediaItem(item.platform, item.url));
}

function loadHolidays(holidays = []) {
    const list = document.getElementById('holidayList');
    if (!list) return;

    list.innerHTML = '';
    holidays.forEach((holiday, index) => addHolidayItem(holiday, index + 1));
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function addActivity(description) {
    const activities = JSON.parse(localStorage.getItem('activities') || '[]');
    activities.unshift({
        timestamp: CURRENT_TIMESTAMP,
        action: 'Update',
        description,
        user: CURRENT_USER
    });
    localStorage.setItem('activities', JSON.stringify(activities.slice(0, 50)));
}

function loadRecentActivity() {
    const activityLog = document.getElementById('activityLog');
    if (!activityLog) return;

    const activities = JSON.parse(localStorage.getItem('activities') || '[]');
    
    activityLog.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-header">
                <span>${activity.action}</span>
                <small>${new Date(activity.timestamp).toLocaleString()}</small>
            </div>
            <p>${activity.description}</p>
        </div>
    `).join('');
}

function updateBookingStatus(bookingId, status) {
    const bookings = getAllBookings();
    const booking = bookings.find(b => b.id.toString() === bookingId.toString());
    
    if (booking) {
        booking.status = status;
        booking.lastUpdated = CURRENT_TIMESTAMP;
        booking.lastUpdatedBy = CURRENT_USER;
        
        localStorage.setItem('bookings', JSON.stringify(bookings));
        
        addActivity(`Booking ${bookingId} ${status}`);
        loadBookings();
        updateDashboardStats();
        showNotification(`Booking ${status} successfully`);
    }
}

function addAdminNavLink() {
    const nav = document.querySelector('.desktop-menu');
    if (!nav || nav.querySelector('a[href="admin.html"]')) return;

    const adminLink = document.createElement('li');
    adminLink.innerHTML = '<a href="admin.html">Admin Portal</a>';
    nav.appendChild(adminLink);
}

// Booking Helper Functions
function getAllBookings() {
    return JSON.parse(localStorage.getItem('bookings')) || [];
}

function getTodayBookings() {
    const today = new Date(CURRENT_TIMESTAMP).toISOString().split('T')[0];
    return getAllBookings().filter(booking => booking.date === today);
}

function getPendingBookings() {
    return getAllBookings().filter(booking => booking.status === 'pending');
}

function checkBusinessStatus() {
    const hours = JSON.parse(localStorage.getItem('businessHours')) || getDefaultBusinessHours();
    const now = new Date(CURRENT_TIMESTAMP);
    const today = now.toISOString().split('T')[0];
    
    // Check if today is a holiday
    const settings = JSON.parse(localStorage.getItem('businessSettings')) || getDefaultSettings();
    const holiday = settings.holidays.find(h => h.date === today);
    
    if (holiday) {
        if (holiday.closed) return false;
        
        const currentTime = now.getHours() * 100 + now.getMinutes();
        const [openHour, openMin] = holiday.open.split(':').map(Number);
        const [closeHour, closeMin] = holiday.close.split(':').map(Number);
        
        const openTime = openHour * 100 + openMin;
        const closeTime = closeHour * 100 + closeMin;
        
        return currentTime >= openTime && currentTime < closeTime;
    }

    // Regular business hours check
    const day = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
    const schedule = hours[day];
    
    if (schedule.closed) return false;
    
    const currentTime = now.getHours() * 100 + now.getMinutes();
    const [openHour, openMinute] = schedule.open.split(':').map(Number);
    const [closeHour, closeMinute] = schedule.close.split(':').map(Number);
    
    const openTime = openHour * 100 + openMinute;
    const closeTime = closeHour * 100 + closeMinute;
    
    return currentTime >= openTime && currentTime < closeTime;
}
