document.addEventListener('DOMContentLoaded', function() {
    // Constants with exact timestamp
    const CURRENT_TIMESTAMP = '2025-03-25 20:19:38';
    
    // Business hours configuration
    const businessHours = {
        monday: { open: '09:00', close: '17:00', closed: false },
        tuesday: { open: '09:00', close: '17:00', closed: false },
        wednesday: { open: '09:00', close: '17:00', closed: false },
        thursday: { open: '09:00', close: '17:00', closed: false },
        friday: { open: '09:00', close: '16:00', closed: false },
        saturday: { closed: true },
        sunday: { closed: true }
    };

    // Days mapping (starting with Sunday)
    const DAYS = [
        'sunday', 'monday', 'tuesday', 'wednesday',
        'thursday', 'friday', 'saturday'
    ];

    // Initialize all business hours components
    function initializeAll() {
        updateTimeDisplay();
        updateTimezone();
        updateBusinessTable();
        updateBusinessStatus();
    }

    // Update the current time display
    function updateTimeDisplay() {
        const timeElement = document.getElementById('currentTime');
        if (timeElement) {
            const now = new Date(CURRENT_TIMESTAMP);
            timeElement.textContent = now.toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });
        }
    }

    // Update timezone display
    function updateTimezone() {
        const zoneElement = document.getElementById('userTimeZone');
        if (zoneElement) {
            zoneElement.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone;
        }
    }

    // Update business hours table
    function updateBusinessTable() {
        const tableBody = document.getElementById('hoursTable');
        if (!tableBody) return;

        const now = new Date(CURRENT_TIMESTAMP);
        const currentDay = DAYS[now.getDay()];

        const tableRows = DAYS.map(day => {
            const schedule = businessHours[day];
            const isToday = day === currentDay;
            
            return `
                <tr${isToday ? ' class="today"' : ''}>
                    <td>${capitalize(day)}</td>
                    <td>${schedule.closed ? 'Closed' : `${formatTime(schedule.open)} - ${formatTime(schedule.close)}`}</td>
                </tr>
            `;
        });

        tableBody.innerHTML = tableRows.join('');
    }

    // Update business status
    function updateBusinessStatus() {
        const indicator = document.getElementById('currentStatus');
        const statusText = document.getElementById('openClosedText');
        const nextChange = document.getElementById('nextChange');

        if (!indicator || !statusText || !nextChange) return;

        const now = new Date(CURRENT_TIMESTAMP);
        const currentDay = DAYS[now.getDay()];
        const daySchedule = businessHours[currentDay];

        if (daySchedule.closed) {
            setClosedStatus(indicator, statusText, nextChange);
            return;
        }

        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const [openHour, openMin] = daySchedule.open.split(':').map(Number);
        const [closeHour, closeMin] = daySchedule.close.split(':').map(Number);
        
        const openMinutes = openHour * 60 + openMin;
        const closeMinutes = closeHour * 60 + closeMin;

        if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
            setOpenStatus(indicator, statusText, nextChange, daySchedule.close);
        } else {
            setClosedStatus(indicator, statusText, nextChange);
        }
    }

    // Set status to open
    function setOpenStatus(indicator, text, nextChange, closeTime) {
        indicator.className = 'status-indicator open';
        text.textContent = 'OPEN';
        nextChange.textContent = `Closes at ${formatTime(closeTime)}`;
    }

    // Set status to closed
    function setClosedStatus(indicator, text, nextChange) {
        indicator.className = 'status-indicator closed';
        text.textContent = 'CLOSED';
        const nextOpenInfo = getNextOpeningTime();
        nextChange.textContent = `Opens ${nextOpenInfo}`;
    }

    // Get next opening time
    function getNextOpeningTime() {
        const now = new Date(CURRENT_TIMESTAMP);
        let checkDay = now.getDay();
        
        for (let i = 1; i <= 7; i++) {
            checkDay = (checkDay + 1) % 7;
            const nextDay = DAYS[checkDay];
            
            if (!businessHours[nextDay].closed) {
                return `${capitalize(nextDay)} at ${formatTime(businessHours[nextDay].open)}`;
            }
        }
        return 'soon';
    }

    // Format time to 12-hour format
    function formatTime(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return new Date(2025, 2, 25, hours, minutes)
            .toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
    }

    // Capitalize first letter
    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Handle booking modal
    const bookingButton = document.getElementById('bookingButton');
    const bookingModal = document.getElementById('bookingModal');
    const closeModal = document.querySelector('.modal-close');

    if (bookingButton && bookingModal) {
        bookingButton.addEventListener('click', () => {
            bookingModal.style.display = 'block';
            document.body.classList.add('modal-open');
            initializeBookingForm();
        });

        if (closeModal) {
            closeModal.addEventListener('click', () => {
                bookingModal.style.display = 'none';
                document.body.classList.remove('modal-open');
            });
        }

        window.addEventListener('click', (e) => {
            if (e.target === bookingModal) {
                bookingModal.style.display = 'none';
                document.body.classList.remove('modal-open');
            }
        });
    }

    // Initialize booking form
    function initializeBookingForm() {
        const dateInput = document.getElementById('date');
        const timeSelect = document.getElementById('time');
        
        if (dateInput && timeSelect) {
            const today = new Date(CURRENT_TIMESTAMP);
            const minDate = today.toISOString().split('T')[0];
            dateInput.min = minDate;
            
            dateInput.addEventListener('change', updateAvailableTimes);
        }
    }

    // Update available times based on selected date
    function updateAvailableTimes() {
        const dateInput = document.getElementById('date');
        const timeSelect = document.getElementById('time');
        
        if (!dateInput || !timeSelect) return;
        
        const selectedDate = new Date(dateInput.value);
        const dayName = DAYS[selectedDate.getDay()];
        const daySchedule = businessHours[dayName];

        timeSelect.innerHTML = '<option value="">Select a time</option>';

        if (!daySchedule.closed) {
            const [openHour] = daySchedule.open.split(':').map(Number);
            const [closeHour] = daySchedule.close.split(':').map(Number);

            for (let hour = openHour; hour < closeHour; hour++) {
                for (let minute of ['00', '30']) {
                    const timeStr = `${hour.toString().padStart(2, '0')}:${minute}`;
                    const displayTime = formatTime(timeStr);
                    timeSelect.innerHTML += `<option value="${timeStr}">${displayTime}</option>`;
                }
            }
        }
    }

    // Handle mobile menu
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });
    }

    // Initialize everything
    initializeAll();
    
    // Update every minute
    setInterval(initializeAll, 60000);
});document.addEventListener('DOMContentLoaded', function() {
    // Constants with exact timestamp
    const CURRENT_TIMESTAMP = '2025-03-25 20:19:38';
    
    // Business hours configuration
    const businessHours = {
        monday: { open: '09:00', close: '17:00', closed: false },
        tuesday: { open: '09:00', close: '17:00', closed: false },
        wednesday: { open: '09:00', close: '17:00', closed: false },
        thursday: { open: '09:00', close: '17:00', closed: false },
        friday: { open: '09:00', close: '16:00', closed: false },
        saturday: { closed: true },
        sunday: { closed: true }
    };

    // Days mapping (starting with Sunday)
    const DAYS = [
        'sunday', 'monday', 'tuesday', 'wednesday',
        'thursday', 'friday', 'saturday'
    ];

    // Initialize all business hours components
    function initializeAll() {
        updateTimeDisplay();
        updateTimezone();
        updateBusinessTable();
        updateBusinessStatus();
    }

    // Update the current time display
    function updateTimeDisplay() {
        const timeElement = document.getElementById('currentTime');
        if (timeElement) {
            const now = new Date(CURRENT_TIMESTAMP);
            timeElement.textContent = now.toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });
        }
    }

    // Update timezone display
    function updateTimezone() {
        const zoneElement = document.getElementById('userTimeZone');
        if (zoneElement) {
            zoneElement.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone;
        }
    }

    // Update business hours table
    function updateBusinessTable() {
        const tableBody = document.getElementById('hoursTable');
        if (!tableBody) return;

        const now = new Date(CURRENT_TIMESTAMP);
        const currentDay = DAYS[now.getDay()];

        const tableRows = DAYS.map(day => {
            const schedule = businessHours[day];
            const isToday = day === currentDay;
            
            return `
                <tr${isToday ? ' class="today"' : ''}>
                    <td>${capitalize(day)}</td>
                    <td>${schedule.closed ? 'Closed' : `${formatTime(schedule.open)} - ${formatTime(schedule.close)}`}</td>
                </tr>
            `;
        });

        tableBody.innerHTML = tableRows.join('');
    }

    // Update business status
    function updateBusinessStatus() {
        const indicator = document.getElementById('currentStatus');
        const statusText = document.getElementById('openClosedText');
        const nextChange = document.getElementById('nextChange');

        if (!indicator || !statusText || !nextChange) return;

        const now = new Date(CURRENT_TIMESTAMP);
        const currentDay = DAYS[now.getDay()];
        const daySchedule = businessHours[currentDay];

        if (daySchedule.closed) {
            setClosedStatus(indicator, statusText, nextChange);
            return;
        }

        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const [openHour, openMin] = daySchedule.open.split(':').map(Number);
        const [closeHour, closeMin] = daySchedule.close.split(':').map(Number);
        
        const openMinutes = openHour * 60 + openMin;
        const closeMinutes = closeHour * 60 + closeMin;

        if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
            setOpenStatus(indicator, statusText, nextChange, daySchedule.close);
        } else {
            setClosedStatus(indicator, statusText, nextChange);
        }
    }

    // Set status to open
    function setOpenStatus(indicator, text, nextChange, closeTime) {
        indicator.className = 'status-indicator open';
        text.textContent = 'OPEN';
        nextChange.textContent = `Closes at ${formatTime(closeTime)}`;
    }

    // Set status to closed
    function setClosedStatus(indicator, text, nextChange) {
        indicator.className = 'status-indicator closed';
        text.textContent = 'CLOSED';
        const nextOpenInfo = getNextOpeningTime();
        nextChange.textContent = `Opens ${nextOpenInfo}`;
    }

    // Get next opening time
    function getNextOpeningTime() {
        const now = new Date(CURRENT_TIMESTAMP);
        let checkDay = now.getDay();
        
        for (let i = 1; i <= 7; i++) {
            checkDay = (checkDay + 1) % 7;
            const nextDay = DAYS[checkDay];
            
            if (!businessHours[nextDay].closed) {
                return `${capitalize(nextDay)} at ${formatTime(businessHours[nextDay].open)}`;
            }
        }
        return 'soon';
    }

    // Format time to 12-hour format
    function formatTime(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return new Date(2025, 2, 25, hours, minutes)
            .toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
    }

    // Capitalize first letter
    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Handle booking modal
    const bookingButton = document.getElementById('bookingButton');
    const bookingModal = document.getElementById('bookingModal');
    const closeModal = document.querySelector('.modal-close');

    if (bookingButton && bookingModal) {
        bookingButton.addEventListener('click', () => {
            bookingModal.style.display = 'block';
            document.body.classList.add('modal-open');
            initializeBookingForm();
        });

        if (closeModal) {
            closeModal.addEventListener('click', () => {
                bookingModal.style.display = 'none';
                document.body.classList.remove('modal-open');
            });
        }

        window.addEventListener('click', (e) => {
            if (e.target === bookingModal) {
                bookingModal.style.display = 'none';
                document.body.classList.remove('modal-open');
            }
        });
    }

    // Initialize booking form
    function initializeBookingForm() {
        const dateInput = document.getElementById('date');
        const timeSelect = document.getElementById('time');
        
        if (dateInput && timeSelect) {
            const today = new Date(CURRENT_TIMESTAMP);
            const minDate = today.toISOString().split('T')[0];
            dateInput.min = minDate;
            
            dateInput.addEventListener('change', updateAvailableTimes);
        }
    }

    // Update available times based on selected date
    function updateAvailableTimes() {
        const dateInput = document.getElementById('date');
        const timeSelect = document.getElementById('time');
        
        if (!dateInput || !timeSelect) return;
        
        const selectedDate = new Date(dateInput.value);
        const dayName = DAYS[selectedDate.getDay()];
        const daySchedule = businessHours[dayName];

        timeSelect.innerHTML = '<option value="">Select a time</option>';

        if (!daySchedule.closed) {
            const [openHour] = daySchedule.open.split(':').map(Number);
            const [closeHour] = daySchedule.close.split(':').map(Number);

            for (let hour = openHour; hour < closeHour; hour++) {
                for (let minute of ['00', '30']) {
                    const timeStr = `${hour.toString().padStart(2, '0')}:${minute}`;
                    const displayTime = formatTime(timeStr);
                    timeSelect.innerHTML += `<option value="${timeStr}">${displayTime}</option>`;
                }
            }
        }
    }

    // Initialize everything
    initializeAll();
    
    // Update every minute
    setInterval(initializeAll, 60000);
});
