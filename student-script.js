// Sample Books Data
const booksData = [
    { id: 1, title: "Introduction to Algorithms", author: "Thomas H. Cormen", isbn: "978-0262033848", status: "available", description: "A comprehensive introduction to the modern study of computer algorithms.", imageUrl: "https://covers.openlibrary.org/b/isbn/9780262033848-M.jpg" },
    { id: 2, title: "Clean Code", author: "Robert C. Martin", isbn: "978-0132350884", status: "available", description: "A handbook of agile software craftsmanship.", imageUrl: "https://covers.openlibrary.org/b/isbn/9780132350884-M.jpg" },
    { id: 3, title: "Design Patterns", author: "Erich Gamma", isbn: "978-0201633610", status: "unavailable", description: "Elements of reusable object-oriented software.", imageUrl: "https://covers.openlibrary.org/b/isbn/9780201633610-M.jpg" },
    { id: 4, title: "The Pragmatic Programmer", author: "Andrew Hunt", isbn: "978-0135957059", status: "available", description: "Your journey to mastery.", imageUrl: "https://covers.openlibrary.org/b/isbn/9780135957059-M.jpg" },
    { id: 5, title: "Structure and Interpretation of Computer Programs", author: "Harold Abelson", isbn: "978-0262510871", status: "available", description: "A classic text in computer science.", imageUrl: "https://covers.openlibrary.org/b/isbn/9780262510871-M.jpg" },
    { id: 6, title: "Code Complete", author: "Steve McConnell", isbn: "978-0735619678", status: "unavailable", description: "A practical handbook of software construction.", imageUrl: "https://covers.openlibrary.org/b/isbn/9780735619678-M.jpg" },
    { id: 7, title: "Refactoring", author: "Martin Fowler", isbn: "978-0134757599", status: "available", description: "Improving the design of existing code.", imageUrl: "https://covers.openlibrary.org/b/isbn/9780134757599-M.jpg" },
    { id: 8, title: "Head First Design Patterns", author: "Eric Freeman", isbn: "978-0596007126", status: "available", description: "A brain-friendly guide to design patterns.", imageUrl: "https://covers.openlibrary.org/b/isbn/9780596007126-M.jpg" },
    { id: 9, title: "JavaScript: The Good Parts", author: "Douglas Crockford", isbn: "978-0596517748", status: "available", description: "Unearthing the excellence in JavaScript.", imageUrl: "https://covers.openlibrary.org/b/isbn/9780596517748-M.jpg" },
    { id: 10, title: "You Don't Know JS", author: "Kyle Simpson", isbn: "978-1491950357", status: "unavailable", description: "Deep dive into JavaScript.", imageUrl: "https://covers.openlibrary.org/b/isbn/9781491950357-M.jpg" },
    { id: 11, title: "Eloquent JavaScript", author: "Marijn Haverbeke", isbn: "978-1593279509", status: "available", description: "A modern introduction to programming.", imageUrl: "https://covers.openlibrary.org/b/isbn/9781593279509-M.jpg" },
    { id: 12, title: "Python Crash Course", author: "Eric Matthes", isbn: "978-1593279288", status: "available", description: "A hands-on, project-based introduction to programming.", imageUrl: "https://covers.openlibrary.org/b/isbn/9781593279288-M.jpg" }
];

// Sample Loans Data
const loansData = [
    { id: 1, bookId: 2, bookTitle: "Clean Code", borrowDate: "2025-01-05", dueDate: "2025-01-19", status: "active" },
    { id: 2, bookId: 4, bookTitle: "The Pragmatic Programmer", borrowDate: "2025-01-01", dueDate: "2025-01-15", status: "overdue" }
];

// Pagination variables
let currentPage = 1;
const booksPerPage = 6;
let filteredBooks = [...booksData];

// DOM Elements
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const searchInput = document.getElementById('search-input');
const searchBtn = document.querySelector('.search-btn');
const booksListContainer = document.getElementById('books-list');
const paginationContainer = document.getElementById('pagination');
const loansListContainer = document.getElementById('loans-list');
const modal = document.getElementById('book-modal');
const closeBtn = document.querySelector('.close-btn');
const bookDetailContainer = document.getElementById('book-detail');
const logoutBtn = document.querySelector('.logout-btn');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    renderBooks();
    renderPagination();
    renderLoans();
});

// Tab Switching
tabBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        const tabName = this.getAttribute('data-tab');

        // Remove active class from all tabs and contents
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        // Add active class to clicked tab and corresponding content
        this.classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
    });
});

// Search Functionality
searchBtn.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        performSearch();
    }
});

function performSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();

    if (searchTerm === '') {
        filteredBooks = [...booksData];
    } else {
        filteredBooks = booksData.filter(book =>
            book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm) ||
            book.isbn.includes(searchTerm)
        );
    }

    currentPage = 1;
    renderBooks();
    renderPagination();
}

// Render Books
function renderBooks() {
    const startIndex = (currentPage - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    const booksToShow = filteredBooks.slice(startIndex, endIndex);

    booksListContainer.innerHTML = '';

    if (booksToShow.length === 0) {
        booksListContainer.innerHTML = '<p style="text-align: center; color: #666;">No books found.</p>';
        return;
    }

    booksToShow.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        bookCard.innerHTML = `
            <img src="${book.imageUrl}" alt="${book.title}" class="book-image" onerror="this.src='https://via.placeholder.com/150x200?text=No+Cover'">
            <div class="book-info">
                <div class="book-title">${book.title}</div>
                <div class="book-author">by ${book.author}</div>
                <div class="book-isbn">ISBN: ${book.isbn}</div>
                <span class="book-status ${book.status}">${book.status === 'available' ? 'Available' : 'Borrowed'}</span>
            </div>
        `;

        bookCard.addEventListener('click', () => showBookDetail(book));
        booksListContainer.appendChild(bookCard);
    });
}

// Render Pagination
function renderPagination() {
    const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
    paginationContainer.innerHTML = '';

    if (totalPages <= 1) return;

    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.textContent = '← Previous';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderBooks();
            renderPagination();
        }
    });
    paginationContainer.appendChild(prevBtn);

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => {
            currentPage = i;
            renderBooks();
            renderPagination();
        });
        paginationContainer.appendChild(pageBtn);
    }

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.textContent = 'Next →';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderBooks();
            renderPagination();
        }
    });
    paginationContainer.appendChild(nextBtn);
}

// Show Book Detail Modal
function showBookDetail(book) {
    bookDetailContainer.innerHTML = `
        <div class="book-detail-content">
            <img src="${book.imageUrl}" alt="${book.title}" class="book-detail-image" onerror="this.src='https://via.placeholder.com/200x300?text=No+Cover'">
            <div class="book-detail-info">
                <h3>${book.title}</h3>
                <p><strong>Author:</strong> ${book.author}</p>
                <p><strong>ISBN:</strong> ${book.isbn}</p>
                <p><strong>Status:</strong> <span class="book-status ${book.status}">${book.status === 'available' ? 'Available' : 'Borrowed'}</span></p>
                <p><strong>Description:</strong></p>
                <p>${book.description}</p>
                <button class="borrow-btn" ${book.status === 'unavailable' ? 'disabled' : ''} onclick="borrowBook(${book.id})">
                    ${book.status === 'available' ? 'Borrow Book' : 'Not Available'}
                </button>
            </div>
        </div>
    `;

    modal.classList.add('active');
}

// Borrow Book
function borrowBook(bookId) {
    const book = booksData.find(b => b.id === bookId);
    if (book && book.status === 'available') {
        alert(`You have successfully borrowed "${book.title}"!`);
        book.status = 'unavailable';

        // Add to loans
        const today = new Date();
        const dueDate = new Date(today);
        dueDate.setDate(dueDate.getDate() + 14);

        loansData.push({
            id: loansData.length + 1,
            bookId: book.id,
            bookTitle: book.title,
            borrowDate: today.toISOString().split('T')[0],
            dueDate: dueDate.toISOString().split('T')[0],
            status: 'active'
        });

        modal.classList.remove('active');
        renderBooks();
        renderLoans();
    }
}

// Render Loans
function renderLoans() {
    loansListContainer.innerHTML = '';

    if (loansData.length === 0) {
        loansListContainer.innerHTML = '<p style="text-align: center; color: #666;">You currently have no borrowed books.</p>';
        return;
    }

    loansData.forEach(loan => {
        // Find the book to get its image
        const book = booksData.find(b => b.id === loan.bookId);
        const bookImage = book ? book.imageUrl : 'https://via.placeholder.com/80x120?text=No+Cover';

        const loanCard = document.createElement('div');
        loanCard.className = 'loan-card';
        loanCard.innerHTML = `
            <img src="${bookImage}" alt="${loan.bookTitle}" class="loan-book-image" onerror="this.src='https://via.placeholder.com/80x120?text=No+Cover'">
            <div class="loan-info">
                <div class="loan-title">${loan.bookTitle}</div>
                <div class="loan-date">Borrowed on: ${formatDate(loan.borrowDate)} | Due on: ${formatDate(loan.dueDate)}</div>
            </div>
            <span class="loan-status ${loan.status}">${loan.status === 'active' ? 'Active' : 'Overdue'}</span>
        `;
        loansListContainer.appendChild(loanCard);
    });
}

// Format Date
function formatDate(dateString) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('de-DE', options);
}

// Close Modal
closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('active');
    }
});

// Logout
logoutBtn.addEventListener('click', () => {
    if (confirm('Do you really want to log out?')) {
        window.location.href = 'login.html';
    }
});
