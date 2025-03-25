const hamburger = document.getElementById('hamburger');
const mobileMenu = document.querySelector('nav ul.mobile-menu');

// Toggle the menu on click
hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
});

// Close the menu when a menu item is clicked
mobileMenu.addEventListener('click', () => {
    mobileMenu.classList.remove('active');
});

// Close the menu if the user clicks outside of it
window.addEventListener('click', (event) => {
    if (!hamburger.contains(event.target) && !mobileMenu.contains(event.target)) {
        mobileMenu.classList.remove('active');
    }
});
