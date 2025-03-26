// Store content in localStorage for persistence
const contentStorage = {
    save: (key, data) => {
        localStorage.setItem(key, JSON.stringify(data));
    },
    get: (key) => {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }
};

document.addEventListener('DOMContentLoaded', function() {
    // Initialize admin user information
    updateAdminUser();
    
    // Initialize tab switching
    initializeTabs();
    
    // Initialize all content editors
    initializeContentEditors();
    
    // Initialize business hours editor
    initializeBusinessHours();
    
    // Initialize news editors
    initializeNewsEditors();
    
    // Initialize settings
    initializeSettings();

    // Initialize current time display
    initializeTimeDisplay();
});

// Update admin user information
function updateAdminUser() {
    const adminUsername = document.querySelector('.admin-username');
    const adminAvatar = document.querySelector('.admin-avatar');
    if (adminUsername && adminAvatar) {
        adminUsername.textContent = 'rkritzar54';
        adminAvatar.src = 'https://github.com/rkritzar54.png';
    }
}

// Tab switching functionality
function initializeTabs() {
    const tabItems = document.querySelectorAll('.tab-item');
    const tabContents = document.querySelectorAll('.tab-content');

    tabItems.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            
            // Handle logout specially
            if (tabId === 'logout') {
                if (confirm('Are you sure you want to logout?')) {
                    window.location.href = 'login.html';
                }
                return;
            }
            
            // Remove active class from all tabs and contents
            tabItems.forEach(item => item.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to selected tab and content
            tab.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// Initialize content editors
function initializeContentEditors() {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
        // Create About page editor
        const aboutEditor = createEditor('about-content', 'About Page Content');
        aboutSection.appendChild(aboutEditor);
        
        // Load existing content
        const savedAboutContent = contentStorage.get('about-content');
        if (savedAboutContent) {
            aboutEditor.querySelector('textarea').value = savedAboutContent;
        }
    }
}

// Create editor helper function
function createEditor(id, title) {
    const container = document.createElement('div');
    container.className = 'editor-container';
    container.innerHTML = `
        <h3>${title}</h3>
        <div class="editor-toolbar">
            <button type="button" data-command="bold"><strong>B</strong></button>
            <button type="button" data-command="italic"><em>I</em></button>
            <button type="button" data-command="underline"><u>U</u></button>
        </div>
        <textarea id="${id}" class="content-editor"></textarea>
        <button type="button" class="save-btn">Save Content</button>
    `;

    // Add event listeners for toolbar buttons
    const buttons = container.querySelectorAll('.editor-toolbar button');
    const textarea = container.querySelector('textarea');
    
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const command = button.getAttribute('data-command');
            const selection = textarea.value.substring(
                textarea.selectionStart,
                textarea.selectionEnd
            );
            
            let replacement = '';
            switch(command) {
                case 'bold':
                    replacement = `**${selection}**`;
                    break;
                case 'italic':
                    replacement = `*${selection}*`;
                    break;
                case 'underline':
                    replacement = `_${selection}_`;
                    break;
            }
            
            textarea.value = 
                textarea.value.substring(0, textarea.selectionStart) +
                replacement +
                textarea.value.substring(textarea.selectionEnd);
        });
    });

    // Add save functionality
    const saveBtn = container.querySelector('.save-btn');
    saveBtn.addEventListener('click', () => {
        contentStorage.save(id, textarea.value);
        showNotification('Content saved successfully!');
    });

    return container;
}

// Initialize business hours editor
function initializeBusinessHours() {
    const businessHoursSection = document.getElementById('business-hours');
    if (businessHoursSection) {
        const hoursForm = document.createElement('form');
        hoursForm.id = 'business-hours-form';
        
        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        
        daysOfWeek.forEach(day => {
            const dayDiv = createBusinessHourInput(day);
            hoursForm.appendChild(dayDiv);
        });
        
        // Add save button
        const saveButton = document.createElement('button');
        saveButton.type = 'button';
        saveButton.textContent = 'Save Business Hours';
        saveButton.className = 'save-btn';
        saveButton.onclick = saveBusinessHours;
        
        hoursForm.appendChild(saveButton);
        businessHoursSection.appendChild(hoursForm);
        
        // Load saved hours
        loadBusinessHours();
    }
}

function createBusinessHourInput(day) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'business-hour-item';

    // Load saved hours for this day
    const savedHours = contentStorage.get('business-hours') || {};
    const dayHours = savedHours[day] || { open: '09:00', close: '17:00', closed: false };

    dayDiv.innerHTML = `
        <label>${day}</label>
        <input type="time" name="${day}-open" class="time-input" value="${dayHours.open}" ${dayHours.closed ? 'disabled' : ''}>
        <span>to</span>
        <input type="time" name="${day}-close" class="time-input" value="${dayHours.close}" ${dayHours.closed ? 'disabled' : ''}>
        <label class="closed-checkbox">
            <input type="checkbox" name="${day}-closed" ${dayHours.closed ? 'checked' : ''}>
            Closed
        </label>
    `;

    // Add event listener for closed checkbox
    const checkbox = dayDiv.querySelector(`[name="${day}-closed"]`);
    const timeInputs = dayDiv.querySelectorAll('.time-input');
    
    checkbox.addEventListener('change', () => {
        timeInputs.forEach(input => input.disabled = checkbox.checked);
    });

    return dayDiv;
}

function loadBusinessHours() {
    const savedHours = contentStorage.get('business-hours');
    if (savedHours) {
        Object.entries(savedHours).forEach(([day, hours]) => {
            const openInput = document.querySelector(`[name="${day}-open"]`);
            const closeInput = document.querySelector(`[name="${day}-close"]`);
            const closedCheckbox = document.querySelector(`[name="${day}-closed"]`);
            
            if (openInput && closeInput && closedCheckbox) {
                openInput.value = hours.open;
                closeInput.value = hours.close;
                closedCheckbox.checked = hours.closed;
                openInput.disabled = hours.closed;
                closeInput.disabled = hours.closed;
            }
        });
    }
}

function saveBusinessHours() {
    const form = document.getElementById('business-hours-form');
    const hours = {};
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    days.forEach(day => {
        const closed = form.querySelector(`[name="${day}-closed"]`).checked;
        hours[day] = {
            open: form.querySelector(`[name="${day}-open"]`).value,
            close: form.querySelector(`[name="${day}-close"]`).value,
            closed: closed
        };
    });
    
    contentStorage.save('business-hours', hours);
    showNotification('Business hours saved successfully!');
}

// Initialize news editors
function initializeNewsEditors() {
    initializeNewsSection('tech-news', 'Tech News Articles');
    initializeNewsSection('crime-news', 'Crime News Articles');
}

function initializeNewsSection(id, title) {
    const section = document.getElementById(id);
    if (!section) return;

    const container = document.createElement('div');
    container.className = 'news-manager';
    
    // Create form for new articles
    const newsForm = document.createElement('form');
    newsForm.className = 'news-form';
    newsForm.innerHTML = `
        <h3>Add New Article</h3>
        <input type="text" name="title" placeholder="Article Title" required>
        <input type="text" name="category" placeholder="Category">
        <textarea name="content" placeholder="Article Content" required></textarea>
        <button type="submit" class="save-btn">Add Article</button>
    `;

    // Create list for existing articles
    const newsList = document.createElement('div');
    newsList.className = 'articles-list';
    newsList.innerHTML = `<h3>Published Articles</h3>`;

    container.appendChild(newsForm);
    container.appendChild(newsList);
    section.appendChild(container);

    // Handle form submission
    newsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const article = {
            id: Date.now(),
            title: e.target.title.value,
            category: e.target.category.value,
            content: e.target.content.value,
            date: new Date().toISOString()
        };

        const articles = contentStorage.get(id) || [];
        articles.unshift(article);
        contentStorage.save(id, articles);
        
        e.target.reset();
        loadArticles(newsList, articles);
        showNotification('Article added successfully!');
    });

    // Load existing articles
    const articles = contentStorage.get(id) || [];
    loadArticles(newsList, articles);
}

function loadArticles(container, articles) {
    const articlesList = container.querySelector('.articles-list') || container;
    articlesList.innerHTML = `
        <h3>Published Articles</h3>
        ${articles.map(article => `
            <div class="news-item">
                <div class="news-item-content">
                    <h4>${article.title}</h4>
                    <small>${new Date(article.date).toLocaleDateString()}</small>
                    <p>${article.content.substring(0, 100)}...</p>
                </div>
                <button class="btn btn-danger" onclick="deleteArticle('${article.id}')">Delete</button>
            </div>
        `).join('')}
    `;
}

function deleteArticle(id) {
    if (confirm('Are you sure you want to delete this article?')) {
        const techNews = contentStorage.get('tech-news') || [];
        const crimeNews = contentStorage.get('crime-news') || [];
        
        const updatedTechNews = techNews.filter(article => article.id !== Number(id));
        const updatedCrimeNews = crimeNews.filter(article => article.id !== Number(id));
        
        if (techNews.length !== updatedTechNews.length) {
            contentStorage.save('tech-news', updatedTechNews);
            loadArticles(document.querySelector('#tech-news .articles-list'), updatedTechNews);
        } else {
            contentStorage.save('crime-news', updatedCrimeNews);
            loadArticles(document.querySelector('#crime-news .articles-list'), updatedCrimeNews);
        }
        
        showNotification('Article deleted successfully!');
    }
}

// Initialize settings
function initializeSettings() {
    const settingsSection = document.getElementById('settings');
    if (settingsSection) {
        const settingsForm = createSettingsForm();
        settingsSection.appendChild(settingsForm);
        
        // Load saved settings
        loadSettings();
    }
}

function createSettingsForm() {
    const form = document.createElement('form');
    form.className = 'settings-container';
    form.innerHTML = `
        <div class="settings-group">
            <h3>General Settings</h3>
            <div class="setting-item">
                <label>Site Title</label>
                <input type="text" name="site-title" placeholder="My Portfolio">
            </div>
            <div class="setting-item">
                <label>Theme Color</label>
                <input type="color" name="theme-color">
            </div>
        </div>

        <div class="settings-group">
            <h3>Contact Information</h3>
            <div class="setting-item">
                <label>Business Address</label>
                <textarea name="address" placeholder="123 Main Street, Anytown, USA"></textarea>
            </div>
            <div class="setting-item">
                <label>Phone Number</label>
                <input type="tel" name="phone" placeholder="(555) 123-4567">
            </div>
            <div class="setting-item">
                <label>Email Address</label>
                <input type="email" name="email" placeholder="contact@myportfolio.com">
            </div>
        </div>

        <div class="settings-group">
            <h3>Social Media Links</h3>
            <div class="setting-item">
                <label>Facebook URL</label>
                <input type="url" name="facebook" placeholder="https://facebook.com/...">
            </div>
            <div class="setting-item">
                <label>Twitter URL</label>
                <input type="url" name="twitter" placeholder="https://twitter.com/...">
            </div>
            <div class="setting-item">
                <label>LinkedIn URL</label>
                <input type="url" name="linkedin" placeholder="https://linkedin.com/in/...">
            </div>
        </div>

        <button type="submit" class="save-btn">Save Settings</button>
    `;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const settings = {
            siteTitle: e.target['site-title'].value,
            themeColor: e.target['theme-color'].value,
            address: e.target.address.value,
            phone: e.target.phone.value,
            email: e.target.email.value,
            socialMedia: {
                facebook: e.target.facebook.value,
                twitter: e.target.twitter.value,
                linkedin: e.target.linkedin.value
            }
        };
        
        contentStorage.save('site-settings', settings);
        showNotification('Settings saved successfully!');
        
        // Update theme color if changed
        if (settings.themeColor) {
            document.documentElement.style.setProperty('--primary-color', settings.themeColor);
        }
    });

    return form;
}

function loadSettings() {
    const settings = contentStorage.get('site-settings');
    if (settings) {
        const form = document.querySelector('.settings-container');
        if (!form) return;

        form.querySelector('[name="site-title"]').value = settings.siteTitle || '';
        form.querySelector('[name="theme-color"]').value = settings.themeColor || '#2c3e50';
        form.querySelector('[name="address"]').value = settings.address || '';
        form.querySelector('[name="phone"]').value = settings.phone || '';
        form.querySelector('[name="email"]').value = settings.email || '';
        form.querySelector('[name="facebook"]').value = settings.socialMedia?.facebook || '';
        form.querySelector('[name="twitter"]').value = settings.socialMedia?.twitter || '';
        form.querySelector('[name="linkedin"]').value = settings.socialMedia?.linkedin || '';
    }
}

// Initialize time display
function initializeTimeDisplay() {
    const timeDisplay = document.createElement('div');
    timeDisplay.className = 'time-display';
    timeDisplay.innerHTML = `
        <div class="current-time">Current Time (UTC): ${new Date().toISOString().replace('T', ' ').slice(0, 19)}</div>
        <div class="current-user">User: rkritzar54</div>
    `;
    
    document.querySelector('.admin-header-content').appendChild(timeDisplay);
    
    // Update time every second
    setInterval(() => {
        const currentTime = timeDisplay.querySelector('.current-time');
        currentTime.textContent = `Current Time (UTC): ${new Date().toISOString().replace('T', ' ').slice(0, 19)}`;
    }, 1000);
}

// Utility function to show notifications
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }, 100);
}
