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

    // Convert EDT time to user's local timezone
    function convertFromEDT(timeStr) {
        if (!timeStr) return '';
        
        // Create a date object for today with the EDT time
        const today = new Date();
        const [hours, minutes] = timeStr.split(':');
        
        // Create date in EDT
        const edtDate = new Date(Date.UTC(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            parseInt(hours) + 4, // EDT is UTC-4
            parseInt(minutes)
        ));

        // Convert to local time
        const localHours = edtDate.getHours().toString().padStart(2, '0');
        const localMinutes = edtDate.getMinutes().toString().padStart(2, '0');
        
        return `${localHours}:${localMinutes}`;
    }

    // Format time to 12-hour format
    function formatTime(timeStr) {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes.padStart(2, '0')} ${ampm}`;
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
            hoursTableBody.innerHTML = Object.entries(businessHours).map(([day, hours]) => {
                const localOpenTime = convertFromEDT(hours.open);
                const localCloseTime = convertFromEDT(hours.close);
                return `
                    <tr class="${day === currentDay ? 'current-day' : ''}">
                        <td>${day}</td>
                        <td>${hours.closed ? 'Closed' : `${formatTime(localOpenTime)} - ${formatTime(localCloseTime)}`}</td>
                    </tr>
                `;
            }).join('');
        }

        // Determine if currently open
        const todayHours = businessHours[currentDay];
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
                    const localOpenTime = convertFromEDT(businessHours[nextDay].open);
                    opensAtElement.textContent = `${formatTime(localOpenTime)} ${nextDay}`;
                    break;
                }
                daysChecked++;
            } while (daysChecked < 7);
        } else {
            const localOpenTime = convertFromEDT(todayHours.open);
            const localCloseTime = convertFromEDT(todayHours.close);
            
            const [currentHour, currentMinute] = [now.getHours(), now.getMinutes()];
            const currentTimeNumber = currentHour * 100 + currentMinute;
            
            const [openHour, openMinute] = localOpenTime.split(':').map(Number);
            const [closeHour, closeMinute] = localCloseTime.split(':').map(Number);
            
            const openTimeNumber = openHour * 100 + openMinute;
            const closeTimeNumber = closeHour * 100 + closeMinute;

            if (currentTimeNumber >= openTimeNumber && currentTimeNumber < closeTimeNumber) {
                businessStatusElement.textContent = 'Open';
                businessStatusElement.className = 'open';
                opensAtElement.textContent = `Closes at ${formatTime(localCloseTime)}`;
            } else {
                businessStatusElement.textContent = 'Closed';
                businessStatusElement.className = 'closed';
                if (currentTimeNumber < openTimeNumber) {
                    opensAtElement.textContent = `Opens at ${formatTime(localOpenTime)} Today`;
                } else {
                    // Find next open day
                    let nextDay = currentDay;
                    let daysChecked = 0;
                    do {
                        const nextDayIndex = (now.getDay() + daysChecked + 1) % 7;
                        nextDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][nextDayIndex];
                        if (!businessHours[nextDay].closed) {
                            const nextDayOpenTime = convertFromEDT(businessHours[nextDay].open);
                            opensAtElement.textContent = `${formatTime(nextDayOpenTime)} ${nextDay}`;
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
