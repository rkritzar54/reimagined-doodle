document.addEventListener('DOMContentLoaded', function () {
    const dropdowns = document.querySelectorAll('.dropdown');

    // Restore dropdown state from localStorage
    dropdowns.forEach((dropdown, index) => {
        const menu = dropdown.querySelector('.dropdown-menu');
        const savedState = localStorage.getItem(`dropdown-${index}`);

        if (menu && savedState === 'open') {
            dropdown.classList.add('open'); // Add a CSS class to indicate it's open
            menu.style.display = 'block'; // Ensure dropdown menu is visible
        }
    });

    // Handle hover for desktops
    dropdowns.forEach((dropdown, index) => {
        const menu = dropdown.querySelector('.dropdown-menu');

        dropdown.addEventListener('mouseenter', function () {
            if (menu) {
                dropdown.classList.add('open'); // Add CSS class
                menu.style.display = 'block'; // Show dropdown menu
                localStorage.setItem(`dropdown-${index}`, 'open'); // Save state
            }
        });

        dropdown.addEventListener('mouseleave', function () {
            if (menu) {
                dropdown.classList.remove('open'); // Remove CSS class
                menu.style.display = 'none'; // Hide dropdown menu
                localStorage.setItem(`dropdown-${index}`, 'closed'); // Save state
            }
        });
    });

    // Handle click for mobile
    dropdowns.forEach((dropdown, index) => {
        dropdown.addEventListener('click', function (event) {
            event.preventDefault(); // Prevent default link behavior
            const menu = this.querySelector('.dropdown-menu');
            if (menu) {
                const isVisible = menu.style.display === 'block';
                menu.style.display = isVisible ? 'none' : 'block'; // Toggle visibility
                dropdown.classList.toggle('open', !isVisible); // Toggle CSS class
                localStorage.setItem(`dropdown-${index}`, !isVisible ? 'open' : 'closed'); // Save state
            }
        });
    });
});
