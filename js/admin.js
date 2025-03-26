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
        saveButton.onclick = saveBusinessHours;
        
        hoursForm.appendChild(saveButton);
        businessHoursSection.appendChild(hoursForm);
        
        // Load saved hours
        loadBusinessHours();
    }
}

// Initialize news editors
function initializeNewsEditors() {
    initializeNewsSection('tech-news', 'Tech News Articles');
    initializeNewsSection('crime-news', 'Crime News Articles');
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

// Helper function to create an editor
function createEditor(id, title) {
    const container = document.createElement('div');
    container.className = 'editor-container';
    
    const textarea = document.createElement('textarea');
    textarea.id = id;
    textarea.rows = 10;
    
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save Changes';
    saveBtn.onclick = () => saveContent(id);
    
    container.appendChild(textarea);
    container.appendChild(saveBtn);
    
    return container;
}

// Helper function to create business hour input
function createBusinessHourInput(day) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'business-hour-item';
    
    dayDiv.innerHTML = `
        <label>${day}</label>
        <input type="time" name="${day}-open" class="time-input">
        <span>to</span>
        <input type="time" name="${day}-close" class="time-input">
        <input type="checkbox" name="${day}-closed" class="closed-checkbox">
        <label class="closed-label">Closed</label>
    `;
    
    return dayDiv;
}

// Save content changes
function saveContent(id) {
    const content = document.getElementById(id).value;
    contentStorage.save(id, content);
    alert('Content saved successfully!');
}

// Save business hours
function saveBusinessHours() {
    const form = document.getElementById('business-hours-form');
    const hours = {};
    
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    daysOfWeek.forEach(day => {
        hours[day] = {
            open: form.querySelector(`[name="${day}-open"]`).value,
            close: form.querySelector(`[name="${day}-close"]`).value,
            closed: form.querySelector(`[name="${day}-closed"]`).checked
        };
    });
    
    contentStorage.save('business-hours', hours);
    alert('Business hours saved successfully!');
}

// Load business hours
function loadBusinessHours() {
    const savedHours = contentStorage.get('business-hours');
    if (savedHours) {
        Object.entries(savedHours).forEach(([day, hours]) => {
            const openInput = document.querySelector(`[name="${day}-open"]`);
            const closeInput = document.querySelector(`[name="${day}-close"]`);
            const closedInput = document.querySelector(`[name="${day}-closed"]`);
            
            if (openInput && closeInput && closedInput) {
                openInput.value = hours.open;
                closeInput.value = hours.close;
                closedInput.checked = hours.closed;
            }
        });
    }
}

// Initialize news section
function initializeNewsSection(sectionId, title) {
    const section = document.getElementById(sectionId);
    if (section) {
        const newsEditor = createNewsEditor(sectionId);
        section.appendChild(newsEditor);
        
        // Load existing news
        loadNews(sectionId);
    }
}

// Create news editor
function createNewsEditor(sectionId) {
    const container = document.createElement('div');
    container.className = 'news-editor';
    
    const form = document.createElement('form');
    form.innerHTML = `
        <div class="news-item-editor">
            <input type="text" name="title" placeholder="Article Title" required>
            <textarea name="content" placeholder="Article Content" required></textarea>
            <input type="text" name="image" placeholder="Image URL">
            <input type="text" name="category" placeholder="Category">
            <button type="button" onclick="saveNews('${sectionId}')">Add Article</button>
        </div>
        <div id="${sectionId}-list" class="news-list"></div>
    `;
    
    container.appendChild(form);
    return container;
}

// Save news article
function saveNews(sectionId) {
    const form = document.querySelector(`#${sectionId} form`);
    const articles = contentStorage.get(`${sectionId}-articles`) || [];
    
    const newArticle = {
        id: Date.now(),
        title: form.querySelector('[name="title"]').value,
        content: form.querySelector('[name="content"]').value,
        image: form.querySelector('[name="image"]').value,
        category: form.querySelector('[name="category"]').value,
        date: new Date().toISOString()
    };
    
    articles.push(newArticle);
    contentStorage.save(`${sectionId}-articles`, articles);
    
    // Reset form and refresh list
    form.reset();
    loadNews(sectionId);
}

// Load news articles
function loadNews(sectionId) {
    const articles = contentStorage.get(`${sectionId}-articles`) || [];
    const listContainer = document.getElementById(`${sectionId}-list`);
    
    if (listContainer) {
        listContainer.innerHTML = articles.map(article => `
            <div class="news-item">
                <h3>${article.title}</h3>
                <p>${article.content.substring(0, 100)}...</p>
                <button onclick="deleteNews('${sectionId}', ${article.id})">Delete</button>
            </div>
        `).join('');
    }
}

// Delete news article
function deleteNews(sectionId, articleId) {
    if (confirm('Are you sure you want to delete this article?')) {
        const articles = contentStorage.get(`${sectionId}-articles`) || [];
        const updatedArticles = articles.filter(article => article.id !== articleId);
        contentStorage.save(`${sectionId}-articles`, updatedArticles);
        loadNews(sectionId);
    }
}

// Create settings form
function createSettingsForm() {
    const form = document.createElement('form');
    form.innerHTML = `
        <div class="settings-item">
            <label>Site Title</label>
            <input type="text" name="site-title">
        </div>
        <div class="settings-item">
            <label>Contact Email</label>
            <input type="email" name="contact-email">
        </div>
        <div class="settings-item">
            <label>Phone Number</label>
            <input type="text" name="phone-number">
        </div>
        <div class="settings-item">
            <label>Address</label>
            <textarea name="address"></textarea>
        </div>
        <button type="button" onclick="saveSettings()">Save Settings</button>
    `;
    
    return form;
}

// Save settings
function saveSettings() {
    const form = document.querySelector('#settings form');
    const settings = {
        siteTitle: form.querySelector('[name="site-title"]').value,
        contactEmail: form.querySelector('[name="contact-email"]').value,
        phoneNumber: form.querySelector('[name="phone-number"]').value,
        address: form.querySelector('[name="address"]').value
    };
    
    contentStorage.save('site-settings', settings);
    alert('Settings saved successfully!');
}

// Load settings
function loadSettings() {
    const savedSettings = contentStorage.get('site-settings');
    if (savedSettings) {
        const form = document.querySelector('#settings form');
        form.querySelector('[name="site-title"]').value = savedSettings.siteTitle || '';
        form.querySelector('[name="contact-email"]').value = savedSettings.contactEmail || '';
        form.querySelector('[name="phone-number"]').value = savedSettings.phoneNumber || '';
        form.querySelector('[name="address"]').value = savedSettings.address || '';
    }
}

// Handle logout
document.getElementById('logout-btn')?.addEventListener('click', function() {
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = '../index.html';
    }
});
