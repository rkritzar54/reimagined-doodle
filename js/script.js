document.addEventListener('DOMContentLoaded', function () {
    const dropdowns = document.querySelectorAll('.dropdown');

    // Handle hover for desktops
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('mouseenter', function () {
            const menu = this.querySelector('.dropdown-menu');
            if (menu) {
                menu.style.display = 'block';
            }
        });

        dropdown.addEventListener('mouseleave', function () {
            const menu = this.querySelector('.dropdown-menu');
            if (menu) {
                menu.style.display = 'none';
            }
        });
    });

    // Handle clicks for mobile (optional)
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('click', function () {
            const menu = this.querySelector('.dropdown-menu');
            if (menu) {
                const isVisible = menu.style.display === 'block';
                menu.style.display = isVisible ? 'none' : 'block';
            }
        });
    });
});

const hamburger = document.getElementById('hamburger');
const navMenu = document.querySelector('.main-nav ul');

hamburger.addEventListener('click', function () {
    navMenu.classList.toggle('show');
});
