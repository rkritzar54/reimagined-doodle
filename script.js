const hamburger = document.getElementById('hamburger');
const mobileMenu = document.querySelector('nav ul.mobile-menu');

// Toggle mobile menu open/close
hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
});

// Close mobile menu when clicking outside
window.addEventListener('click', (event) => {
    if (!hamburger.contains(event.target) && !mobileMenu.contains(event.target)) {
        mobileMenu.classList.remove('active');
    }
});
