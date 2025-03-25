document.addEventListener('DOMContentLoaded', function() {
    // Hamburger menu functionality
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');

    hamburger.addEventListener('click', function() {
        this.classList.toggle('active');
        mobileMenu.classList.toggle('active');
    });

    // Modal functionality
    const modal = document.getElementById('articleModal');
    const modalContent = modal.querySelector('.modal-content');
    
    // Article content database
    const articles = {
        'tech-article1': {
            title: "AI Revolution in Web Development",
            author: "rkritzar54",
            date: "2025-03-25 18:43:58",
            category: "AI & Development",
            image: "ai-dev.jpg",
            content: `
                <h2>AI Revolution in Web Development</h2>
                <div class="news-meta">
                    Posted by: rkritzar54 | Category: AI & Development | Time: 2025-03-25 18:43:58 UTC
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
            author: "rkritzar54",
            date: "2025-03-25 18:43:58",
            category: "Cloud Technology",
            image: "cloud-computing.jpg",
            content: `
                <h2>Cloud Computing Trends 2025</h2>
                <div class="news-meta">
                    Posted by: rkritzar54 | Category: Cloud Technology | Time: 2025-03-25 18:43:58 UTC
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
            author: "rkritzar54",
            date: "2025-03-25 18:43:58",
            category: "Security",
            image: "cybersecurity.jpg",
            content: `
                <h2>Cybersecurity Best Practices</h2>
                <div class="news-meta">
                    Posted by: rkritzar54 | Category: Security | Time: 2025-03-25 18:43:58 UTC
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
            author: "rkritzar54",
            date: "2025-03-25 18:43:58",
            category: "Web Technologies",
            image: "webassembly.jpg",
            content: `
                <h2>The Rise of WebAssembly</h2>
                <div class="news-meta">
                    Posted by: rkritzar54 | Category: Web Technologies | Time: 2025-03-25 18:43:58 UTC
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
            author: "rkritzar54",
            date: "2025-03-25 18:43:58",
            category: "Cybersecurity",
            image: "cyber-security.jpg",
            content: `
                <h2>Digital Security Threats in 2025</h2>
                <div class="news-meta">
                    Posted by: rkritzar54 | Category: Cybersecurity | Time: 2025-03-25 18:43:58 UTC
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
            author: "rkritzar54",
            date: "2025-03-25 18:43:58",
            category: "Personal Security",
            image: "identity-theft.jpg",
            content: `
                <h2>Identity Theft Prevention Guide</h2>
                <div class="news-meta">
                    Posted by: rkritzar54 | Category: Personal Security | Time: 2025-03-25 18:43:58 UTC
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
            author: "rkritzar54",
            date: "2025-03-25 18:43:58",
            category: "Digital Fraud",
            image: "online-scam.jpg",
            content: `
                <h2>Online Scam Alert</h2>
                <div class="news-meta">
                    Posted by: rkritzar54 | Category: Digital Fraud | Time: 2025-03-25 18:43:58 UTC
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
            author: "rkritzar54",
            date: "2025-03-25 18:43:58",
            category: "Digital Safety",
            image: "password-security.jpg",
            content: `
                <h2>Secure Password Practices</h2>
                <div class="news-meta">
                    Posted by: rkritzar54 | Category: Digital Safety | Time: 2025-03-25 18:43:58 UTC
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
        timestamp.textContent = `Last Updated: 2025-03-25 18:43:58 UTC`;
    });
});
