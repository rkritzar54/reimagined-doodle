// Constants
const CURRENT_TIMESTAMP = '2025-03-25 23:20:54';
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
        timeElement.textContent = new Date(CURRENT_TIMESTAMP).toLocaleString();
    }
    if (zoneElement) {
        zoneElement.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
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

    // Update business owner
    const footerBusinessOwner = document.getElementById('footerBusinessOwner');
    if (footerBusinessOwner) {
        footerBusinessOwner.textContent = settings.businessInfo.name;
    }
}

function updateHolidayList(settings) {
    const holidayList = document.getElementById('holidayList');
    if (holidayList && settings.holidays) {
        holidayList.innerHTML = settings.holidays
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .map(holiday => `
                <li>
                    <strong>${holiday.name}</strong>
                    <span>${new Date(holiday.date).toLocaleDateString()}</span>
                </li>
            `).join('');
    }
}

function updateBusinessTable(hours) {
    const tableBody = document.getElementById('hoursTable');
    if (!tableBody) return;

    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = new Date(CURRENT_TIMESTAMP).getDay();

    const rows = days.map((day, index) => {
        const schedule = hours[day];
        const isToday = index === currentDay;
        
        const displayHours = schedule.closed ? 'Closed' : 
            `${convertEDTtoLocal(schedule.open)} - ${convertEDTtoLocal(schedule.close)}`;
        
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
    const now = new Date(CURRENT_TIMESTAMP);
    const day = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
    const schedule = hours[day];

    if (schedule.closed) return false;

    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [openHour, openMin] = schedule.open.split(':').map(Number);
    const [closeHour, closeMin] = schedule.close.split(':').map(Number);

    const openMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;

    return currentTime >= openMinutes && currentTime < closeMinutes;
}

function getNextChangeTime(hours, isOpen) {
    const now = new Date(CURRENT_TIMESTAMP);
    const day = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
    
    if (isOpen) {
        return `Closes at ${convertEDTtoLocal(hours[day].close)}`;
    } else {
        return `Opens ${getNextOpeningTime(hours)}`;
    }
}

function getNextOpeningTime(hours) {
    const now = new Date(CURRENT_TIMESTAMP);
    let checkDay = now.getDay();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    
    for (let i = 1; i <= 7; i++) {
        checkDay = (checkDay + 1) % 7;
        const nextDay = days[checkDay];
        
        if (!hours[nextDay].closed) {
            return `${capitalize(nextDay)} at ${convertEDTtoLocal(hours[nextDay].open)}`;
        }
    }
    return 'soon';
}

function convertEDTtoLocal(timeStr) {
    if (!timeStr) return '';
    
    const [hours, minutes] = timeStr.split(':').map(Number);
    
    const edtDate = new Date();
    edtDate.setUTCHours(hours + 4, minutes, 0, 0);
    
    const localDate = new Date(edtDate.getTime());
    
    return localDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
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
        const now = new Date(CURRENT_TIMESTAMP);
        const minDate = new Date(now);
        minDate.setDate(minDate.getDate() + 1);
        const maxDate = new Date(now);
        maxDate.setDate(maxDate.getDate() + settings.bookingSettings.maxFuture);

        dateInput.min = minDate.toISOString().split('T')[0];
        dateInput.max = maxDate.toISOString().split('T')[0];
        dateInput.addEventListener('change', handleDateChange);
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
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    if (form) {
        form.addEventListener('submit', handleBookingSubmission);
    }

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

function handleDateChange(event) {
    const selectedDate = new Date(event.target.value);
    const dayOfWeek = selectedDate.getDay();
    const hours = getBusinessHours();
    const schedule = hours[['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayOfWeek]];

    const timeInput = document.getElementById('time');
    if (!timeInput) return;

    if (schedule.closed) {
        timeInput.disabled = true;
        timeInput.value = '';
        alert('Selected day is not available for booking. Please choose another day.');
        return;
    }

    timeInput.disabled = false;
    timeInput.min = schedule.open;
    timeInput.max = schedule.close;

    const timeHelp = document.getElementById('timeHelp');
    if (timeHelp) {
        timeHelp.textContent = `Business hours: ${convertEDTtoLocal(schedule.open)} - ${convertEDTtoLocal(schedule.close)}`;
    }
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
    alert('Thank you! Your booking request has been submitted and is pending approval.');
}

function validateBooking(booking) {
    if (!booking.service) {
        alert('Please select a service.');
        return false;
    }

    const selectedDay = new Date(booking.date).getDay();
    const hours = getBusinessHours();
    const schedule = hours[['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][selectedDay]];

    if (schedule.closed) {
        alert('Selected day is not available for booking. Please choose another day.');
        return false;
    }

    const [selectedHour, selectedMinute] = booking.time.split(':').map(Number);
    const [openHour, openMinute] = schedule.open.split(':').map(Number);
    const [closeHour, closeMinute] = schedule.close.split(':').map(Number);

    const selectedMinutes = selectedHour * 60 + selectedMinute;
    const openMinutes = openHour * 60 + openMinute;
    const closeMinutes = closeHour * 60 + closeMinute;

    if (selectedMinutes < openMinutes || selectedMinutes >= closeMinutes) {
        alert(`Selected time is outside of business hours. Please choose a time between ${
            convertEDTtoLocal(schedule.open)} and ${convertEDTtoLocal(schedule.close)}`);
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
        description: `Booking request from ${booking.name} for ${booking.service} on ${booking.date} at ${booking.time}`,
        user: CURRENT_USER
    });
    localStorage.setItem('activities', JSON.stringify(activities.slice(0, 50)));
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

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function setupEventListeners() {
    // Add any additional event listeners needed for the business hours page
    const refreshButton = document.getElementById('refreshStatus');
    if (refreshButton) {
        refreshButton.addEventListener('click', () => {
            updatePublicDisplay();
        });
    }
}
