document.addEventListener('DOMContentLoaded', function () {
    // Use dynamic timestamp
    const CURRENT_TIMESTAMP = new Date();

    const businessHours = {
        monday: { open: '09:00', close: '17:00', closed: false },
        tuesday: { open: '09:00', close: '17:00', closed: false },
        wednesday: { open: '09:00', close: '17:00', closed: false },
        thursday: { open: '09:00', close: '17:00', closed: false },
        friday: { open: '09:00', close: '16:00', closed: false },
        saturday: { closed: true },
        sunday: { closed: true }
    };

    const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    function updateDateTime() {
        const currentTimeElement = document.getElementById('currentTime');
        const userTimeZoneElement = document.getElementById('userTimeZone');
        
        if (currentTimeElement) {
            const now = new Date(CURRENT_TIMESTAMP);
            currentTimeElement.textContent = now.toLocaleString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour12: true
            });
        }

        if (userTimeZoneElement) {
            userTimeZoneElement.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone;
        }
    }

    function updateBusinessHours() {
        const hoursTable = document.getElementById('hoursTable');
        if (!hoursTable) return;

        const now = new Date(CURRENT_TIMESTAMP);
        const todayIndex = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

        hoursTable.innerHTML = DAYS.map((day, index) => {
            const dayInfo = businessHours[day];
            const isToday = index === todayIndex;

            return `
                <tr${isToday ? ' class="today"' : ''}>
                    <td>${day.charAt(0).toUpperCase() + day.slice(1)}</td>
                    <td>${dayInfo.closed ? 'Closed' : `${formatTime(dayInfo.open)} - ${formatTime(dayInfo.close)}`}</td>
                </tr>
            `;
        }).join('');
    }

    function updateStatus() {
        const now = new Date(CURRENT_TIMESTAMP);
        const currentDay = DAYS[now.getDay()];
        const dayInfo = businessHours[currentDay];
        
        const statusIndicator = document.getElementById('currentStatus');
        const statusText = document.getElementById('openClosedText');
        const nextChange = document.getElementById('nextChange');
        
        if (!statusIndicator || !statusText || !nextChange) return;

        if (dayInfo.closed) {
            displayClosedStatus(statusIndicator, statusText, nextChange);
            return;
        }

        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const [openHour, openMinute] = dayInfo.open.split(':').map(Number);
        const [closeHour, closeMinute] = dayInfo.close.split(':').map(Number);

        const currentTime = currentHour * 60 + currentMinute;
        const openTime = openHour * 60 + openMinute;
        const closeTime = closeHour * 60 + closeMinute;

        if (currentTime >= openTime && currentTime < closeTime) {
            displayOpenStatus(statusIndicator, statusText, nextChange, dayInfo.close);
        } else {
            displayClosedStatus(statusIndicator, statusText, nextChange);
        }
    }

    function displayOpenStatus(indicator, text, nextChange, closeTime) {
        indicator.className = 'status-indicator open';
        text.textContent = 'OPEN';
        nextChange.textContent = `Closes at ${formatTime(closeTime)}`;
    }

    function displayClosedStatus(indicator, text, nextChange) {
        indicator.className = 'status-indicator closed';
        text.textContent = 'CLOSED';
        const nextOpenTime = getNextOpenTime();
        nextChange.textContent = `Opens ${nextOpenTime}`;
    }

    function getNextOpenTime() {
        const now = new Date(CURRENT_TIMESTAMP);
        let currentDayIndex = now.getDay();
        let daysChecked = 0;
        
        while (daysChecked < 7) {
            currentDayIndex = (currentDayIndex + 1) % 7;
            const nextDay = DAYS[currentDayIndex];
            
            if (!businessHours[nextDay].closed) {
                return `${nextDay.charAt(0).toUpperCase() + nextDay.slice(1)} at ${formatTime(businessHours[nextDay].open)}`;
            }
            daysChecked++;
        }
        return 'soon';
    }

    function formatTime(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return new Date(2025, 2, 25, hours, minutes).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    // Initialize everything
    function init() {
        updateDateTime();
        updateBusinessHours();
        updateStatus();
    }

    // Initial load
    init();

    // Update every minute
    setInterval(init, 60000);
});

    // Booking system functionality
    const bookingButton = document.getElementById('bookingButton');
    const bookingModal = document.getElementById('bookingModal');
    
    if (bookingButton && bookingModal) {
        const closeModal = bookingModal.querySelector('.modal-close');

        bookingButton.addEventListener('click', function(e) {
            e.preventDefault();
            bookingModal.style.display = 'block';
            document.body.classList.add('modal-open');
            populateTimeSlots();
        });

        if (closeModal) {
            closeModal.addEventListener('click', function() {
                bookingModal.style.display = 'none';
                document.body.classList.remove('modal-open');
            });
        }

        window.addEventListener('click', function(e) {
            if (e.target === bookingModal) {
                bookingModal.style.display = 'none';
                document.body.classList.remove('modal-open');
            }
        });

        const bookingForm = document.getElementById('bookingForm');
        if (bookingForm) {
            bookingForm.addEventListener('submit', function(e) {
                e.preventDefault();
                alert('Booking submitted successfully!');
                bookingModal.style.display = 'none';
                document.body.classList.remove('modal-open');
            });
        }
    }

    function populateTimeSlots() {
        const timeSelect = document.getElementById('time');
        const dateInput = document.getElementById('date');
        
        if (!timeSelect || !dateInput) return;

        dateInput.addEventListener('change', function() {
            const selectedDate = new Date(this.value);
            const day = selectedDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
            const hours = businessHours[day];
            
            timeSelect.innerHTML = '<option value="">Select a time</option>';
            
            if (!hours.closed) {
                const [openHour] = hours.open.split(':');
                const [closeHour] = hours.close.split(':');
                
                for (let hour = parseInt(openHour); hour < parseInt(closeHour); hour++) {
                    for (let minute of ['00', '30']) {
                        const time = `${hour.toString().padStart(2, '0')}:${minute}`;
                        const displayTime = convertTime(time);
                        timeSelect.innerHTML += `<option value="${time}">${displayTime}</option>`;
                    }
                }
            }
        });
    }
});

    // Modal functionality for articles
    const modal = document.getElementById('articleModal');
    if (modal) {
        const modalContent = modal.querySelector('.modal-content');
        
        // Article content database
        const articles = {
            'tech-article1': {
                title: "AI Revolution in Web Development",
                author: CURRENT_USER,
                date: CURRENT_TIMESTAMP,
                category: "AI & Development",
                image: "ai-dev.jpg",
                content: `
                    <h2>AI Revolution in Web Development</h2>
                    <div class="news-meta">
                        Posted by: ${CURRENT_USER} | Category: AI & Development | Time: ${CURRENT_TIMESTAMP} UTC
                    </div>
                    <img src="ai-dev.jpg" alt="AI Development" class="modal-image">
                    <p>Artificial Intelligence is revolutionizing how we approach web development. New tools and frameworks are emerging that leverage AI to create more efficient and intelligent web applications.</p>
                    <h3>Key Developments</h3>
                    <p>The integration of AI in web development has led to several breakthrough innovations:</p>
                    <ul>
                        <li>Automated code generation and optimization</li>
                        <li>Intelligent debugging and error prediction</li>
                        <li>Enhanced user experience through predictive analytics</li>
                        <li>Smart content management systems</li>
                    </ul>
                    <h3>Future Implications</h3>
                    <p>As AI continues to evolve, we can expect to see:</p>
                    <ul>
                        <li>More sophisticated automated testing systems</li>
                        <li>Advanced natural language processing for better user interactions</li>
                        <li>Improved personalization capabilities</li>
                        <li>Enhanced security measures through AI-powered threat detection</li>
                    </ul>
                    <p>The future of web development is being shaped by these AI innovations, leading to more efficient and intelligent web applications.</p>
                `
            },
            'tech-article2': {
                title: "Cloud Computing Trends 2025",
                author: CURRENT_USER,
                date: CURRENT_TIMESTAMP,
                category: "Cloud Technology",
                image: "cloud-computing.jpg",
                content: `
                    <h2>Cloud Computing Trends 2025</h2>
                    <div class="news-meta">
                        Posted by: ${CURRENT_USER} | Category: Cloud Technology | Time: ${CURRENT_TIMESTAMP} UTC
                    </div>
                    <img src="cloud-computing.jpg" alt="Cloud Computing" class="modal-image">
                    <p>Cloud computing continues to evolve rapidly in 2025, bringing new possibilities and challenges to the tech industry.</p>
                    <h3>Major Trends</h3>
                    <ul>
                        <li>Edge computing integration</li>
                        <li>Serverless architecture adoption</li>
                        <li>Multi-cloud strategies</li>
                        <li>Green computing initiatives</li>
                    </ul>
                    <h3>Industry Impact</h3>
                    <p>These trends are reshaping how businesses operate:</p>
                    <ul>
                        <li>Improved scalability and flexibility</li>
                        <li>Enhanced data processing capabilities</li>
                        <li>Better resource optimization</li>
                        <li>Reduced environmental impact</li>
                    </ul>
                    <p>Organizations must adapt to these trends to remain competitive in the digital landscape.</p>
                `
            },
            'tech-article3': {
                title: "Cybersecurity Best Practices",
                author: CURRENT_USER,
                date: CURRENT_TIMESTAMP,
                category: "Security",
                image: "cybersecurity.jpg",
                content: `
                    <h2>Cybersecurity Best Practices</h2>
                    <div class="news-meta">
                        Posted by: ${CURRENT_USER} | Category: Security | Time: ${CURRENT_TIMESTAMP} UTC
                    </div>
                    <img src="cybersecurity.jpg" alt="Cybersecurity" class="modal-image">
                    <p>Essential cybersecurity practices that every developer and organization should implement.</p>
                    <h3>Key Security Measures</h3>
                    <ul>
                        <li>Regular security audits</li>
                        <li>Automated vulnerability scanning</li>
                        <li>Employee security training</li>
                        <li>Incident response planning</li>
                    </ul>
                    <h3>Implementation Strategy</h3>
                    <p>Follow these steps to enhance your security posture:</p>
                    <ul>
                        <li>Conduct risk assessments</li>
                        <li>Implement security frameworks</li>
                        <li>Regular security updates</li>
                        <li>Monitor and respond to threats</li>
                    </ul>
                `
            },
            'tech-article4': {
                title: "The Rise of WebAssembly",
                author: CURRENT_USER,
                date: CURRENT_TIMESTAMP,
                category: "Web Technologies",
                image: "webassembly.jpg",
                content: `
                    <h2>The Rise of WebAssembly</h2>
                    <div class="news-meta">
                        Posted by: ${CURRENT_USER} | Category: Web Technologies | Time: ${CURRENT_TIMESTAMP} UTC
                    </div>
                    <img src="webassembly.jpg" alt="WebAssembly" class="modal-image">
                    <p>WebAssembly is revolutionizing web performance and capabilities.</p>
                    <h3>Key Benefits</h3>
                    <ul>
                        <li>Near-native performance</li>
                        <li>Language independence</li>
                        <li>Secure execution</li>
                        <li>Efficient memory usage</li>
                    </ul>
                    <h3>Use Cases</h3>
                    <p>WebAssembly is being adopted in various domains:</p>
                    <ul>
                        <li>Gaming and 3D graphics</li>
                        <li>Video and image editing</li>
                        <li>Scientific computing</li>
                        <li>Virtual and augmented reality</li>
                    </ul>
                `
            },
            'crime-article1': {
                title: "Digital Security Threats in 2025",
                author: CURRENT_USER,
                date: CURRENT_TIMESTAMP,
                category: "Cybersecurity",
                image: "cyber-security.jpg",
                content: `
                    <h2>Digital Security Threats in 2025</h2>
                    <div class="news-meta">
                        Posted by: ${CURRENT_USER} | Category: Cybersecurity | Time: ${CURRENT_TIMESTAMP} UTC
                    </div>
                    <img src="cyber-security.jpg" alt="Cybersecurity" class="modal-image">
                    <p>As technology evolves, so do digital threats. Understanding and preparing for these emerging cybersecurity challenges is crucial.</p>
                    <h3>Current Threats</h3>
                    <ul>
                        <li>Advanced phishing attacks using AI</li>
                        <li>Quantum computing threats to encryption</li>
                        <li>IoT device vulnerabilities</li>
                        <li>Ransomware evolution</li>
                    </ul>
                    <h3>Protection Strategies</h3>
                    <ul>
                        <li>Implementing zero-trust security</li>
                        <li>Regular security audits</li>
                        <li>Employee awareness training</li>
                        <li>Advanced threat detection</li>
                    </ul>
                `
            },
            'crime-article2': {
                title: "Identity Theft Prevention Guide",
                author: CURRENT_USER,
                date: CURRENT_TIMESTAMP,
                category: "Personal Security",
                image: "identity-theft.jpg",
                content: `
                    <h2>Identity Theft Prevention Guide</h2>
                    <div class="news-meta">
                        Posted by: ${CURRENT_USER} | Category: Personal Security | Time: ${CURRENT_TIMESTAMP} UTC
                    </div>
                    <img src="identity-theft.jpg" alt="Identity Theft Prevention" class="modal-image">
                    <p>Protect yourself from identity theft with this comprehensive guide.</p>
                    <h3>Essential Prevention Steps</h3>
                    <ul>
                        <li>Use strong, unique passwords</li>
                        <li>Enable two-factor authentication</li>
                        <li>Monitor credit reports</li>
                        <li>Secure personal information</li>
                    </ul>
                    <h3>Warning Signs</h3>
                    <ul>
                        <li>Unexpected credit score changes</li>
                        <li>Unrecognized account activity</li>
                        <li>Missing mail or email</li>
                        <li>Suspicious tax activities</li>
                    </ul>
                `
            },
            'crime-article3': {
                title: "Online Scam Alert",
                author: CURRENT_USER,
                date: CURRENT_TIMESTAMP,
                category: "Digital Fraud",
                image: "online-scam.jpg",
                content: `
                    <h2>Online Scam Alert</h2>
                    <div class="news-meta">
                        Posted by: ${CURRENT_USER} | Category: Digital Fraud | Time: ${CURRENT_TIMESTAMP} UTC
                    </div>
                    <img src="online-scam.jpg" alt="Online Scam Prevention" class="modal-image">
                    <p>Stay informed about the latest online scams and protect yourself.</p>
                    <h3>Current Scam Types</h3>
                    <ul>
                        <li>AI voice impersonation</li>
                        <li>Cryptocurrency fraud</li>
                        <li>Fake job offers</li>
                        <li>QR code phishing</li>
                    </ul>
                    <h3>Protection Tips</h3>
                    <ul>
                        <li>Verify information requests</li>
                        <li>Research before investing</li>
                        <li>Use secure payments</li>
                        <li>Keep systems updated</li>
                    </ul>
                `
            },
            'crime-article4': {
                title: "Secure Password Practices",
                author: CURRENT_USER,
                date: CURRENT_TIMESTAMP,
                category: "Digital Safety",
                image: "password-security.jpg",
                content: `
                    <h2>Secure Password Practices</h2>
                    <div class="news-meta">
                        Posted by: ${CURRENT_USER} | Category: Digital Safety | Time: ${CURRENT_TIMESTAMP} UTC
                    </div>
                    <img src="password-security.jpg" alt="Password Security" class="modal-image">
                    <p>Essential guide to creating and managing secure passwords.</p>
                    <h3>Best Practices</h3>
                    <ul>
                        <li>Use unique passwords</li>
                        <li>Implement password managers</li>
                        <li>Enable multi-factor authentication</li>
                        <li>Regular password updates</li>
                    </ul>
                    <h3>Common Mistakes</h3>
                    <ul>
                        <li>Using personal information</li>
                        <li>Reusing passwords</li>
                        <li>Sharing credentials</li>
                        <li>Insecure storage</li>
                    </ul>
                `
            }
        };

        // Open modal when clicking Read Full Article
        document.querySelectorAll('.read-more').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const articleId = this.dataset.article;
                if (articles[articleId]) {
                    modalContent.innerHTML = `
                        ${articles[articleId].content}
                        <button class="modal-close">&times;</button>
                    `;
                    modal.style.display = 'block';
                    document.body.classList.add('modal-open');
                }
            });
        });

        // Close modal when clicking the close button or outside the modal
        modal.addEventListener('click', function(e) {
            if (e.target === modal || e.target.classList.contains('modal-close')) {
                modal.style.display = 'none';
                document.body.classList.remove('modal-open');
            }
        });

        // Close modal when pressing ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                modal.style.display = 'none';
                document.body.classList.remove('modal-open');
            }
        });

        // Update timestamps
        document.querySelectorAll('.news-timestamp').forEach(timestamp => {
            timestamp.textContent = `Last Updated: ${CURRENT_TIMESTAMP} UTC`;
        });
    }

    // Business Hours Functions
    function updateBusinessStatus() {
        const now = new Date();
        const currentDay = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
        const currentHours = businessHours[currentDay];
        
        const statusIndicator = document.getElementById('currentStatus');
        const nextChangeSpan = document.getElementById('nextChange');
        
        if (!statusIndicator || !nextChangeSpan) return;

        if (currentHours.closed) {
            statusIndicator.classList.remove('open');
            statusIndicator.classList.add('closed');
            nextChangeSpan.textContent = 'Next Open: ' + getNextOpenDay(currentDay);
        } else {
            const currentTime = now.getHours() * 100 + now.getMinutes();
            const openTime = parseInt(currentHours.open.replace(':', ''));
            const closeTime = parseInt(currentHours.close.replace(':', ''));
            
            if (currentTime >= openTime && currentTime < closeTime) {
                statusIndicator.classList.remove('closed');
                statusIndicator.classList.add('open');
                nextChangeSpan.textContent = 'Closes at ' + currentHours.close;
            } else {
                statusIndicator.classList.remove('open');
                statusIndicator.classList.add('closed');
                nextChangeSpan.textContent = currentTime < openTime ? 
                    'Opens at ' + currentHours.open : 
                    'Next Open: ' + getNextOpenDay(currentDay);
            }
        }

        // Update current time display
        const timeDisplay = document.getElementById('currentTime');
        if (timeDisplay) {
            timeDisplay.textContent = CURRENT_TIMESTAMP;
        }
    }

    function getNextOpenDay(currentDay) {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        let currentIndex = days.indexOf(currentDay);
        let daysChecked = 0;
        
        while (daysChecked < 7) {
            currentIndex = (currentIndex + 1) % 7;
            if (!businessHours[days[currentIndex]].closed) {
                return days[currentIndex].charAt(0).toUpperCase() + 
                       days[currentIndex].slice(1) + 
                       ' at ' + 
                       businessHours[days[currentIndex]].open;
            }
            daysChecked++;
        }
        return 'Check back later';
    }

    function initializeBookingSystem() {
        const bookingButton = document.getElementById('bookingButton');
        const bookingModal = document.getElementById('bookingModal');
        
        if (!bookingButton || !bookingModal) return;

        const closeModal = bookingModal.querySelector('.modal-close');

        bookingButton.addEventListener('click', function(e) {
            e.preventDefault();
            bookingModal.style.display = 'block';
            document.body.classList.add('modal-open');
            populateTimeSlots();
        });

        if (closeModal) {
            closeModal.addEventListener('click', function() {
                bookingModal.style.display = 'none';
                document.body.classList.remove('modal-open');
            });
        }

        window.addEventListener('click', function(e) {
            if (e.target === bookingModal) {
                bookingModal.style.display = 'none';
                document.body.classList.remove('modal-open');
            }
        });

        // Booking form submission
        const bookingForm = document.getElementById('bookingForm');
        if (bookingForm) {
            bookingForm.addEventListener('submit', function(e) {
                e.preventDefault();
                alert('Booking submitted successfully!');
                bookingModal.style.display = 'none';
                document.body.classList.remove('modal-open');
            });
        }
    }

    function populateTimeSlots() {
        const timeSelect = document.getElementById('time');
        const dateInput = document.getElementById('date');
        
        if (!timeSelect || !dateInput) return;

        dateInput.addEventListener('change', function() {
            const selectedDate = new Date(this.value);
            const day = selectedDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
            const hours = businessHours[day];
            
            timeSelect.innerHTML = '<option value="">Select a time</option>';
            
            if (!hours.closed) {
                const start = parseInt(hours.open.split(':')[0]);
                const end = parseInt(hours.close.split(':')[0]);
                
                for (let hour = start; hour < end; hour++) {
                    for (let minute of ['00', '30']) {
                        const time = `${hour.toString().padStart(2, '0')}:${minute}`;
                        timeSelect.innerHTML += `<option value="${time}">${time}</option>`;
                    }
                }
            }
        });
    }
});
