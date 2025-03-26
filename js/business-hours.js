document.addEventListener('DOMContentLoaded', function () {
    // Get stored business hours from localStorage
    function getStoredHours() {
        const stored = localStorage.getItem('business-hours');
        return stored ? JSON.parse(stored) : {
            Monday: { open: '09:00', close: '17:00', closed: false },
            Tuesday: { open: '09:00', close: '17:00', closed: false },
            Wednesday: { open: '09:00', close: '17:00', closed: false },
            Thursday: { open: '09:00', close: '17:00', closed: false },
            Friday: { open: '09:00', close: '17:00', closed: false },
            Saturday: { open: '10:00', close: '15:00', closed: false },
            Sunday: { open: '00:00', close: '00:00', closed: true }
        };
    }

    // Format time to 12-hour format
    function formatTime(time) {
        if (!time) return '';
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    }

    // Update the business status
    function updateBusinessStatus() {
        const currentTimeElement = document.getElementById('currentTime');
        const currentTimezoneElement = document.getElementById('currentTimezone');
        const businessStatusElement = document.getElementById('businessStatus');
        const opensAtElement = document.getElementById('opensAt');
        const hoursTableBody = document.getElementById('hours-table-body');

        const now = new Date();
        const currentDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
        const currentTime = now.toLocaleTimeString();
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        // Update current time display
        currentTimeElement.textContent = currentTime;
        currentTimezoneElement.textContent = timezone;

        // Get business hours from storage
        const businessHours = getStoredHours();

        // Update hours table
        if (hoursTableBody) {
            hoursTableBody.innerHTML = Object.entries(businessHours).map(([day, hours]) => `
                <tr class="${day === currentDay ? 'current-day' : ''}">
                    <td>${day}</td>
                    <td>${hours.closed ? 'Closed' : `${formatTime(hours.open)} - ${formatTime(hours.close)}`}</td>
                </tr>
            `).join('');
        }

        // Determine if currently open
        const todayHours = businessHours[currentDay];
        const currentHour = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentTimeNumber = currentHour * 100 + currentMinutes;

        if (todayHours.closed) {
            businessStatusElement.textContent = 'Closed';
            businessStatusElement.className = 'closed';
            // Find next open day
            let nextDay = currentDay;
            let daysChecked = 0;
            do {
                const nextDayIndex = (now.getDay() + daysChecked + 1) % 7;
                nextDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][nextDayIndex];
                if (!businessHours[nextDay].closed) {
                    opensAtElement.textContent = `${formatTime(businessHours[nextDay].open)} ${nextDay}`;
                    break;
                }
                daysChecked++;
            } while (daysChecked < 7);
        } else {
            const [openHour, openMinutes] = todayHours.open.split(':');
            const [closeHour, closeMinutes] = todayHours.close.split(':');
            const openTimeNumber = parseInt(openHour) * 100 + parseInt(openMinutes);
            const closeTimeNumber = parseInt(closeHour) * 100 + parseInt(closeMinutes);

            if (currentTimeNumber >= openTimeNumber && currentTimeNumber < closeTimeNumber) {
                businessStatusElement.textContent = 'Open';
                businessStatusElement.className = 'open';
                opensAtElement.textContent = `Closes at ${formatTime(todayHours.close)}`;
            } else {
                businessStatusElement.textContent = 'Closed';
                businessStatusElement.className = 'closed';
                if (currentTimeNumber < openTimeNumber) {
                    opensAtElement.textContent = `Opens at ${formatTime(todayHours.open)} Today`;
                } else {
                    // Find next open day
                    let nextDay = currentDay;
                    let daysChecked = 0;
                    do {
                        const nextDayIndex = (now.getDay() + daysChecked + 1) % 7;
                        nextDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][nextDayIndex];
                        if (!businessHours[nextDay].closed) {
                            opensAtElement.textContent = `${formatTime(businessHours[nextDay].open)} ${nextDay}`;
                            break;
                        }
                        daysChecked++;
                    } while (daysChecked < 7);
                }
            }
        }
    }

    // Update holiday hours
    function updateHolidayHours() {
        const holidayHoursElement = document.getElementById('holidayHours');
        if (holidayHoursElement) {
            const holidayHours = localStorage.getItem('holiday-hours') || 'Closed on all major holidays.';
            holidayHoursElement.textContent = holidayHours;
        }
    }

    // Initial update
    updateBusinessStatus();
    updateHolidayHours();

    // Update every minute
    setInterval(updateBusinessStatus, 60000);
});
