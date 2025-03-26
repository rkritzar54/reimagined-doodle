document.addEventListener('DOMContentLoaded', function () {
    const dropdowns = document.querySelectorAll('.dropdown');

    // Restore dropdown state from localStorage
    dropdowns.forEach((dropdown, index) => {
        const menu = dropdown.querySelector('.dropdown-menu');
        const savedState = localStorage.getItem(`dropdown-${index}`);

        if (menu && savedState === 'open') {
            dropdown.classList.add('open'); // Add a CSS class to indicate it's open
        }
    });

    // Handle hover for desktops
    dropdowns.forEach((dropdown, index) => {
        const menu = dropdown.querySelector('.dropdown-menu');

        dropdown.addEventListener('mouseenter', function () {
            if (menu) {
                dropdown.classList.add('open'); // Add CSS class
                localStorage.setItem(`dropdown-${index}`, 'open'); // Save state
            }
        });

        dropdown.addEventListener('mouseleave', function () {
            if (menu) {
                dropdown.classList.remove('open'); // Remove CSS class
                localStorage.setItem(`dropdown-${index}`, 'closed'); // Save state
            }
        });

        // Optional: Handle clicks for mobile
        dropdown.addEventListener('click', function (event) {
            // Prevent default action and toggle menu for mobile
            event.preventDefault();
            if (menu) {
                const isOpen = dropdown.classList.contains('open');
                if (isOpen) {
                    dropdown.classList.remove('open');
                    localStorage.setItem(`dropdown-${index}`, 'closed');
                } else {
                    dropdown.classList.add('open');
                    localStorage.setItem(`dropdown-${index}`, 'open');
                }
            }
        });
    });
});
