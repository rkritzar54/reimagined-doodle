// JavaScript to toggle the mobile menu
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.querySelector('.mobile-menu');

// Toggle the mobile menu when the hamburger is clicked
hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
});

// Close the mobile menu when clicking outside the menu or hamburger
window.addEventListener('click', (event) => {
    if (!hamburger.contains(event.target) && !mobileMenu.contains(event.target)) {
        mobileMenu.classList.remove('active');
    }
});
