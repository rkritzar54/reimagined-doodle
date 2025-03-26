document.addEventListener('DOMContentLoaded', function() {
    // Update admin user information
    const adminUsername = document.querySelector('.admin-username');
    const adminAvatar = document.querySelector('.admin-avatar');
    if (adminUsername && adminAvatar) {
        adminUsername.textContent = 'rkritzar54';
        adminAvatar.src = 'https://github.com/rkritzar54.png';
    }

    // Tab switching functionality
    const tabItems = document.querySelectorAll('.tab-item');
    const tabContents = document.querySelectorAll('.tab-content');

    function switchTab(tabId) {
        // Remove active class from all tabs and contents
        tabItems.forEach(item => item.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // Add active class to selected tab and content
        const selectedTab = document.querySelector(`[data-tab="${tabId}"]`);
        const selectedContent = document.getElementById(tabId);
        
        if (selectedTab && selectedContent) {
            selectedTab.classList.add('active');
            selectedContent.classList.add('active');
        }
    }

    // Add click event listeners to all tabs
    tabItems.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    // Logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to logout?')) {
                // Add your logout logic here
                window.location.href = '../index.html'; // Redirect to home page
            }
        });
    }

    // Save functionality for each section
    function createSaveButton(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Save Changes';
        saveBtn.classList.add('save-btn');
        saveBtn.addEventListener('click', () => saveChanges(containerId));
        container.appendChild(saveBtn);
    }

    function saveChanges(sectionId) {
        // Add specific save logic for each section
        console.log(`Saving changes for ${sectionId}`);
        // Here you would typically send data to your backend
        alert('Changes saved successfully!');
    }

    // Create save buttons for editable sections
    ['business-hours', 'about', 'tech-news', 'crime-news', 'settings'].forEach(createSaveButton);

    // Business Hours Management
    const businessHoursSection = document.getElementById('business-hours');
    if (businessHoursSection) {
        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const hoursForm = document.createElement('form');
        hoursForm.id = 'business-hours-form';

        daysOfWeek.forEach(day => {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('business-hour-item');
            dayDiv.innerHTML = `
                <label>${day}</label>
                <input type="time" name="${day}-open" class="time-input">
                <span>to</span>
                <input type="time" name="${day}-close" class="time-input">
                <input type="checkbox" name="${day}-closed" class="closed-checkbox">
                <label class="closed-label">Closed</label>
            `;
            hoursForm.appendChild(dayDiv);
        });

        businessHoursSection.appendChild(hoursForm);
    }

    // Initialize content editors for About, Tech News, and Crime News sections
    function initializeContentEditor(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return;

        const editor = document.createElement('div');
        editor.classList.add('content-editor');
        editor.innerHTML = `
            <textarea class="content-textarea" rows="10" placeholder="Enter content here..."></textarea>
            <div class="editor-controls">
                <button type="button" class="format-btn" data-format="bold">Bold</button>
                <button type="button" class="format-btn" data-format="italic">Italic</button>
                <button type="button" class="format-btn" data-format="link">Add Link</button>
            </div>
        `;

        section.appendChild(editor);
    }

    // Initialize editors for content sections
    ['about', 'tech-news', 'crime-news'].forEach(initializeContentEditor);

    // Settings section
    const settingsSection = document.getElementById('settings');
    if (settingsSection) {
        const settingsForm = document.createElement('form');
        settingsForm.id = 'settings-form';
        settingsForm.innerHTML = `
            <div class="settings-item">
                <label>Site Title</label>
                <input type="text" name="site-title" value="My Portfolio">
            </div>
            <div class="settings-item">
                <label>Theme Color</label>
                <input type="color" name="theme-color">
            </div>
            <div class="settings-item">
                <label>Enable Notifications</label>
                <input type="checkbox" name="enable-notifications">
            </div>
        `;
        settingsSection.appendChild(settingsForm);
    }
});
