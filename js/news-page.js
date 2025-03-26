document.addEventListener('DOMContentLoaded', function () {
    const techNewsLastUpdated = document.getElementById('techNewsLastUpdated');
    const crimeNewsLastUpdated = document.getElementById('crimeNewsLastUpdated');
    const newsArticleContainer = document.querySelector('.news-article-container');
    const articleModal = document.getElementById('articleModal');
    const modalContent = document.querySelector('.modal-content');

    // Sample news data
    const techNewsData = [
        {
            title: 'Tech News 1',
            date: '2025-03-01',
            content: 'Detailed content about Tech News 1...'
        },
        {
            title: 'Tech News 2',
            date: '2025-03-02',
            content: 'Detailed content about Tech News 2...'
        }
    ];

    const crimeNewsData = [
        {
            title: 'Crime News 1',
            date: '2025-03-01',
            content: 'Detailed content about Crime News 1...'
        },
        {
            title: 'Crime News 2',
            date: '2025-03-02',
            content: 'Detailed content about Crime News 2...'
        }
    ];

    // Function to display news articles
    function displayNews(newsData) {
        newsArticleContainer.innerHTML = '';
        newsData.forEach(article => {
            const articleDiv = document.createElement('div');
            articleDiv.classList.add('news-article');
            articleDiv.innerHTML = `
                <h3>${article.title}</h3>
                <p>${article.date}</p>
                <button class="read-more" data-content="${article.content}">Read more</button>
            `;
            newsArticleContainer.appendChild(articleDiv);
        });

        // Add event listeners to "Read more" buttons
        const readMoreButtons = document.querySelectorAll('.read-more');
        readMoreButtons.forEach(button => {
            button.addEventListener('click', function () {
                const content = this.getAttribute('data-content');
                modalContent.innerHTML = `<p>${content}</p>`;
                articleModal.style.display = 'block';
            });
        });
    }

    // Display tech or crime news based on the page
    if (techNewsLastUpdated) {
        techNewsLastUpdated.textContent = '2025-03-02';
        displayNews(techNewsData);
    } else if (crimeNewsLastUpdated) {
        crimeNewsLastUpdated.textContent = '2025-03-02';
        displayNews(crimeNewsData);
    }

    // Close the modal when clicking outside of the content
    articleModal.addEventListener('click', function (event) {
        if (event.target === articleModal) {
            articleModal.style.display = 'none';
        }
    });
});
