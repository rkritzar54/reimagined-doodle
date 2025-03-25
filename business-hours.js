document.addEventListener('DOMContentLoaded', function() {
    const CURRENT_TIMESTAMP = '2025-03-25 20:58:44';
    
    // Business hours in EDT
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

    // Function to convert EDT time to user's local time
    function convertEDTtoLocal(timeStr) {
        if (!timeStr) return '';
        
        // Create a date object in EDT
        const [hours, minutes] = timeStr.split(':').map(Number);
        const edtDate = new Date(CURRENT_TIMESTAMP);
        edtDate.setHours(hours, minutes, 0);

        // Convert to local time
        const localDate = new Date(edtDate);
        
        // Format in local time
        return localDate.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    function isBusinessOpen() {
        const now = new Date(CURRENT_TIMESTAMP);
        const currentDay = DAYS[now.getDay()];
        const daySchedule = businessHours[currentDay];

        if (daySchedule.closed) return false;

        // Get current local time
        const currentTime = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });

        // Convert business hours to local time
        const localOpenTime = convertEDTtoLocal(daySchedule.open);
        const localCloseTime = convertEDTtoLocal(daySchedule.close);

        // Debug logging
        console.log('Current local time:', currentTime);
        console.log('Local opening time:', localOpenTime);
        console.log('Local closing time:', localCloseTime);

        return currentTime >= localOpenTime && currentTime < localCloseTime;
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
            
            const hours = schedule.closed ? 'Closed' : 
                `${convertEDTtoLocal(schedule.open)} - ${convertEDTtoLocal(schedule.close)}`;
            
            return `
                <tr${isToday ? ' class="today"' : ''}>
                    <td>${capitalize(day)}</td>
                    <td>${hours}</td>
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
