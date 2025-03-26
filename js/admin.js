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
    
    // Initialize dashboard status
    updateDashboardStatus();
    
    // Initialize all content editors
    initializeContentEditors();
    
    // Initialize business hours editor
    initializeBusinessHours();
    
    // Initialize news editors
    initializeNewsEditors();
    
    // Initialize settings
    initializeSettings();

    // Initialize time display with exact format
    initializeTimeDisplay();
});

// Time display function with exact format
function initializeTimeDisplay() {
    const timeDisplay = document.createElement('div');
    timeDisplay.className = 'time-display';
    
    function updateDisplay() {
        const now = new Date();
        const year = now.getUTCFullYear();
        const month = String(now.getUTCMonth() + 1).padStart(2, '0');
        const day = String(now.getUTCDate()).padStart(2, '0');
        const hours = String(now.getUTCHours()).padStart(2, '0');
        const minutes = String(now.getUTCMinutes()).padStart(2, '0');
        const seconds = String(now.getUTCSeconds()).padStart(2, '0');
        
        const timeStr = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

        timeDisplay.innerHTML = `
            <div class="current-time">Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): ${timeStr}</div>
            <div class="current-user">Current User's Login: rkritzar54</div>
        `;
    }

    updateDisplay();
    document.querySelector('.admin-header').appendChild(timeDisplay);
    setInterval(updateDisplay, 1000);
}

// Dashboard update function
function updateDashboardStatus() {
    const currentStatus = document.getElementById('current-status');
    const hoursUpdated = document.getElementById('hours-updated');
    const aboutUpdated = document.getElementById('about-updated');
    const techNewsCount = document.getElementById('tech-news-count');
    const crimeNewsCount = document.getElementById('crime-news-count');

    // Update business hours status
    const businessHours = contentStorage.get('business-hours');
    if (businessHours) {
        const now = new Date();
        const currentDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
        const todayHours = businessHours[currentDay];
        
        if (currentStatus) {
            if (todayHours.closed) {
                currentStatus.textContent = 'Closed Today';
                currentStatus.className = 'status closed';
            } else {
                currentStatus.textContent = `Open ${todayHours.open} - ${todayHours.close}`;
                currentStatus.className = 'status open';
            }
        }
        
        if (hoursUpdated) {
            const lastUpdate = contentStorage.get('business-hours-last-updated');
            hoursUpdated.textContent = lastUpdate ? new Date(lastUpdate).toLocaleString() : 'Never';
        }
    }

    // Update about page status
    if (aboutUpdated) {
        const lastUpdate = contentStorage.get('about-last-updated');
        aboutUpdated.textContent = lastUpdate ? new Date(lastUpdate).toLocaleString() : 'Never';
    }

    // Update news counts
    if (techNewsCount) {
        const techNews = contentStorage.get('tech-news') || [];
        techNewsCount.textContent = techNews.length;
    }
    
    if (crimeNewsCount) {
        const crimeNews = contentStorage.get('crime-news') || [];
        crimeNewsCount.textContent = crimeNews.length;
    }
}

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
        const aboutEditor = createEditor('about-content', 'About Page Content');
        aboutSection.appendChild(aboutEditor);
        
        // Load existing content
        const savedContent = contentStorage.get('about-content');
        if (savedContent) {
            const textarea = aboutEditor.querySelector('textarea');
            if (textarea) {
                textarea.value = savedContent;
                
                // Update preview if it exists
                const preview = aboutEditor.querySelector('.editor-preview');
                if (preview) {
                    preview.innerHTML = savedContent;
                }
            }
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
        <div class="editor-preview"></div>
        <button type="button" class="save-btn">Save Content</button>
    `;

    const textarea = container.querySelector('textarea');
    const preview = container.querySelector('.editor-preview');
    const buttons = container.querySelectorAll('.editor-toolbar button');
    
    // Add toolbar button functionality
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
            
            preview.innerHTML = textarea.value;
        });
    });

    // Add live preview
    textarea.addEventListener('input', () => {
        preview.innerHTML = textarea.value;
    });

    // Add save functionality
    const saveBtn = container.querySelector('.save-btn');
    saveBtn.addEventListener('click', () => {
        contentStorage.save(id, textarea.value);
        contentStorage.save(`${id}-last-updated`, new Date().toISOString());
        updateDashboardStatus();
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
        timeInputs.forEach(input => {
            input.disabled = checkbox.checked;
        });
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
    contentStorage.save('business-hours-last-updated', new Date().toISOString());
    updateDashboardStatus();
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

    // Clear existing content
    section.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'news-manager';
    
    // Create form for new articles
    const newsForm = document.createElement('form');
    newsForm.className = 'news-form';
    newsForm.innerHTML = `
        <h3>Add New ${title}</h3>
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
        updateDashboardStatus();
        showNotification('Article added successfully!');
    });

    // Load existing articles
    const articles = contentStorage.get(id) || [];
    loadArticles(newsList, articles);
}

function loadArticles(container, articles) {
    container.innerHTML = `
        <h3>Published Articles</h3>
        ${articles.map(article => `
            <div class="news-item">
                <div class="news-item-content">
                    <h4>${article.title}</h4>
                    <small>${new Date(article.date).toLocaleDateString()}</small>
                    <p>${article.content.substring(0, 100)}...</p>
                    ${article.category ? `<span class="category-tag">${article.category}</span>` : ''}
                </div>
                <button class="btn btn-danger" onclick="deleteArticle(${article.id}, '${article.title}', '${article.category}')">Delete</button>
            </div>
        `).join('')}
    `;
}

function deleteArticle(id, title, category) {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
        ['tech-news', 'crime-news'].forEach(section => {
            const articles = contentStorage.get(section) || [];
            const updated = articles.filter(article => article.id !== id);
            if (updated.length !== articles.length) {
                contentStorage.save(section, updated);
                const container = document.querySelector(`#${section} .articles-list`);
                if (container) {
                    loadArticles(container, updated);
                }
            }
        });
        updateDashboardStatus();
        showNotification('Article deleted successfully!');
    }
}

// Initialize settings
function initializeSettings() {
    const settingsSection = document.getElementById('settings');
    if (settingsSection) {
        settingsSection.innerHTML = '<h2>Website Settings</h2>';
        
        const settingsForm = createSettingsForm();
        settingsSection.appendChild(settingsForm);
        
        loadSettings();
    }
}

function createSettingsForm() {
    const form = document.createElement('form');
    form.id = 'settings-form';
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
                <input type="color" name="theme-color" value="#2c3e50">
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

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const settings = {
            siteTitle: this['site-title'].value,
            themeColor: this['theme-color'].value,
            address: this.address.value,
            phone: this.phone.value,
            email: this.email.value,
            socialMedia: {
                facebook: this.facebook.value,
                twitter: this.twitter.value,
                linkedin: this.linkedin.value
            }
        };
        
        contentStorage.save('site-settings', settings);
        contentStorage.save('settings-last-updated', new Date().toISOString());
        
        if (settings.themeColor) {
            document.documentElement.style.setProperty('--primary-color', settings.themeColor);
        }
        
        updateDashboardStatus();
        showNotification('Settings saved successfully!');
    });

    return form;
}

function loadSettings() {
    const settings = contentStorage.get('site-settings');
    if (settings) {
        const form = document.getElementById('settings-form');
        if (!form) return;

        if (settings.siteTitle) form['site-title'].value = settings.siteTitle;
        if (settings.themeColor) form['theme-color'].value = settings.themeColor;
        if (settings.address) form.address.value = settings.address;
        if (settings.phone) form.phone.value = settings.phone;
        if (settings.email) form.email.value = settings.email;
        
        if (settings.socialMedia) {
            if (settings.socialMedia.facebook) form.facebook.value = settings.socialMedia.facebook;
            if (settings.socialMedia.twitter) form.twitter.value = settings.socialMedia.twitter;
            if (settings.socialMedia.linkedin) form.linkedin.value = settings.socialMedia.linkedin;
        }
        
        if (settings.themeColor) {
            document.documentElement.style.setProperty('--primary-color', settings.themeColor);
        }
    }
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
