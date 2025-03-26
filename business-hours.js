// Constants
const CURRENT_TIMESTAMP = '2025-03-26 02:06:45';
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
    
    // Update indicator
    statusIndicator.className = `status-indicator ${isOpen ? 'open' : 'closed'}`;
    
    // Update text
    statusText.textContent = isOpen ? 'OPEN' : 'CLOSED';
    
    // Update next change time
    if (nextChangeElement) {
        nextChangeElement.textContent = getNextChangeTime(hours, isOpen);
    }
}

function checkIfOpen(hours) {
    // Convert UTC to EDT
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
    // Convert UTC to EDT
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
    const utcDate = new Date(CURRENT_TIMESTAMP);
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

function handleDateChange(event) {
    const selectedDate = new Date(event.target.value);
    const dateString = event.target.value;
    const dayOfWeek = selectedDate.getDay();
    const hours = getBusinessHours();
    const settings = JSON.parse(localStorage.getItem('businessSettings')) || getDefaultSettings();
    
    const timeInput = document.getElementById('time');
    const timeHelp = document.getElementById('timeHelp');
    
    if (!timeInput) return;

    // Check if selected date is a holiday
    const holiday = settings.holidays.find(h => h.date === dateString);
    
    if (holiday) {
        if (holiday.closed) {
            timeInput.disabled = true;
            timeInput.value = '';
            if (timeHelp) {
                timeHelp.textContent = `${holiday.name} - Closed`;
                timeHelp.className = 'text-danger';
            }
            return;
        }
        
        timeInput.disabled = false;
        timeInput.min = holiday.open;
        timeInput.max = holiday.close;
        
        if (timeHelp) {
            timeHelp.textContent = `${holiday.name} hours: ${convertEDTtoLocal(holiday.open)} - ${convertEDTtoLocal(holiday.close)}`;
            timeHelp.className = 'text-info';
        }
        return;
    }

    // Regular business hours check
    const schedule = hours[['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayOfWeek]];

    if (schedule.closed) {
        timeInput.disabled = true;
        timeInput.value = '';
        if (timeHelp) {
            timeHelp.textContent = 'Closed on this day';
            timeHelp.className = 'text-danger';
        }
        return;
    }

    timeInput.disabled = false;
    timeInput.min = schedule.open;
    timeInput.max = schedule.close;

    if (timeHelp) {
        timeHelp.textContent = `Business hours: ${convertEDTtoLocal(schedule.open)} - ${convertEDTtoLocal(schedule.close)}`;
        timeHelp.className = 'text-info';
    }
}

function setupBookingModal() {
    const modal = document.getElementById('bookingModal');
    const openBtn = document.getElementById('bookingButton');
    const closeBtn = document.querySelector('.modal-close');
    const form = document.getElementById('bookingForm');

    if (openBtn) {
        openBtn.addEventListener('click', () => {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        });
    }

    if (form) {
        form.addEventListener('submit', handleBookingSubmission);
    }

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    });
}

function handleBookingSubmission(event) {
    event.preventDefault();
    
    const formData = {
        id: Date.now(),
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        date: document.getElementById('date').value,
        time: document.getElementById('time').value,
        service: document.getElementById('service').value,
        notes: document.getElementById('notes').value,
        status: 'pending',
        submittedBy: CURRENT_USER,
        submissionTime: CURRENT_TIMESTAMP
    };

    if (!validateBooking(formData)) return;

    saveBooking(formData);
    
    event.target.reset();
    document.getElementById('bookingModal').style.display = 'none';
    document.body.style.overflow = '';
    showNotification('Thank you! Your booking request has been submitted and is pending approval.', 'success');
}

function validateBooking(booking) {
    if (!booking.service) {
        showNotification('Please select a service.', 'error');
        return false;
    }

    // Convert UTC to EDT for validation
    const selectedDay = new Date(booking.date).getDay();
    const hours = getBusinessHours();
    const settings = JSON.parse(localStorage.getItem('businessSettings')) || getDefaultSettings();
    
    // Check if booking date is a holiday
    const holiday = settings.holidays.find(h => h.date === booking.date);
    if (holiday) {
        if (holiday.closed) {
            showNotification(`Selected date (${holiday.name}) is not available for booking. Please choose another day.`, 'error');
            return false;
        }
        
        const [selectedHour, selectedMinute] = booking.time.split(':').map(Number);
        const [openHour, openMinute] = holiday.open.split(':').map(Number);
        const [closeHour, closeMinute] = holiday.close.split(':').map(Number);
        
        const selectedMinutes = selectedHour * 60 + selectedMinute;
        const openMinutes = openHour * 60 + openMinute;
        const closeMinutes = closeHour * 60 + closeMinute;
        
        if (selectedMinutes < openMinutes || selectedMinutes >= closeMinutes) {
            showNotification(`Selected time is outside of holiday hours. Please choose a time between ${
                convertEDTtoLocal(holiday.open)} and ${convertEDTtoLocal(holiday.close)}`, 'error');
            return false;
        }
        return true;
    }

    // Regular business hours check
    const schedule = hours[['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][selectedDay]];

    if (schedule.closed) {
        showNotification('Selected day is not available for booking. Please choose another day.', 'error');
        return false;
    }

    const [selectedHour, selectedMinute] = booking.time.split(':').map(Number);
    const [openHour, openMinute] = schedule.open.split(':').map(Number);
    const [closeHour, closeMinute] = schedule.close.split(':').map(Number);

    const selectedMinutes = selectedHour * 60 + selectedMinute;
    const openMinutes = openHour * 60 + openMinute;
    const closeMinutes = closeHour * 60 + closeMinute;

    if (selectedMinutes < openMinutes || selectedMinutes >= closeMinutes) {
        showNotification(`Selected time is outside of business hours. Please choose a time between ${
            convertEDTtoLocal(schedule.open)} and ${convertEDTtoLocal(schedule.close)}`, 'error');
        return false;
    }

    return true;
}

function saveBooking(booking) {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    bookings.push(booking);
    localStorage.setItem('bookings', JSON.stringify(bookings));

    // Add to activity log
    const activities = JSON.parse(localStorage.getItem('activities') || '[]');
    activities.unshift({
        timestamp: CURRENT_TIMESTAMP,
        action: 'New Booking',
        description: `Booking request from ${booking.name} for ${booking.service} on ${booking.date} at ${convertEDTtoLocal(booking.time)}`,
        user: CURRENT_USER
    });
    localStorage.setItem('activities', JSON.stringify(activities.slice(0, 50)));
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Auto-dismiss after 5 seconds
    const dismissTimeout = setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
    
    // Allow manual dismissal
    notification.querySelector('.notification-close').addEventListener('click', () => {
        clearTimeout(dismissTimeout);
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    });
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

    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        const inputs = bookingForm.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('invalid', (event) => {
                event.preventDefault();
                showNotification(`Please check the ${input.name} field`, 'error');
            });
        });
    }
}

// Utility functions
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDateTime(date) {
    return new Date(date).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

function isToday(date) {
    const utcDate = new Date(CURRENT_TIMESTAMP);
    const edtOffset = -4; // EDT is UTC-4
    const today = new Date(utcDate.getTime() + (edtOffset * 60 * 60 * 1000));
    const checkDate = new Date(date);
    return today.toISOString().split('T')[0] === checkDate.toISOString().split('T')[0];
}

function formatTimeRange(start, end) {
    if (!start || !end) return 'Hours not set';
    return `${convertEDTtoLocal(start)} - ${convertEDTtoLocal(end)}`;
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
