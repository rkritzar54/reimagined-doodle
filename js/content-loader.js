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
});

// Get current page name from URL
function getPageName() {
    const path = window.location.pathname;
    const page = path.split('/').pop().replace('.html', '');
    return page;
}

// Load site settings
function loadSiteSettings() {
    const settings = contentStorage.get('site-settings');
    if (settings) {
        // Update site title
        document.title = settings.siteTitle + ' - ' + document.title.split(' - ')[1];
        
        // Update footer information
        const footerAddress = document.querySelector('.footer-left p:first-of-type');
        const footerPhone = document.querySelector('.footer-left p:last-of-type');
        
        if (footerAddress) footerAddress.textContent = `Address: ${settings.address}`;
        if (footerPhone) footerPhone.textContent = `Phone: ${settings.phoneNumber}`;
    }
}

// Load about page content
function loadAboutContent() {
    const aboutContent = contentStorage.get('about-content');
    if (aboutContent) {
        const contentContainer = document.querySelector('.about-page');
        if (contentContainer) {
            // Preserve the heading
            const heading = contentContainer.querySelector('h1');
            contentContainer.innerHTML = '';
            if (heading) contentContainer.appendChild(heading);
            
            // Add the content
            const content = document.createElement('div');
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
            tableBody.innerHTML = Object.entries(hours).map(([day, times]) => `
                <tr class="${isCurrentDay(day) ? 'current-day' : ''}">
                    <td>${day}</td>
                    <td>${times.closed ? 'Closed' : `${times.open} - ${times.close}`}</td>
                </tr>
            `).join('');
        }
        
        // Update business status
        updateBusinessStatus(hours);
    }
}

// Check if day is current day
function isCurrentDay(day) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()] === day;
}

// Update business status
function updateBusinessStatus(hours) {
    const statusElement = document.getElementById('businessStatus');
    const opensAtElement = document.getElementById('opensAt');
    
    if (statusElement && opensAtElement) {
        const now = new Date();
        const currentDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
        const currentHours = hours[currentDay];
        
        if (currentHours.closed) {
            statusElement.textContent = 'Closed';
            statusElement.className = 'closed';
            
            // Find next open day
            let nextOpenDay = getNextOpenDay(hours, currentDay);
            if (nextOpenDay) {
                opensAtElement.textContent = `${nextOpenDay} at ${hours[nextOpenDay].open}`;
            }
        } else {
            const isOpen = isBusinessOpen(currentHours);
            statusElement.textContent = isOpen ? 'Open' : 'Closed';
            statusElement.className = isOpen ? 'open' : 'closed';
            
            if (!isOpen) {
                opensAtElement.textContent = currentHours.open;
            }
        }
    }
}

// Load news content
function loadNewsContent(section) {
    const articles = contentStorage.get(`${section}-articles`);
    if (articles) {
        const container = document.querySelector('.news-article-container');
        if (container) {
            container.innerHTML = articles.map(article => `
                <article class="news-article">
                    <div class="article-title">
                        <h3>${article.title}</h3>
                    </div>
                    <div class="article-meta">
                        Posted on ${new Date(article.date).toLocaleDateString()}
                    </div>
                    ${article.image ? `<img src="${article.image}" alt="${article.title}" class="article-image">` : ''}
                    <div class="article-excerpt">
                        <p>${article.content}</p>
                    </div>
                    ${article.category ? `
                        <div class="article-categories">
                            <span class="category-bubble">${article.category}</span>
                        </div>
                    ` : ''}
                </article>
            `).join('');
            
            // Update last updated timestamp
            const lastUpdated = document.getElementById(`${section}LastUpdated`);
            if (lastUpdated) {
                lastUpdated.textContent = new Date().toLocaleString();
            }
        }
    }
}

// Helper function to check if business is currently open
function isBusinessOpen(hours) {
    if (hours.closed) return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    
    const [openHours, openMinutes] = hours.open.split(':').map(Number);
    const [closeHours, closeMinutes] = hours.close.split(':').map(Number);
    
    const openTime = openHours * 100 + openMinutes;
    const closeTime = closeHours * 100 + closeMinutes;
    
    return currentTime >= openTime && currentTime <= closeTime;
}

// Helper function to get next open day
function getNextOpenDay(hours, currentDay) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
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
