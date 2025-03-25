document.addEventListener('DOMContentLoaded', function () {
    // Business hours in EDT timezone
    const businessHours = {
        monday: { open: '09:00', close: '17:00', closed: false },
        tuesday: { open: '09:00', close: '17:00', closed: false },
        wednesday: { open: '09:00', close: '17:00', closed: false },
        thursday: { open: '09:00', close: '17:00', closed: false },
        friday: { open: '09:00', close: '16:00', closed: false },
        saturday: { closed: true },
        sunday: { closed: true }
    };

    const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    function updateDateTime() {
        const currentTimeElement = document.getElementById('currentTime');
        const userTimeZoneElement = document.getElementById('userTimeZone');

        const now = new Date(); // Fetch current time for user's timezone
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone; // Get user's timezone

        if (currentTimeElement) {
            currentTimeElement.textContent = now.toLocaleString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour12: true
            });
        }

        if (userTimeZoneElement) {
            userTimeZoneElement.textContent = userTimezone;
        }
    }

    function convertToLocalTime(edtTime) {
        // EDT Time Offset: UTC-4
        const [hours, minutes] = edtTime.split(':').map(Number);
        const edtDate = new Date();
        edtDate.setHours(hours);
        edtDate.setMinutes(minutes);

        // Convert to user's local timezone
        const localTime = new Date(edtDate.toLocaleString('en-US', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }));
        return localTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    }

    function updateBusinessHours() {
        const hoursTable = document.getElementById('hoursTable');
        if (!hoursTable) return;

        const now = new Date(); // Current local time
        const todayIndex = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

        hoursTable.innerHTML = DAYS.map((day, index) => {
            const dayInfo = businessHours[day];
            const isToday = index === todayIndex;

            return `
                <tr${isToday ? ' class="today"' : ''}>
                    <td>${day.charAt(0).toUpperCase() + day.slice(1)}</td>
                    <td>${dayInfo.closed ? 'Closed' : `${convertToLocalTime(dayInfo.open)} - ${convertToLocalTime(dayInfo.close)}`}</td>
                </tr>
            `;
        }).join('');
    }

    function updateStatus() {
        const now = new Date(); // Current local time
        const currentDay = DAYS[now.getDay()];
        const dayInfo = businessHours[currentDay];

        const statusIndicator = document.getElementById('currentStatus');
        const statusText = document.getElementById('openClosedText');
        const nextChange = document.getElementById('nextChange');

        if (!statusIndicator || !statusText || !nextChange) return;

        if (dayInfo.closed) {
            displayClosedStatus(statusIndicator, statusText, nextChange);
            return;
        }

        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const [openHour, openMinute] = dayInfo.open.split(':').map(Number);
        const [closeHour, closeMinute] = dayInfo.close.split(':').map(Number);

        const currentTime = currentHour * 60 + currentMinute;
        const openTime = openHour * 60 + openMinute;
        const closeTime = closeHour * 60 + closeMinute;

        if (currentTime >= openTime && currentTime < closeTime) {
            displayOpenStatus(statusIndicator, statusText, nextChange, convertToLocalTime(dayInfo.close));
        } else {
            displayClosedStatus(statusIndicator, statusText, nextChange);
        }
    }

    function displayOpenStatus(indicator, text, nextChange, closeTime) {
        indicator.className = 'status-indicator open';
        text.textContent = 'OPEN';
        nextChange.textContent = `Closes at ${closeTime}`;
    }

    function displayClosedStatus(indicator, text, nextChange) {
        indicator.className = 'status-indicator closed';
        text.textContent = 'CLOSED';
        const nextOpenTime = getNextOpenTime();
        nextChange.textContent = `Opens ${nextOpenTime}`;
    }

    function getNextOpenTime() {
        const now = new Date(); // Current local time
        let currentDayIndex = now.getDay();
        let daysChecked = 0;

        while (daysChecked < 7) {
            currentDayIndex = (currentDayIndex + 1) % 7;
            const nextDay = DAYS[currentDayIndex];

            if (!businessHours[nextDay].closed) {
                return `${nextDay.charAt(0).toUpperCase() + nextDay.slice(1)} at ${convertToLocalTime(businessHours[nextDay].open)}`;
            }
            daysChecked++;
        }
        return 'soon';
    }

    // Initialize everything
    function init() {
        updateDateTime();
        updateBusinessHours();
        updateStatus();
    }

    init();
    setInterval(init, 60000); // Update every minute
});
