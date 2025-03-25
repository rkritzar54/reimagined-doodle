// Get the hamburger and mobile menu elements
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.querySelector('.mobile-menu');

// Toggle mobile menu when hamburger is clicked
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
});

// Close menu when clicking outside
document.addEventListener('click', (event) => {
    if (!hamburger.contains(event.target) && !mobileMenu.contains(event.target)) {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
    }
});
