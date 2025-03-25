document.addEventListener('DOMContentLoaded', function() {
    // Constants - using exact UTC timestamp
    const CURRENT_TIMESTAMP = '2025-03-25 20:43:21';
    
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

    function updateBusinessTable() {
        const tableBody = document.getElementById('hoursTable');
        if (!tableBody) return;

        const now = new Date(CURRENT_TIMESTAMP);
        const currentDay = DAYS[now.getDay()];

        tableBody.innerHTML = DAYS.map(day => {
            const schedule = businessHours[day];
            const isToday = day === currentDay;
            return `
                <tr${isToday ? ' class="today"' : ''}>
                    <td>${capitalize(day)}</td>
                    <td>${schedule.closed ? 'Closed' : `${formatTime(schedule.open)} - ${formatTime(schedule.close)}`}</td>
                </tr>
            `;
        }).join('');
    }

    function updateBusinessStatus() {
        const indicator = document.getElementById('currentStatus');
        const statusText = document.getElementById('openClosedText');
        const nextChange = document.getElementById('nextChange');

        if (!indicator || !statusText || !nextChange) return;

        const now = new Date(CURRENT_TIMESTAMP);
        const currentDay = DAYS[now.getDay()];
        const daySchedule = businessHours[currentDay];

        // Convert UTC to EST (UTC-4)
        const estHours = (now.getUTCHours() - 4 + 24) % 24;
        const estMinutes = now.getUTCMinutes();
        const currentMinutesEST = estHours * 60 + estMinutes;

        if (daySchedule.closed) {
            setClosedStatus(indicator, statusText, nextChange);
            return;
        }

        // Parse business hours
        const [openHour, openMin] = daySchedule.open.split(':').map(Number);
        const [closeHour, closeMin] = daySchedule.close.split(':').map(Number);
        const openMinutes = openHour * 60 + openMin;
        const closeMinutes = closeHour * 60 + closeMin;

        // Debug output
        console.log(`Current EST time: ${estHours}:${estMinutes}`);
        console.log(`Business hours: ${openHour}:${openMin} - ${closeHour}:${closeMin}`);
        console.log(`Current minutes since midnight: ${currentMinutesEST}`);
        console.log(`Open minutes: ${openMinutes}, Close minutes: ${closeMinutes}`);

        if (currentMinutesEST >= openMinutes && currentMinutesEST < closeMinutes) {
            setOpenStatus(indicator, statusText, nextChange, daySchedule.close);
        } else {
            setClosedStatus(indicator, statusText, nextChange);
        }
    }

    function setOpenStatus(indicator, text, nextChange, closeTime) {
        indicator.className = 'status-indicator open';
        text.textContent = 'OPEN';
        nextChange.textContent = `Closes at ${formatTime(closeTime)}`;
    }

    function setClosedStatus(indicator, text, nextChange) {
        indicator.className = 'status-indicator closed';
        text.textContent = 'CLOSED';
        const nextOpenInfo = getNextOpeningTime();
        nextChange.textContent = `Opens ${nextOpenInfo}`;
    }

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

    function formatTime(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Initialize everything
    initializeAll();
    
    // Update every minute
    setInterval(initializeAll, 60000);

    // Handle booking modal and other UI interactions
    const bookingButton = document.getElementById('bookingButton');
    const bookingModal = document.getElementById('bookingModal');
    const closeModal = document.querySelector('.modal-close');

    if (bookingButton && bookingModal) {
        bookingButton.addEventListener('click', () => {
            bookingModal.style.display = 'block';
            document.body.classList.add('modal-open');
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
});
