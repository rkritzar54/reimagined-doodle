// Constants
const CURRENT_TIMESTAMP = '2025-03-26 03:50:09';
const CURRENT_USER = 'rkritzar54';

document.addEventListener('DOMContentLoaded', function() {
    // Initialize everything
    initializeBusinessHours();
    initializeBookingSystem();
    updatePublicDisplay();
    setupEventListeners();

    // Listen for storage changes (admin updates)
    window.addEventListener('storage', function(e) {
        if (e.key === 'businessSettings' || e.key === 'businessHours') {
            updatePublicDisplay();
        }
    });

    // Update every minute
    setInterval(updatePublicDisplay, 60000);
});

function initializeBusinessHours() {
    const hours = getBusinessHours();
    updateBusinessTable(hours);
    updateBusinessStatus(hours);
}

function getBusinessHours() {
    const stored = localStorage.getItem('businessHours');
    if (stored) {
        return JSON.parse(stored);
    }
    return {
        sunday: { closed: true },
        monday: { open: '10:00', close: '23:00', closed: false },
        tuesday: { open: '10:00', close: '23:00', closed: false },
        wednesday: { open: '10:00', close: '23:00', closed: false },
        thursday: { open: '10:00', close: '23:00', closed: false },
        friday: { open: '10:00', close: '23:00', closed: false },
        saturday: { open: '10:00', close: '23:00', closed: false }
    };
}

function updatePublicDisplay() {
    const settings = JSON.parse(localStorage.getItem('businessSettings')) || getDefaultSettings();
    const hours = getBusinessHours();
    
    updateTimeDisplay();
    updateContactInfo(settings);
    updateFooter(settings);
    updateHolidayList(settings);
    updateBusinessTable(hours);
    updateBusinessStatus(hours);
}

// Time Display and Conversion Functions
function updateTimeDisplay() {
    const timeElement = document.getElementById('currentTime');
    const zoneElement = document.getElementById('userTimeZone');
    
    if (timeElement) {
        const utcDate = new Date(CURRENT_TIMESTAMP);
        const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        timeElement.textContent = utcDate.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZone: userTimeZone
        });
    }
    if (zoneElement) {
        zoneElement.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
}

function convertEDTtoLocal(timeStr) {
    if (!timeStr) return '';
    
    // Parse EDT time
    const [hours, minutes] = timeStr.split(':').map(Number);
    
    // Create date object with EDT time
    const edtDate = new Date(CURRENT_TIMESTAMP);
    // EDT is UTC-4, so add 4 to convert EDT to UTC
    edtDate.setUTCHours(hours + 4, minutes, 0, 0);
    
    // Get time in user's timezone
    return edtDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
}

function convertLocalToEDT(localTimeStr) {
    if (!localTimeStr) return '';
    
    // Parse the local time
    const [time, period] = localTimeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    // Convert to 24-hour format
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    // Create date object with the local time
    const date = new Date(CURRENT_TIMESTAMP);
    date.setHours(hours, minutes, 0, 0);
    
    // Convert to EDT by getting UTC hours and subtracting 4 (EDT offset)
    const utcHours = date.getUTCHours();
    const edtHours = (24 + utcHours - 4) % 24;
    
    // Return in 24-hour format
    return `${edtHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function updateBusinessTable(hours) {
    const tableBody = document.getElementById('hoursTable');
    if (!tableBody) return;

    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    
    // Convert UTC to EDT for current day calculation
    const utcDate = new Date(CURRENT_TIMESTAMP);
    const edtOffset = -4; // EDT is UTC-4
    const edtDate = new Date(utcDate.getTime() + (edtOffset * 60 * 60 * 1000));
    const currentDay = edtDate.getDay();
    const today = edtDate.toISOString().split('T')[0];
    
    // Get holiday schedule if today is a holiday
    const settings = JSON.parse(localStorage.getItem('businessSettings')) || getDefaultSettings();
    const holidayToday = settings.holidays.find(h => h.date === today);

    const rows = days.map((day, index) => {
        const schedule = hours[day];
        const isToday = index === currentDay;
        
        let displayHours;
        if (isToday && holidayToday) {
            displayHours = holidayToday.closed ? 'Closed (Holiday)' : 
                `${convertEDTtoLocal(holidayToday.open)} - ${convertEDTtoLocal(holidayToday.close)} (Holiday)`;
        } else {
            displayHours = schedule.closed ? 'Closed' : 
                `${convertEDTtoLocal(schedule.open)} - ${convertEDTtoLocal(schedule.close)}`;
        }
        
        return `
            <tr${isToday ? ' class="today"' : ''}>
                <td>${capitalize(day)}</td>
                <td>${displayHours}</td>
            </tr>
        `;
    });

    tableBody.innerHTML = rows.join('');
}

function updateBusinessStatus(hours) {
    const statusText = document.getElementById('openClosedText');
    const statusIndicator = document.getElementById('currentStatus');
    const nextChangeElement = document.getElementById('nextChange');
    
    if (!statusText || !statusIndicator) return;

    const isOpen = checkIfOpen(hours);
    
    statusIndicator.className = `status-indicator ${isOpen ? 'open' : 'closed'}`;
    statusText.textContent = isOpen ? 'OPEN' : 'CLOSED';
    
    if (nextChangeElement) {
        nextChangeElement.textContent = getNextChangeTime(hours, isOpen);
    }
}

function checkIfOpen(hours) {
    const utcDate = new Date(CURRENT_TIMESTAMP);
    const edtOffset = -4; // EDT is UTC-4
    const edtDate = new Date(utcDate.getTime() + (edtOffset * 60 * 60 * 1000));
    const today = edtDate.toISOString().split('T')[0];
    
    // Check if today is a holiday
    const settings = JSON.parse(localStorage.getItem('businessSettings')) || getDefaultSettings();
    const holiday = settings.holidays.find(h => h.date === today);
    
    if (holiday) {
        if (holiday.closed) return false;
        
        const currentTime = edtDate.getHours() * 60 + edtDate.getMinutes();
        const [openHour, openMin] = holiday.open.split(':').map(Number);
        const [closeHour, closeMin] = holiday.close.split(':').map(Number);
        
        let openMinutes = openHour * 60 + openMin;
        let closeMinutes = closeHour * 60 + closeMin;
        
        if (closeMinutes < openMinutes) {
            closeMinutes += 24 * 60;
        }
        
        return currentTime >= openMinutes && currentTime < closeMinutes;
    }

    // Regular business hours check
    const day = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][edtDate.getDay()];
    const schedule = hours[day];

    if (schedule.closed) return false;

    const currentTime = edtDate.getHours() * 60 + edtDate.getMinutes();
    const [openHour, openMin] = schedule.open.split(':').map(Number);
    const [closeHour, closeMin] = schedule.close.split(':').map(Number);

    let openMinutes = openHour * 60 + openMin;
    let closeMinutes = closeHour * 60 + closeMin;
    
    if (closeMinutes < openMinutes) {
        closeMinutes += 24 * 60;
    }

    return currentTime >= openMinutes && currentTime < closeMinutes;
}

function getNextChangeTime(hours, isOpen) {
    const utcDate = new Date(CURRENT_TIMESTAMP);
    const edtOffset = -4; // EDT is UTC-4
    const edtDate = new Date(utcDate.getTime() + (edtOffset * 60 * 60 * 1000));
    const today = edtDate.toISOString().split('T')[0];
    
    // Check if today is a holiday
    const settings = JSON.parse(localStorage.getItem('businessSettings')) || getDefaultSettings();
    const holiday = settings.holidays.find(h => h.date === today);
    
    if (holiday) {
        if (holiday.closed) {
            return getNextOpeningTime(hours);
        }
        return isOpen ? `Closes at ${convertEDTtoLocal(holiday.close)}` : 
                       `Opens at ${convertEDTtoLocal(holiday.open)}`;
    }

    const day = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][edtDate.getDay()];
    
    if (isOpen) {
        return `Closes at ${convertEDTtoLocal(hours[day].close)}`;
    } else {
        return `Opens ${getNextOpeningTime(hours)}`;
    }
}

function getNextOpeningTime(hours) {
    // Convert UTC to EDT for date calculations
    const utcDate = new Date(CURRENT_TIMESTAMP); // Updated timestamp: '2025-03-26 03:51:32'
    const edtOffset = -4; // EDT is UTC-4
    const now = new Date(utcDate.getTime() + (edtOffset * 60 * 60 * 1000));
    let checkDay = now.getDay();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    
    for (let i = 1; i <= 7; i++) {
        checkDay = (checkDay + 1) % 7;
        const nextDate = new Date(now);
        nextDate.setDate(now.getDate() + i);
        const nextDateStr = nextDate.toISOString().split('T')[0];
        
        // Check if next day is a holiday
        const settings = JSON.parse(localStorage.getItem('businessSettings')) || getDefaultSettings();
        const holiday = settings.holidays.find(h => h.date === nextDateStr);
        
        if (holiday) {
            if (!holiday.closed) {
                return `${holiday.name} at ${convertEDTtoLocal(holiday.open)}`;
            }
            continue;
        }

        const nextDay = days[checkDay];
        if (!hours[nextDay].closed) {
            return `${capitalize(nextDay)} at ${convertEDTtoLocal(hours[nextDay].open)}`;
        }
    }
    return 'soon';
}

function updateContactInfo(settings) {
    const contactInfo = document.getElementById('contactInfo');
    if (contactInfo) {
        contactInfo.innerHTML = `
            <p class="contact-email">Email: ${settings.businessInfo.contactEmail}</p>
            <p class="contact-phone">Phone: ${settings.businessInfo.contactPhone}</p>
            <p class="emergency-contact">Emergency: ${settings.businessInfo.emergencyPhone}</p>
            <p class="contact-location">Location: ${settings.businessInfo.location}</p>
        `;
    }
}

function updateFooter(settings) {
    // Update business name
    const footerBusinessName = document.getElementById('footerBusinessName');
    if (footerBusinessName) {
        footerBusinessName.textContent = settings.businessInfo.name;
    }

    // Update contact info
    const footerContactInfo = document.getElementById('footerContactInfo');
    if (footerContactInfo) {
        footerContactInfo.innerHTML = `
            <p>Address: ${settings.businessInfo.location}</p>
            <p>Phone: ${settings.businessInfo.contactPhone}</p>
            <p>Email: ${settings.businessInfo.contactEmail}</p>
        `;
    }

    // Update social links
    const footerSocialLinks = document.getElementById('footerSocialLinks');
    if (footerSocialLinks) {
        const socialLinksHTML = settings.socialMedia.map(social => `
            <a href="${social.url}" target="_blank" rel="noopener noreferrer">
                <i class="fab fa-${social.platform.toLowerCase()}"></i>
                ${social.platform}
            </a>
        `).join('');
        footerSocialLinks.innerHTML = socialLinksHTML;
    }

    // Update mission info
    const footerMissionInfo = document.getElementById('footerMissionInfo');
    if (footerMissionInfo) {
        footerMissionInfo.innerHTML = `
            <p><strong>Mission Statement:</strong></p>
            <p>${settings.businessInfo.missionStatement}</p>
            <p class="footer-description">${settings.businessInfo.businessDescription}</p>
        `;
    }
}

function updateHolidayList(settings) {
    const holidayList = document.getElementById('holidayList');
    if (holidayList && settings.holidays) {
        // Convert UTC to EDT for date comparisons
        const utcDate = new Date(CURRENT_TIMESTAMP);
        const edtOffset = -4; // EDT is UTC-4
        const edtDate = new Date(utcDate.getTime() + (edtOffset * 60 * 60 * 1000));
        
        holidayList.innerHTML = settings.holidays
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .map(holiday => {
                const holidayDate = new Date(holiday.date);
                const displayDate = holidayDate.toLocaleDateString();
                const isPast = holidayDate < edtDate;
                
                const holidayHours = holiday.closed ? 
                    '<span class="holiday-closed">Closed</span>' : 
                    `<span class="holiday-hours">${formatTimeRange(holiday.open, holiday.close)}</span>`;
                
                return `
                    <li class="${isPast ? 'past-holiday' : 'upcoming-holiday'}">
                        <div class="holiday-info">
                            <strong>${holiday.name}</strong>
                            <span class="holiday-date">${displayDate}</span>
                        </div>
                        ${holidayHours}
                    </li>
                `;
            }).join('');
    }
}

// Booking System Integration
function initializeBookingSystem() {
    const settings = JSON.parse(localStorage.getItem('businessSettings')) || getDefaultSettings();
    setupBookingForm(settings);
    setupBookingModal();
}

function setupBookingForm(settings) {
    const serviceSelect = document.getElementById('service');
    if (serviceSelect) {
        serviceSelect.innerHTML = '<option value="">Select a service...</option>' +
            settings.bookingSettings.services.map(service => 
                `<option value="${service}">${service}</option>`
            ).join('');
    }

    const dateInput = document.getElementById('date');
    if (dateInput) {
        // Convert UTC to EDT for date calculations
        const utcDate = new Date(CURRENT_TIMESTAMP);
        const edtOffset = -4; // EDT is UTC-4
        const edtDate = new Date(utcDate.getTime() + (edtOffset * 60 * 60 * 1000));
        
        const minDate = new Date(edtDate);
        minDate.setDate(minDate.getDate() + 1);
        const maxDate = new Date(edtDate);
        maxDate.setDate(maxDate.getDate() + settings.bookingSettings.maxFuture);

        dateInput.min = minDate.toISOString().split('T')[0];
        dateInput.max = maxDate.toISOString().split('T')[0];
        dateInput.addEventListener('change', handleDateChange);
    }
}

// Event Listeners
function setupEventListeners() {
    const refreshButton = document.getElementById('refreshStatus');
    if (refreshButton) {
        refreshButton.addEventListener('click', () => {
            updatePublicDisplay();
        });
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            const modal = document.getElementById('bookingModal');
            if (modal && modal.style.display === 'block') {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
        }
    });
}

// Utility Functions
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatTimeRange(start, end) {
    if (!start || !end) return 'Hours not set';
    return `${convertEDTtoLocal(start)} - ${convertEDTtoLocal(end)}`;
}

function isToday(date) {
    const utcDate = new Date(CURRENT_TIMESTAMP);
    const edtOffset = -4; // EDT is UTC-4
    const today = new Date(utcDate.getTime() + (edtOffset * 60 * 60 * 1000));
    const checkDate = new Date(date);
    return today.toISOString().split('T')[0] === checkDate.toISOString().split('T')[0];
}

// Default Settings
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
        socialMedia: [
            {
                platform: "GitHub",
                url: "https://github.com/rkritzar54",
                icon: "github"
            }
        ],
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
            services: [
                "Initial Consultation",
                "Website Design",
                "Website Development",
                "Maintenance Service",
                "SEO Optimization"
            ],
            timeSlotDuration: 60,
            bufferBetweenBookings: 15
        }
    };
}

// Initialize everything when the script loads
document.addEventListener('DOMContentLoaded', () => {
    try {
        initializeBusinessHours();
        initializeBookingSystem();
        updatePublicDisplay();
        setupEventListeners();
    } catch (error) {
        console.error('Initialization error:', error);
        showNotification('There was an error initializing the system. Please refresh the page.', 'error');
    }
});

// Auto-refresh status every minute
setInterval(() => {
    try {
        updatePublicDisplay();
    } catch (error) {
        console.error('Auto-refresh error:', error);
    }
}, 60000);
