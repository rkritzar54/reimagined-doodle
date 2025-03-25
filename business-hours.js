document.addEventListener('DOMContentLoaded', function() {
    const CURRENT_TIMESTAMP = '2025-03-25 17:05:19';
    
    // Business hours in EDT
    const businessHours = {
        sunday: { closed: true },
        monday: { open: '10:00', close: '23:00', closed: false },
        tuesday: { open: '10:00', close: '23:00', closed: false },
        wednesday: { open: '10:00', close: '23:00', closed: false },
        thursday: { open: '10:00', close: '23:00', closed: false },
        friday: { open: '10:00', close: '23:00', closed: false },
        saturday: { open: '10:00', close: '23:00', closed: false }
    };

    const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

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

        // Debug logging
        console.log('Current EDT time:', `${currentHour}:${currentMinute}`);
        console.log('Opening time:', `${openHour}:${openMinute}`);
        console.log('Closing time:', `${closeHour}:${closeMinute}`);
        console.log('Current minutes:', currentMinutes);
        console.log('Open minutes:', openMinutes);
        console.log('Close minutes:', closeMinutes);

        return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
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

    function updateTimezone() {
        const zoneElement = document.getElementById('userTimeZone');
        if (zoneElement) {
            zoneElement.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone;
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

    function updateBusinessTable() {
        const tableBody = document.getElementById('hoursTable');
        if (!tableBody) return;

        const now = new Date(CURRENT_TIMESTAMP);
        const currentDay = DAYS[now.getDay()];

        const rows = DAYS.map(day => {
            const schedule = businessHours[day];
            const isToday = day === currentDay;
            
            // Convert EDT hours to local time
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

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Initialize everything
    function initializeAll() {
        updateTimeDisplay();
        updateTimezone();
        updateBusinessTable();
        updateBusinessStatus();
    }

    // Initial load
    initializeAll();
    
    // Update every minute
    setInterval(initializeAll, 60000);
});

document.addEventListener('DOMContentLoaded', function () {
    const bookingModal = document.getElementById('bookingModal');
    const bookingButton = document.getElementById('bookingButton');
    const closeModalButton = document.querySelector('.modal-close');
    const bookingForm = document.getElementById('bookingForm');
    const timeDropdown = document.getElementById('time');

    // Define available time slots (in 24-hour format)
    const availableTimes = [
        "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"
    ];

    // Open the booking modal
    bookingButton.addEventListener('click', function () {
        bookingModal.style.display = 'block';
        populateTimeDropdown(); // Populate the time dropdown when the modal opens
    });

    // Close the modal
    closeModalButton.addEventListener('click', function () {
        bookingModal.style.display = 'none';
    });

    // Close modal when clicking outside of the modal content
    window.addEventListener('click', function (event) {
        if (event.target === bookingModal) {
            bookingModal.style.display = 'none';
        }
    });

    // Populate the time dropdown with available slots
    function populateTimeDropdown() {
        timeDropdown.innerHTML = '<option value="">Select a time</option>'; // Clear existing options
        availableTimes.forEach(time => {
            const option = document.createElement('option');
            option.value = time;
            option.textContent = formatTimeForDisplay(time);
            timeDropdown.appendChild(option);
        });
    }

    // Format 24-hour time (e.g., "13:00") to 12-hour format (e.g., "1:00 PM")
    function formatTimeForDisplay(time) {
        const [hours, minutes] = time.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12; // Convert 0 to 12 for midnight
        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    }

    // Handle form submission
    bookingForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent actual form submission

        // Capture form data
        const formData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            date: document.getElementById('date').value,
            time: document.getElementById('time').value,
            message: document.getElementById('message').value.trim(),
        };

        // Validate form data
        if (!formData.name || !formData.email || !formData.date || !formData.time) {
            alert("Please complete all required fields.");
            return;
        }

        // Submit the booking (or simulate submission for now)
        console.log("Booking Submitted:", formData); // Debugging: Log form data
        alert(`Thank you, ${formData.name}! Your booking for ${formData.date} at ${formData.time} has been submitted.`);

        // Clear the form and close the modal
        bookingForm.reset();
        bookingModal.style.display = 'none';
    });
});
