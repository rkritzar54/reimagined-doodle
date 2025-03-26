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

        document.addEventListener('DOMContentLoaded', function () {
    const dropdowns = document.querySelectorAll('.dropdown');

    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('click', function (event) {
            event.preventDefault(); // Prevent default link behavior
            const menu = this.querySelector('.dropdown-menu');
            if (menu) {
                const isOpen = menu.style.display === 'block';
                menu.style.display = isOpen ? 'none' : 'block'; // Toggle menu
            }
        });
    });
});

