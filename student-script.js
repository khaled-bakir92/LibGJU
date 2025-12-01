// API Base URL
const API_BASE = 'http://localhost/Projekt/api';

// Current logged-in student (should be set from login)
let currentStudent = JSON.parse(localStorage.getItem('currentStudent')) || {
    studentId: 'S001',
    name: 'John Doe'
};

// Data arrays (will be loaded from database)
let booksData = [];
let loansData = [];

// Pagination variables
let currentPage = 1;
const booksPerPage = 6;
let filteredBooks = [];

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
    loadAllData();
});

// Load all data from backend
async function loadAllData() {
    try {
        await Promise.all([
            loadBooks(),
            loadLoans()
        ]);
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Error loading data from server');
    }
}

// Load Books
async function loadBooks() {
    try {
        const response = await fetch(`${API_BASE}/books.php`);
        const data = await response.json();
        if (data.success) {
            booksData = data.data.map(book => ({
                id: book.id,
                title: book.title,
                author: book.author,
                isbn: book.isbn,
                status: book.status,
                description: book.description,
                imageUrl: book.image_url
            }));
            filteredBooks = [...booksData];
            renderBooks();
            renderPagination();
        }
    } catch (error) {
        console.error('Error loading books:', error);
    }
}

// Load Loans for current student
async function loadLoans() {
    try {
        const response = await fetch(`${API_BASE}/loans.php?student_id=${currentStudent.studentId}`);
        const data = await response.json();
        if (data.success) {
            loansData = data.data.map(loan => ({
                id: loan.id,
                bookId: loan.book_id,
                bookTitle: loan.book_title,
                borrowDate: loan.borrow_date,
                dueDate: loan.due_date,
                status: loan.status,
                imageUrl: loan.image_url
            }));
            renderLoans();
        }
    } catch (error) {
        console.error('Error loading loans:', error);
    }
}

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
    console.log('showBookDetail called for book:', book);

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
                <button class="borrow-btn" data-book-id="${book.id}" ${book.status === 'unavailable' ? 'disabled' : ''}>
                    ${book.status === 'available' ? 'Borrow Book' : 'Not Available'}
                </button>
            </div>
        </div>
    `;

    // Add event listener to borrow button
    const borrowBtn = bookDetailContainer.querySelector('.borrow-btn');
    console.log('Borrow button found:', borrowBtn);

    if (borrowBtn && !borrowBtn.disabled) {
        borrowBtn.addEventListener('click', () => {
            console.log('Borrow button clicked! Book ID:', book.id);
            borrowBook(book.id);
        });
        console.log('Event listener added to borrow button');
    }

    modal.classList.add('active');
}

// Borrow Book
async function borrowBook(bookId) {
    console.log('borrowBook function called with ID:', bookId);
    console.log('Current student:', currentStudent);

    const book = booksData.find(b => b.id === bookId);
    console.log('Found book:', book);

    if (!book || book.status !== 'available') {
        console.log('Book not available or not found');
        return;
    }

    try {
        console.log('Sending request to API...');
        const response = await fetch(`${API_BASE}/loans.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                bookId: bookId,
                studentId: currentStudent.studentId
            })
        });

        console.log('Response received:', response);
        const data = await response.json();
        console.log('Response data:', data);

        if (data.success) {
            alert(`You have successfully borrowed "${book.title}"!\nDue date: ${data.due_date}`);
            modal.classList.remove('active');
            await loadAllData();
        } else {
            alert(data.message || 'Error borrowing book');
        }
    } catch (error) {
        console.error('Error borrowing book:', error);
        alert('Error borrowing book: ' + error.message);
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
        const loanCard = document.createElement('div');
        loanCard.className = 'loan-card';
        loanCard.innerHTML = `
            <img src="${loan.imageUrl}" alt="${loan.bookTitle}" class="loan-book-image" onerror="this.src='https://via.placeholder.com/80x120?text=No+Cover'">
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
        localStorage.removeItem('currentStudent');
        window.location.href = 'login.html';
    }
});
