document.addEventListener('DOMContentLoaded', function() {
    // Constants for current timestamp and user
    const CURRENT_TIMESTAMP = '2025-03-25 22:43:53';
    const CURRENT_USER = 'rkritzar54';

    // Get business hours from localStorage or use defaults
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

    const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const businessHours = getBusinessHours();

    // Determine which page we're on
    const isAdminPage = window.location.pathname.includes('admin.html');
    const isBusinessHoursPage = window.location.pathname.includes('business-hours.html');

    // Initialize appropriate functionality based on the page
    if (isAdminPage) {
        initializeAdminFunctionality();
    }
    
    if (isBusinessHoursPage) {
        initializeBusinessHoursPage();
    }

    function initializeAdminFunctionality() {
        // Admin-specific initialization
        const businessHoursForm = document.getElementById('businessHoursForm');
        if (businessHoursForm) {
            loadBusinessHoursForm();
            businessHoursForm.addEventListener('submit', saveBusinessHours);
        }
    }

    function initializeBusinessHoursPage() {
        // Business hours page initialization
        initializeAll();
        setupBookingModal();
        
        // Update every minute
        setInterval(initializeAll, 60000);
    }

    // Function to convert EDT time to user's local time
    function convertEDTtoLocal(timeStr) {
        if (!timeStr) return '';
        
        const [hours, minutes] = timeStr.split(':').map(Number);
        
        const edtDate = new Date();
        edtDate.setUTCHours(hours + 4, minutes, 0, 0);
        
        const localDate = new Date(edtDate.getTime());
        
        return localDate.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });
    }

    function isBusinessOpen() {
        const now = new Date(CURRENT_TIMESTAMP);
        const currentDay = DAYS[now.getDay()];
        const daySchedule = businessHours[currentDay];

        if (daySchedule.closed) return false;

        const edtNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
        const currentHour = edtNow.getHours();
        const currentMinute = edtNow.getMinutes();
        
        const [openHour, openMinute] = daySchedule.open.split(':').map(Number);
        const [closeHour, closeMinute] = daySchedule.close.split(':').map(Number);

        const currentMinutes = (currentHour * 60) + currentMinute;
        const openMinutes = (openHour * 60) + openMinute;
        const closeMinutes = (closeHour * 60) + closeMinute;

        return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
    }

    // Initialize all business hours page elements
    function initializeAll() {
        updateTimeDisplay();
        updateTimezone();
        updateBusinessTable();
        updateBusinessStatus();
    }

    function updateTimeDisplay() {
        const timeElement = document.getElementById('currentTime');
        if (timeElement) {
            const now = new Date(CURRENT_TIMESTAMP);
            timeElement.textContent = now.toLocaleString();
        }
    }

    function updateTimezone() {
        const zoneElement = document.getElementById('userTimeZone');
        if (zoneElement) {
            zoneElement.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone;
        }
    }

    function updateBusinessTable() {
        const tableBody = document.getElementById('hoursTable');
        if (!tableBody) return;

        const now = new Date(CURRENT_TIMESTAMP);
        const currentDay = DAYS[now.getDay()];

        const rows = DAYS.map(day => {
            const schedule = businessHours[day];
            const isToday = day === currentDay;
            
            const localOpen = schedule.closed ? 'Closed' : 
                `${convertEDTtoLocal(schedule.open)} - ${convertEDTtoLocal(schedule.close)}`;
            
            return `
                <tr${isToday ? ' class="today"' : ''}>
                    <td>${capitalize(day)}</td>
                    <td>${localOpen}</td>
                </tr>
            `;
        });

        tableBody.innerHTML = rows.join('');
    }

    function updateBusinessStatus() {
        const indicator = document.getElementById('currentStatus');
        const statusText = document.getElementById('openClosedText');
        const nextChange = document.getElementById('nextChange');

        if (!indicator || !statusText || !nextChange) return;

        const open = isBusinessOpen();

        indicator.className = `status-indicator ${open ? 'open' : 'closed'}`;
        statusText.textContent = open ? 'OPEN' : 'CLOSED';

        if (open) {
            const currentDay = DAYS[new Date(CURRENT_TIMESTAMP).getDay()];
            nextChange.textContent = `Closes at ${convertEDTtoLocal(businessHours[currentDay].close)}`;
        } else {
            nextChange.textContent = `Opens ${getNextOpeningTime()}`;
        }
    }

    function getNextOpeningTime() {
        const now = new Date(CURRENT_TIMESTAMP);
        let checkDay = now.getDay();
        
        for (let i = 1; i <= 7; i++) {
            checkDay = (checkDay + 1) % 7;
            const nextDay = DAYS[checkDay];
            
            if (!businessHours[nextDay].closed) {
                return `${capitalize(nextDay)} at ${convertEDTtoLocal(businessHours[nextDay].open)}`;
            }
        }
        return 'soon';
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Booking Modal Setup
    function setupBookingModal() {
        const bookingModal = document.getElementById('bookingModal');
        const bookingButton = document.getElementById('bookingButton');
        const closeModalButton = document.querySelector('.modal-close');
        const bookingForm = document.getElementById('bookingForm');

        if (bookingButton) {
            bookingButton.addEventListener('click', () => {
                initializeBookingForm();
                bookingModal.style.display = 'block';
            });
        }

        if (closeModalButton) {
            closeModalButton.addEventListener('click', () => {
                bookingModal.style.display = 'none';
            });
        }

        if (bookingForm) {
            bookingForm.addEventListener('submit', handleBookingSubmission);
        }

        window.addEventListener('click', (event) => {
            if (event.target === bookingModal) {
                bookingModal.style.display = 'none';
            }
        });
    }

    function initializeBookingForm() {
        const now = new Date(CURRENT_TIMESTAMP);
        const minDate = new Date(now);
        minDate.setDate(minDate.getDate() + 1);

        const maxDate = new Date(now);
        maxDate.setDate(maxDate.getDate() + 30);

        const dateInput = document.getElementById('date');
        if (dateInput) {
            dateInput.min = minDate.toISOString().split('T')[0];
            dateInput.max = maxDate.toISOString().split('T')[0];
            
            // Set up date change handler
            dateInput.addEventListener('change', handleDateChange);
        }

        document.getElementById('submissionTime').value = CURRENT_TIMESTAMP;
        document.getElementById('submittedBy').value = CURRENT_USER;
    }

    function handleDateChange(event) {
        const selectedDate = new Date(event.target.value);
        const dayOfWeek = selectedDate.getDay();
        const daySchedule = businessHours[DAYS[dayOfWeek]];
        const timeInput = document.getElementById('time');

        if (!timeInput) return;

        if (daySchedule.closed) {
            timeInput.disabled = true;
            timeInput.value = '';
            alert('Selected day is not available for booking. Please choose another day.');
            return;
        }

        timeInput.disabled = false;
        timeInput.min = daySchedule.open;
        timeInput.max = daySchedule.close;

        const timeHelpText = timeInput.parentElement.querySelector('small');
        if (timeHelpText) {
            timeHelpText.textContent = `Business hours: ${convertEDTtoLocal(daySchedule.open)} - ${convertEDTtoLocal(daySchedule.close)}`;
        }
    }

    function handleBookingSubmission(event) {
        event.preventDefault();

        const formData = {
            id: Date.now(),
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            date: document.getElementById('date').value,
            time: document.getElementById('time').value,
            service: document.getElementById('service').value,
            notes: document.getElementById('notes').value.trim(),
            consent: document.getElementById('consent').checked,
            status: 'pending',
            submittedBy: CURRENT_USER,
            submissionTime: new Date(CURRENT_TIMESTAMP).toISOString()
        };

        if (!validateBookingForm(formData)) return;

        saveBooking(formData);
        
        event.target.reset();
        document.getElementById('bookingModal').style.display = 'none';
        alert('Thank you! Your booking request has been submitted and is pending approval.');
    }

    function validateBookingForm(formData) {
        if (!formData.consent) {
            alert('Please agree to the terms and conditions.');
            return false;
        }

        if (!formData.service) {
            alert('Please select a service type.');
            return false;
        }

        const selectedDay = new Date(formData.date).getDay();
        const daySchedule = businessHours[DAYS[selectedDay]];

        if (daySchedule.closed) {
            alert('Selected day is not available for booking. Please choose another day.');
            return false;
        }

        const [selectedHour, selectedMinute] = formData.time.split(':').map(Number);
        const [openHour, openMinute] = daySchedule.open.split(':').map(Number);
        const [closeHour, closeMinute] = daySchedule.close.split(':').map(Number);

        const selectedMinutes = (selectedHour * 60) + selectedMinute;
        const openMinutes = (openHour * 60) + openMinute;
        const closeMinutes = (closeHour * 60) + closeMinute;

        if (selectedMinutes < openMinutes || selectedMinutes >= closeMinutes) {
            alert('Selected time is outside of business hours. Please choose a time between ' +
                  convertEDTtoLocal(daySchedule.open) + ' and ' + convertEDTtoLocal(daySchedule.close));
            return false;
        }

        return true;
    }

    function saveBooking(formData) {
        const bookings = JSON.parse(localStorage.getItem('bookingResponses') || '[]');
        bookings.push(formData);
        localStorage.setItem('bookingResponses', JSON.stringify(bookings));
    }

    // Admin functionality
    function loadBusinessHoursForm() {
        const hours = getBusinessHours();
        DAYS.forEach(day => {
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

    function saveBusinessHours(event) {
        event.preventDefault();
        const newHours = {};
        
        DAYS.forEach(day => {
            const openCheckbox = document.querySelector(`[name="${day}-open"]`);
            const startInput = document.querySelector(`[name="${day}-start"]`);
            const endInput = document.querySelector(`[name="${day}-end"]`);
            
            newHours[day] = {
                closed: !openCheckbox.checked,
                open: startInput.value,
                close: endInput.value
            };
        });

        localStorage.setItem('businessHours', JSON.stringify(newHours));
        showNotification('Business hours saved successfully!');
    }

    // Admin check and link
    if (localStorage.getItem('isAdmin') === 'true') {
        const nav = document.querySelector('.desktop-menu');
        if (nav) {
            const adminLink = document.createElement('li');
            adminLink.innerHTML = '<a href="admin.html">Admin Portal</a>';
            nav.appendChild(adminLink);
        }
    }
});
