document.addEventListener('DOMContentLoaded', function () {
    // Function to update the business status
    function updateBusinessStatus() {
        const currentTimeElement = document.getElementById('currentTime');
        const currentTimezoneElement = document.getElementById('currentTimezone');
        const businessStatusElement = document.getElementById('businessStatus');
        const opensAtElement = document.getElementById('opensAt');
        const hoursTableBody = document.getElementById('hours-table-body');
        const holidayHoursElement = document.getElementById('holidayHours');

        const now = new Date();
        currentTimeElement.textContent = now.toLocaleTimeString();
        currentTimezoneElement.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone;

        const businessHours = [
            { day: 'Monday', hours: '9:00 AM - 5:00 PM' },
            { day: 'Tuesday', hours: '9:00 AM - 5:00 PM' },
            { day: 'Wednesday', hours: '9:00 AM - 5:00 PM' },
            { day: 'Thursday', hours: '9:00 AM - 5:00 PM' },
            { day: 'Friday', hours: '9:00 AM - 5:00 PM' },
            { day: 'Saturday', hours: 'Closed' },
            { day: 'Sunday', hours: 'Closed' },
        ];

        const specialHolidayHours = 'Closed on Christmas Day and New Year\'s Day.';

        // Update hours table
        hoursTableBody.innerHTML = '';
        businessHours.forEach(entry => {
            const row = document.createElement('tr');
            const dayCell = document.createElement('td');
            const hoursCell = document.createElement('td');
            dayCell.textContent = entry.day;
            hoursCell.textContent = entry.hours;
            row.appendChild(dayCell);
            row.appendChild(hoursCell);
            hoursTableBody.appendChild(row);
        });

        // Update holiday hours
        holidayHoursElement.textContent = specialHolidayHours;

        // Determine if the business is currently open
        const currentDay = now.getDay();
        const currentHour = now.getHours();
        const currentMinutes = now.getMinutes();

        if (currentDay >= 1 && currentDay <= 5) {
            // Weekdays
            if (currentHour >= 9 && currentHour < 17) {
                businessStatusElement.textContent = 'Open';
                opensAtElement.textContent = '5:00 PM Today';
            } else {
                businessStatusElement.textContent = 'Closed';
                opensAtElement.textContent = '9:00 AM Tomorrow';
            }
        } else {
            // Weekends
            businessStatusElement.textContent = 'Closed';
            opensAtElement.textContent = '9:00 AM Monday';
        }
    }

    // Update the business status immediately
    updateBusinessStatus();

    // Update the business status every minute
    setInterval(updateBusinessStatus, 60000);
});
