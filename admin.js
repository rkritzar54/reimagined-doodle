// Constants
const CURRENT_TIMESTAMP = '2025-03-25 22:55:50';
const CURRENT_USER = 'rkritzar54';

document.addEventListener('DOMContentLoaded', function() {
    // Update timestamp display
    document.getElementById('currentTime').textContent = new Date(CURRENT_TIMESTAMP).toLocaleString();

    // Initialize tabs
    initializeTabs();

    // Initialize all sections
    initializeBusinessHours();
    initializeSettings();
    initializeDashboard();
    initializeBookings();
});

// Tab Management
function initializeTabs() {
    const tabLinks = document.querySelectorAll('.admin-sidebar li');
    const tabContents = document.querySelectorAll('.admin-tab');
    
    tabLinks.forEach(link => {
        link.addEventListener('click', () => {
            const tabId = link.getAttribute('data-tab');
            
            // Update active states
            tabLinks.forEach(l => l.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            link.classList.add('active');
            document.getElementById(tabId).classList.add('active');
            
            // Update URL hash and load tab data
            history.pushState(null, null, `#${tabId}`);
            loadTabData(tabId);
        });
    });

    // Handle initial load and browser back/forward
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
}

function handleHashChange() {
    const hash = window.location.hash.slice(1) || 'dashboard';
    const tabLink = document.querySelector(`.admin-sidebar li[data-tab="${hash}"]`);
    if (tabLink) {
        tabLink.click();
    }
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

// Section Initializers
function initializeBusinessHours() {
    const businessHoursForm = document.getElementById('businessHoursForm');
    if (businessHoursForm) {
        businessHoursForm.addEventListener('submit', saveBusinessHours);
        
        // Enable/disable time inputs based on checkbox
        document.querySelectorAll('[type="checkbox"][name$="-open"]').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const day = this.name.replace('-open', '');
                const timeInputs = document.querySelectorAll(`[name^="${day}-"]:not([name$="-open"])`);
                timeInputs.forEach(input => input.disabled = !this.checked);
            });
        });
        
        loadBusinessHours();
    }
}

function initializeSettings() {
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', saveSettings);
        setupServiceManagement();
        setupSocialMediaManagement();
        setupHolidayManagement();
        loadSettings();
    }
}

function initializeDashboard() {
    updateDashboardStats();
    loadRecentActivity();
    
    // Refresh dashboard data every minute
    setInterval(() => {
        if (document.querySelector('#dashboard.active')) {
            updateDashboardStats();
            loadRecentActivity();
        }
    }, 60000);
}

function initializeBookings() {
    const searchInput = document.getElementById('searchBookings');
    const statusFilter = document.getElementById('statusFilter');
    const dateFilter = document.getElementById('dateFilter');

    if (searchInput && statusFilter && dateFilter) {
        searchInput.addEventListener('input', loadBookings);
        statusFilter.addEventListener('change', loadBookings);
        dateFilter.addEventListener('change', loadBookings);
    }
}

// Business Hours Functions
function saveBusinessHours(e) {
    e.preventDefault();
    const hours = {};
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
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

function loadBusinessHours() {
    const hours = JSON.parse(localStorage.getItem('businessHours')) || getDefaultBusinessHours();
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    days.forEach(day => {
        const dayData = hours[day];
        const openCheckbox = document.querySelector(`[name="${day}-open"]`);
        const startInput = document.querySelector(`[name="${day}-start"]`);
        const endInput = document.querySelector(`[name="${day}-end"]`);
        
        if (openCheckbox && startInput && endInput) {
            openCheckbox.checked = !dayData.closed;
            startInput.value = dayData.open || '09:00';
            endInput.value = dayData.close || '17:00';
            startInput.disabled = dayData.closed;
            endInput.disabled = dayData.closed;
        }
    });
}

// Settings Functions
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

function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('businessSettings')) || getDefaultSettings();
    
    // Load business info
    Object.entries(settings.businessInfo).forEach(([key, value]) => {
        const input = document.querySelector(`[name="${key}"]`);
        if (input) input.value = value;
    });

    // Load social media, holidays, and services
    loadSocialMedia(settings.socialMedia);
    loadHolidays(settings.holidays);
    loadBookingSettings(settings.bookingSettings);
}

// Social Media Management
function setupSocialMediaManagement() {
    const addButton = document.getElementById('addSocialMedia');
    const modal = document.getElementById('socialMediaModal');
    const platformSelect = document.getElementById('socialPlatform');
    const customPlatformGroup = document.getElementById('customPlatformGroup');

    addButton.addEventListener('click', () => modal.style.display = 'block');

    platformSelect.addEventListener('change', () => {
        customPlatformGroup.style.display = 
            platformSelect.value === 'custom' ? 'block' : 'none';
    });

    document.getElementById('addSocialMediaConfirm').addEventListener('click', () => {
        const platform = platformSelect.value;
        const url = document.getElementById('socialUrl').value;
        const customPlatform = document.getElementById('customPlatform').value;
        
        if (url) {
            addSocialMediaItem(platform === 'custom' ? customPlatform : platform, url);
            modal.style.display = 'none';
            document.getElementById('socialUrl').value = '';
            document.getElementById('customPlatform').value = '';
            platformSelect.value = 'facebook';
            customPlatformGroup.style.display = 'none';
        }
    });

    document.getElementById('cancelSocialMedia').addEventListener('click', () => {
        modal.style.display = 'none';
    });
}

function addSocialMediaItem(platform, url) {
    const socialMediaList = document.getElementById('socialMediaList');
    const item = document.createElement('div');
    item.className = 'social-media-item';
    
    item.innerHTML = `
        <div class="input-with-icon">
            <i class="fab fa-${platform}"></i>
            <input type="url" name="social-${platform}" value="${url}">
            <button type="button" class="remove-social">&times;</button>
        </div>
    `;

    socialMediaList.appendChild(item);
    item.querySelector('.remove-social').addEventListener('click', () => item.remove());
}

// Service Management
function setupServiceManagement() {
    const addButton = document.getElementById('addService');
    addButton.addEventListener('click', () => {
        const serviceCount = document.getElementById('servicesList').children.length + 1;
        addServiceItem('', serviceCount);
    });
}

function addServiceItem(value, index) {
    const servicesList = document.getElementById('servicesList');
    const item = document.createElement('div');
    item.className = 'service-item';
    
    item.innerHTML = `
        <input type="text" name="service-${index}" value="${value}" placeholder="Service name">
        <button type="button" class="remove-service">&times;</button>
    `;

    servicesList.appendChild(item);
    item.querySelector('.remove-service').addEventListener('click', () => item.remove());
}

// Holiday Management
function setupHolidayManagement() {
    const addButton = document.getElementById('addHoliday');
    addButton.addEventListener('click', () => {
        const holidayCount = document.getElementById('holidayList').children.length + 1;
        addHolidayItem('', '', holidayCount);
    });
}

function addHolidayItem(name, date, index) {
    const holidayList = document.getElementById('holidayList');
    const item = document.createElement('div');
    item.className = 'holiday-item';
    
    item.innerHTML = `
        <input type="text" name="holiday-name-${index}" value="${name}" placeholder="Holiday Name">
        <input type="date" name="holiday-date-${index}" value="${date}">
        <button type="button" class="remove-holiday">&times;</button>
    `;

    holidayList.appendChild(item);
    item.querySelector('.remove-holiday').addEventListener('click', () => item.remove());
}

// Dashboard Functions
function updateDashboardStats() {
    document.getElementById('todayBookings').textContent = getTodayBookings().length;
    document.getElementById('pendingBookings').textContent = getPendingBookings().length;
    document.getElementById('totalBookings').textContent = getAllBookings().length;
    
    const status = checkBusinessStatus();
    const statusElement = document.getElementById('businessStatus');
    statusElement.textContent = status ? 'OPEN' : 'CLOSED';
    statusElement.className = `status-indicator ${status ? 'open' : 'closed'}`;
}

function loadRecentActivity() {
    const activityLog = document.getElementById('activityLog');
    const activities = getRecentActivities();
    
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

// Booking Management
function loadBookings() {
    const bookingsList = document.getElementById('bookingsList');
    const bookings = getAllBookings();
    const searchTerm = document.getElementById('searchBookings').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;

    const filteredBookings = bookings.filter(booking => {
        const matchesSearch = !searchTerm || 
            booking.customerName.toLowerCase().includes(searchTerm) ||
            booking.service.toLowerCase().includes(searchTerm);
        const matchesStatus = !statusFilter || booking.status === statusFilter;
        const matchesDate = !dateFilter || booking.date.startsWith(dateFilter);
        
        return matchesSearch && matchesStatus && matchesDate;
    });

    bookingsList.innerHTML = filteredBookings.map(booking => `
        <div class="booking-card ${booking.status}">
            <div class="booking-header">
                <h3>${booking.customerName}</h3>
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
    `).join('');
}

// Helper Functions
function getSocialMediaData() {
    const socialMediaItems = document.querySelectorAll('.social-media-item input');
    return Array.from(socialMediaItems).map(input => ({
        platform: input.name.replace('social-', ''),
        url: input.value
    }));
}

function getHolidayData() {
    const holidayItems = document.querySelectorAll('.holiday-item');
    return Array.from(holidayItems).map(item => ({
        name: item.querySelector('input[type="text"]').value,
        date: item.querySelector('input[type="date"]').value
    }));
}

function getServiceData() {
    const serviceInputs = document.querySelectorAll('#servicesList input');
    return Array.from(serviceInputs).map(input => input.value).filter(Boolean);
}

function loadSocialMedia(socialMedia = []) {
    const socialMediaList = document.getElementById('socialMediaList');
    socialMediaList.innerHTML = '';
    socialMedia.forEach(item => addSocialMediaItem(item.platform, item.url));
}

function loadHolidays(holidays = []) {
    const holidayList = document.getElementById('holidayList');
    holidayList.innerHTML = '';
    holidays.forEach((holiday, index) => addHolidayItem(holiday.name, holiday.date, index + 1));
}

function loadServices(services = []) {
    const servicesList = document.getElementById('servicesList');
    servicesList.innerHTML = '';
    services.forEach((service, index) => addServiceItem(service, index + 1));
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
    const activities = JSON.parse(localStorage.getItem('activities')) || [];
    activities.unshift({
        timestamp: CURRENT_TIMESTAMP,
        action: 'Update',
        description,
        user: CURRENT_USER
    });
    localStorage.setItem('activities', JSON.stringify(activities.slice(0, 50)));
    loadRecentActivity();
}

// Get default data
function getDefaultSettings() {
    return {
        businessInfo: {
            name: "River's Portfolio",
            contactEmail: "contact@example.com",
            emergencyPhone: "555-123-4567",
            contactPhone: "567-436-8082",
            businessDescription: "",
            location: "Hidden",
            missionStatement: "To provide accessible and clean design for all."
        },
        socialMedia: [],
        holidays: [
            { name: "New Year's Day", date: "2025-01-01" },
            { name: "Independence Day", date: "2025-07-04" },
            { name: "Thanksgiving", date: "2025-11-28" },
            { name: "Christmas", date: "2025-12-25" }
        ],
        bookingSettings: {
            minNotice: 24,
            maxFuture: 30,
            services: ["Initial Consultation", "Follow-up Visit", "General Appointment", "Urgent Care"]
        }
    };
}

function getDefaultBusinessHours() {
    return {
        monday: { open: '09:00', close: '17:00', closed: false },
        tuesday: { open: '09:00', close: '17:00', closed: false },
        wednesday: { open: '09:00', close: '17:00', closed: false },
        thursday: { open: '09:00', close: '17:00', closed: false },
        friday: { open: '09:00', close: '16:00', closed: false },
        saturday: { open: '09:00', close: '17:00', closed: true },
        sunday: { open: '09:00', close: '17:00', closed: true }
    };
}

// Booking Helper Functions
function getTodayBookings() {
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    const today = new Date(CURRENT_TIMESTAMP).toISOString().split('T')[0];
    return bookings.filter(booking => booking.date === today);
}

function getPendingBookings() {
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    return bookings.filter(booking => booking.status === 'pending');
}

function getAllBookings() {
    return JSON.parse(localStorage.getItem('bookings')) || [];
}

function getRecentActivities() {
    return JSON.parse(localStorage.getItem('activities')) || [];
}

function checkBusinessStatus() {
    const hours = JSON.parse(localStorage.getItem('businessHours')) || getDefaultBusinessHours();
    const now = new Date(CURRENT_TIMESTAMP);
    const day = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
    
    if (hours[day].closed) return false;
    
    const currentTime = now.getHours() * 100 + now.getMinutes();
    const [openHour, openMinute] = hours[day].open.split(':').map(Number);
    const [closeHour, closeMinute] = hours[day].close.split(':').map(Number);
    
    const openTime = openHour * 100 + openMinute;
    const closeTime = closeHour * 100 + closeMinute;
    
    return currentTime >= openTime && currentTime < closeTime;
}

function updateBookingStatus(bookingId, status) {
    const bookings = getAllBookings();
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
        booking.status = status;
        localStorage.setItem('bookings', JSON.stringify(bookings));
        addActivity(`Booking ${bookingId} ${status}`);
        loadBookings();
        updateDashboardStats();
        showNotification(`Booking ${status} successfully`);
    }
}
