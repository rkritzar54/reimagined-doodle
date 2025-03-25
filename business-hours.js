document.addEventListener('DOMContentLoaded', function() {
    // Constants with exact timestamp from your system
    const CURRENT_TIMESTAMP = '2025-03-25 20:53:31';
    
    // Business hours in 24-hour format
    const businessHours = {
        sunday: { closed: true },
        monday: { open: '09:00', close: '17:00', closed: false },
        tuesday: { open: '09:00', close: '17:00', closed: false },
        wednesday: { open: '09:00', close: '17:00', closed: false },
        thursday: { open: '09:00', close: '17:00', closed: false },
        friday: { open: '09:00', close: '16:00', closed: false },
        saturday: { closed: true }
    };

    const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    function isBusinessOpen() {
        const now = new Date(CURRENT_TIMESTAMP);
        
        // Get day of week and convert UTC to EST (UTC-4)
        const currentDay = DAYS[now.getUTCDay()];
        const currentHour = (now.getUTCHours() - 4 + 24) % 24; // Convert to EST
        const currentMinute = now.getUTCMinutes();
        
        const daySchedule = businessHours[currentDay];

        // If it's a closed day, return false
        if (daySchedule.closed) {
            return false;
        }

        // Convert current time and business hours to minutes for comparison
        const currentTimeInMinutes = (currentHour * 60) + currentMinute;
        const [openHour, openMinute] = daySchedule.open.split(':').map(Number);
        const [closeHour, closeMinute] = daySchedule.close.split(':').map(Number);
        
        const openTimeInMinutes = (openHour * 60) + openMinute;
        const closeTimeInMinutes = (closeHour * 60) + closeMinute;

        // Debug logging
        console.log('Current EST time:', currentHour + ':' + currentMinute);
        console.log('Current day:', currentDay);
        console.log('Current minutes since midnight:', currentTimeInMinutes);
        console.log('Opening minutes:', openTimeInMinutes);
        console.log('Closing minutes:', closeTimeInMinutes);

        return currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes < closeTimeInMinutes;
    }

    function updateBusinessStatus() {
        const indicator = document.getElementById('currentStatus');
        const statusText = document.getElementById('openClosedText');
        const nextChange = document.getElementById('nextChange');

        if (!indicator || !statusText || !nextChange) return;

        const open = isBusinessOpen();

        // Update status indicator and text
        indicator.className = `status-indicator ${open ? 'open' : 'closed'}`;
        statusText.textContent = open ? 'OPEN' : 'CLOSED';

        // Update next change text
        if (open) {
            const now = new Date(CURRENT_TIMESTAMP);
            const currentDay = DAYS[now.getUTCDay()];
            nextChange.textContent = `Closes at ${formatTime(businessHours[currentDay].close)}`;
        } else {
            nextChange.textContent = `Opens ${getNextOpeningTime()}`;
        }
    }

    function updateTimeDisplay() {
        const timeElement = document.getElementById('currentTime');
        if (timeElement) {
            const now = new Date(CURRENT_TIMESTAMP);
            // Adjust for EST (UTC-4)
            now.setHours(now.getUTCHours() - 4);
            timeElement.textContent = now.toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
                timeZone: 'America/New_York'
            });
        }
    }

    function updateTimezone() {
        const zoneElement = document.getElementById('userTimeZone');
        if (zoneElement) {
            zoneElement.textContent = 'America/New_York';
        }
    }

    function getNextOpeningTime() {
        const now = new Date(CURRENT_TIMESTAMP);
        let checkDay = now.getUTCDay();
        
        for (let i = 1; i <= 7; i++) {
            checkDay = (checkDay + 1) % 7;
            const nextDay = DAYS[checkDay];
            
            if (!businessHours[nextDay].closed) {
                return `${capitalize(nextDay)} at ${formatTime(businessHours[nextDay].open)}`;
            }
        }
        return 'soon';
    }

    function updateBusinessTable() {
        const tableBody = document.getElementById('hoursTable');
        if (!tableBody) return;

        const now = new Date(CURRENT_TIMESTAMP);
        const currentDay = DAYS[now.getUTCDay()];

        const rows = DAYS.map(day => {
            const schedule = businessHours[day];
            const isToday = day === currentDay;
            
            return `
                <tr${isToday ? ' class="today"' : ''}>
                    <td>${capitalize(day)}</td>
                    <td>${schedule.closed ? 'Closed' : `${formatTime(schedule.open)} - ${formatTime(schedule.close)}`}</td>
                </tr>
            `;
        });

        tableBody.innerHTML = rows.join('');
    }

    function formatTime(timeStr) {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':').map(Number);
        return new Date(2025, 2, 25, hours, minutes).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
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
