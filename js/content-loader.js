// Content loader for public pages
document.addEventListener('DOMContentLoaded', function() {
    const contentStorage = {
        get: (key) => {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        }
    };

    // Load site settings
    loadSiteSettings();
    
    // Load page-specific content
    const pageName = getPageName();
    switch(pageName) {
        case 'about':
            loadAboutContent();
            break;
        case 'business-hours':
            loadBusinessHours();
            break;
        case 'tech-news':
        case 'crime-news':
            loadNewsContent(pageName);
            break;
    }

    // Update footer content
    updateFooterContent();
});

// Get current page name from URL
function getPageName() {
    const path = window.location.pathname;
    const page = path.split('/').pop().replace('.html', '');
    return page || 'index'; // Default to index if no page name
}

// Load site settings
function loadSiteSettings() {
    const settings = contentStorage.get('site-settings');
    if (settings) {
        // Update site title
        if (settings.siteTitle) {
            const currentTitle = document.title;
            const pageName = currentTitle.includes(' - ') ? currentTitle.split(' - ')[1] : currentTitle;
            document.title = `${settings.siteTitle} - ${pageName}`;
        }

        // Update theme color if set
        if (settings.themeColor) {
            document.documentElement.style.setProperty('--primary-color', settings.themeColor);
        }
    }
}

// Update footer content
function updateFooterContent() {
    const settings = contentStorage.get('site-settings');
    if (settings) {
        // Update site title in footer
        const footerTitle = document.getElementById('footer-title');
        const copyrightTitle = document.getElementById('footer-copyright-title');
        if (footerTitle && settings.siteTitle) footerTitle.textContent = settings.siteTitle;
        if (copyrightTitle && settings.siteTitle) copyrightTitle.textContent = settings.siteTitle;

        // Update contact information
        const footerAddress = document.getElementById('footer-address');
        const footerPhone = document.getElementById('footer-phone');
        if (footerAddress && settings.address) footerAddress.textContent = `Address: ${settings.address}`;
        if (footerPhone && settings.phone) footerPhone.textContent = `Phone: ${settings.phone}`;

        // Update social media links
        if (settings.socialMedia) {
            const socialLinks = {
                facebook: document.getElementById('footer-facebook'),
                twitter: document.getElementById('footer-twitter'),
                linkedin: document.getElementById('footer-linkedin')
            };

            Object.entries(socialLinks).forEach(([platform, element]) => {
                if (element && settings.socialMedia[platform]) {
                    element.href = settings.socialMedia[platform];
                    element.style.display = settings.socialMedia[platform] ? 'inline' : 'none';
                }
            });
        }
    }

    // Update copyright year
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// Load about page content
function loadAboutContent() {
    const aboutContent = contentStorage.get('about-content');
    if (aboutContent) {
        const contentContainer = document.querySelector('.about-content');
        if (contentContainer) {
            // Preserve the heading if it exists
            const heading = contentContainer.querySelector('h1');
            contentContainer.innerHTML = '';
            if (heading) contentContainer.appendChild(heading);
            
            // Add the content
            const content = document.createElement('div');
            content.className = 'about-text';
            content.innerHTML = aboutContent;
            contentContainer.appendChild(content);
        }
    }
}

// Load business hours
function loadBusinessHours() {
    const hours = contentStorage.get('business-hours');
    if (hours) {
        const tableBody = document.getElementById('hours-table-body');
        if (tableBody) {
            const currentDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
            
            tableBody.innerHTML = Object.entries(hours).map(([day, times]) => `
                <tr class="${day === currentDay ? 'current-day' : ''}">
                    <td>${day}</td>
                    <td>${times.closed ? 'Closed' : `${formatTime(times.open)} - ${formatTime(times.close)}`}</td>
                </tr>
            `).join('');
        }
        
        // Update business status
        updateBusinessStatus(hours);
    }
}

// Format time to 12-hour format
function formatTime(time) {
    if (!time) return '';
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Load news content
function loadNewsContent(section) {
    const articles = contentStorage.get(`${section}`) || [];
    const container = document.querySelector('.news-container');
    if (container && articles.length > 0) {
        container.innerHTML = articles.map(article => `
            <article class="news-article">
                <h3>${article.title}</h3>
                <div class="article-meta">
                    <span class="date">Posted on ${new Date(article.date).toLocaleDateString()}</span>
                    ${article.category ? `<span class="category">${article.category}</span>` : ''}
                </div>
                <div class="article-content">
                    <p>${article.content}</p>
                </div>
            </article>
        `).join('');
    } else if (container) {
        container.innerHTML = '<p class="no-articles">No articles available.</p>';
    }
}

// Update business status
function updateBusinessStatus(hours) {
    const statusElement = document.getElementById('business-status');
    const opensAtElement = document.getElementById('opens-at');
    
    if (!statusElement || !opensAtElement) return;

    const now = new Date();
    const currentDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
    const todayHours = hours[currentDay];

    if (todayHours.closed) {
        setStatus('Closed', false);
        const nextOpenDay = getNextOpenDay(hours, currentDay);
        if (nextOpenDay) {
            opensAtElement.textContent = `Opens ${nextOpenDay} at ${formatTime(hours[nextOpenDay].open)}`;
        }
    } else {
        const isOpen = isBusinessOpen(todayHours);
        setStatus(isOpen ? 'Open' : 'Closed', isOpen);
        if (!isOpen) {
            opensAtElement.textContent = `Opens today at ${formatTime(todayHours.open)}`;
        } else {
            opensAtElement.textContent = `Closes at ${formatTime(todayHours.close)}`;
        }
    }

    function setStatus(text, isOpen) {
        statusElement.textContent = text;
        statusElement.className = isOpen ? 'open' : 'closed';
    }
}

// Check if business is currently open
function isBusinessOpen(hours) {
    if (hours.closed) return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    
    const [openHours, openMinutes] = hours.open.split(':').map(Number);
    const [closeHours, closeMinutes] = hours.close.split(':').map(Number);
    
    const openTime = openHours * 100 + openMinutes;
    const closeTime = closeHours * 100 + closeMinutes;
    
    return currentTime >= openTime && currentTime < closeTime;
}

// Get next open day
function getNextOpenDay(hours, currentDay) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentIndex = days.indexOf(currentDay);
    
    for (let i = 1; i <= 7; i++) {
        const nextIndex = (currentIndex + i) % 7;
        const nextDay = days[nextIndex];
        if (!hours[nextDay].closed) {
            return nextDay;
        }
    }
    
    return null;
}
