document.addEventListener('DOMContentLoaded', function () {
    const dropdowns = document.querySelectorAll('.dropdown');

    // Restore dropdown state from localStorage
    dropdowns.forEach((dropdown, index) => {
        const savedState = localStorage.getItem(`dropdown-${index}`);
        const menu = dropdown.querySelector('.dropdown-menu');

        if (menu && savedState === 'open') {
            menu.style.display = 'block';
        }
    });

    // Handle hover for desktops
    dropdowns.forEach((dropdown, index) => {
        const menu = dropdown.querySelector('.dropdown-menu');

        dropdown.addEventListener('mouseenter', function () {
            if (menu) {
                menu.style.display = 'block';
                localStorage.setItem(`dropdown-${index}`, 'open'); // Save state
            }
        });

        dropdown.addEventListener('mouseleave', function () {
            if (menu) {
                menu.style.display = 'none';
                localStorage.setItem(`dropdown-${index}`, 'closed'); // Save state
            }
        });

        // Optional: Handle clicks for mobile
        dropdown.addEventListener('click', function () {
            if (menu) {
                const isVisible = menu.style.display === 'block';
                menu.style.display = isVisible ? 'none' : 'block';
                localStorage.setItem(`dropdown-${index}`, isVisible ? 'closed' : 'open'); // Save state
            }
        });
    });
});
