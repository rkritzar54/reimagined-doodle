document.addEventListener('DOMContentLoaded', function() {
    const CURRENT_TIMESTAMP = '2025-03-25 21:21:11';
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

    // Function to convert EDT time to user's local time
    function convertEDTtoLocal(timeStr) {
        if (!timeStr) return '';
        
        const [hours, minutes] = timeStr.split(':').map(Number);
        
        // Create date object with the current date in EDT
        const edtDate = new Date();
        // EDT is UTC-4
        edtDate.setUTCHours(hours + 4, minutes, 0, 0);
        
        // Now create a new date object in local time
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

        // Get current time in EDT
        const edtNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
        const currentHour = edtNow.getHours();
        const currentMinute = edtNow.getMinutes();
        
        // Convert business hours to 24-hour format
        const [openHour, openMinute] = daySchedule.open.split(':').map(Number);
        const [closeHour, closeMinute] = daySchedule.close.split(':').map(Number);

        // Convert to minutes since midnight for comparison
        const currentMinutes = (currentHour * 60) + currentMinute;
        const openMinutes = (openHour * 60) + openMinute;
        const closeMinutes = (closeHour * 60) + closeMinute;

        return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
    }

    // Handle booking form submission
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const formData = {
                id: Date.now(),
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                date: document.getElementById('date').value,
                time: document.getElementById('time').value,
                message: document.getElementById('message').value.trim(),
                status: 'pending',
                submittedBy: CURRENT_USER,
                submissionTime: new Date(CURRENT_TIMESTAMP).toISOString()
            };

            // Save to localStorage
            const bookings = JSON.parse(localStorage.getItem('bookingResponses') || '[]');
            bookings.push(formData);
            localStorage.setItem('bookingResponses', JSON.stringify(bookings));

            // Clear form and close modal
            bookingForm.reset();
            document.getElementById('bookingModal').style.display = 'none';

            alert('Thank you! Your booking request has been submitted.');
        });
    }

    // Modal handling
    const bookingModal = document.getElementById('bookingModal');
    const bookingButton = document.getElementById('bookingButton');
    const closeModalButton = document.querySelector('.modal-close');

    if (bookingButton) {
        bookingButton.addEventListener('click', function() {
            const now = new Date(CURRENT_TIMESTAMP);
            const minDate = new Date(now);
            minDate.setDate(minDate.getDate() + 1); // 24-hour advance notice

            const maxDate = new Date(now);
            maxDate.setDate(maxDate.getDate() + 30); // 30 days max advance booking

            const dateInput = document.getElementById('date');
            if (dateInput) {
                dateInput.min = minDate.toISOString().split('T')[0];
                dateInput.max = maxDate.toISOString().split('T')[0];
            }

            bookingModal.style.display = 'block';
            updateAvailableTimeSlots();
        });
    }

    if (closeModalButton) {
        closeModalButton.addEventListener('click', function() {
            bookingModal.style.display = 'none';
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === bookingModal) {
            bookingModal.style.display = 'none';
        }
    });

    // Update available time slots based on selected date
    function updateAvailableTimeSlots() {
        const dateInput = document.getElementById('date');
        const timeSelect = document.getElementById('time');
        
        if (!dateInput || !timeSelect) return;

        dateInput.addEventListener('change', function() {
            const selectedDate = new Date(this.value);
            const dayOfWeek = selectedDate.getDay();
            const daySchedule = businessHours[DAYS[dayOfWeek]];

            // Clear existing options
            timeSelect.innerHTML = '<option value="">Select a time</option>';

            if (daySchedule.closed) {
                timeSelect.disabled = true;
                alert('Selected day is not available for booking.');
                return;
            }

            timeSelect.disabled = false;
            const [startHour] = daySchedule.open.split(':').map(Number);
            const [endHour] = daySchedule.close.split(':').map(Number);

            // Generate time slots every hour
            for (let hour = startHour; hour < endHour; hour++) {
                const timeValue = `${hour.toString().padStart(2, '0')}:00`;
                const option = document.createElement('option');
                option.value = timeValue;
                option.textContent = convertEDTtoLocal(timeValue);
                timeSelect.appendChild(option);
            }
        });
    }

    // Initialize everything
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

    // Check if user is admin and add admin link if true
    if (localStorage.getItem('isAdmin') === 'true') {
        const nav = document.querySelector('.desktop-menu');
        if (nav) {
            const adminLink = document.createElement('li');
            adminLink.innerHTML = '<a href="admin.html">Admin Portal</a>';
            nav.appendChild(adminLink);
        }
    }

    // Initial load
    initializeAll();
    
    // Update every minute
    setInterval(initializeAll, 60000);
});
