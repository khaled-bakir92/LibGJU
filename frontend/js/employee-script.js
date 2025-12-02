// API Base URL
const API_BASE = 'http://localhost/Projekt/backend/api';

// Data arrays (will be loaded from database)
let booksData = [];
let studentsData = [];
let loansData = [];
let activityLog = [];

// Current editing IDs
let editingBookId = null;
let editingStudentId = null;

// DOM Elements
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const logoutBtn = document.querySelector('.logout-btn');

// Books Management
const addBookBtn = document.getElementById('add-book-btn');
const bookModal = document.getElementById('book-modal');
const bookForm = document.getElementById('book-form');
const bookModalTitle = document.getElementById('book-modal-title');
const booksTableBody = document.getElementById('books-table-body');

// Students Management
const addStudentBtn = document.getElementById('add-student-btn');
const studentModal = document.getElementById('student-modal');
const studentForm = document.getElementById('student-form');
const studentModalTitle = document.getElementById('student-modal-title');
const studentsTableBody = document.getElementById('students-table-body');

// Loans Management
const loansTableBody = document.getElementById('loans-table-body');
const statusFilter = document.getElementById('status-filter');
const searchLoan = document.getElementById('search-loan');

// Close buttons
const closeBtns = document.querySelectorAll('.close-btn');
const cancelBtns = document.querySelectorAll('.cancel-btn');

// Initialize - Load data from database
document.addEventListener('DOMContentLoaded', function () {
    loadAllData();
});

// Load all data from backend
async function loadAllData() {
    try {
        await Promise.all([
            loadBooks(),
            loadStudents(),
            loadLoans(),
            loadActivities(),
            loadStats()
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
                id: parseInt(book.id),
                title: book.title,
                author: book.author,
                isbn: book.isbn,
                status: book.status,
                description: book.description,
                imageUrl: book.image_url
            }));
            renderBooksTable();
        }
    } catch (error) {
        console.error('Error loading books:', error);
    }
}

// Load Students
async function loadStudents() {
    try {
        const response = await fetch(`${API_BASE}/users.php`);
        const data = await response.json();
        if (data.success) {
            studentsData = data.data.map(user => ({
                id: parseInt(user.id),
                studentId: user.student_id,
                name: user.name,
                email: user.email,
                password: user.password || '',
                activeLoans: user.active_loans
            }));
            renderStudentsTable();
        }
    } catch (error) {
        console.error('Error loading students:', error);
    }
}

// Load Loans
async function loadLoans() {
    try {
        const response = await fetch(`${API_BASE}/loans.php`);
        const data = await response.json();
        if (data.success) {
            loansData = data.data.map(loan => ({
                id: parseInt(loan.id),
                bookId: parseInt(loan.book_id),
                bookTitle: loan.book_title,
                studentId: loan.student_id,
                studentName: loan.student_name,
                borrowDate: loan.borrow_date,
                dueDate: loan.due_date,
                status: loan.status,
                imageUrl: loan.image_url
            }));
            renderLoansTable();
        }
    } catch (error) {
        console.error('Error loading loans:', error);
    }
}

// Load Activities
async function loadActivities() {
    try {
        const response = await fetch(`${API_BASE}/activity.php`);
        const data = await response.json();
        if (data.success) {
            activityLog = data.data;
            renderDashboard();
        }
    } catch (error) {
        console.error('Error loading activities:', error);
    }
}

// Load Statistics
async function loadStats() {
    try {
        const response = await fetch(`${API_BASE}/stats.php`);
        const data = await response.json();
        if (data.success) {
            const stats = data.data;
            document.getElementById('total-books').textContent = stats.totalBooks;
            document.getElementById('available-books').textContent = stats.availableBooks;
            document.getElementById('total-students').textContent = stats.totalStudents;
            document.getElementById('active-loans').textContent = stats.activeLoans;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Tab Switching
tabBtns.forEach(btn => {
    btn.addEventListener('click', function () {
        const tabName = this.getAttribute('data-tab');

        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        this.classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
    });
});

// ==================== DASHBOARD ====================
function renderDashboard() {
    // Render activity log
    const activityList = document.getElementById('activity-list');
    activityList.innerHTML = '';

    if (activityLog.length === 0) {
        activityList.innerHTML = '<p style="text-align: center; color: #666;">No recent activity.</p>';
        return;
    }

    activityLog.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <span class="activity-text">${activity.text}</span>
            <span class="activity-time">${activity.time}</span>
        `;
        activityList.appendChild(activityItem);
    });
}

// ==================== BOOKS MANAGEMENT ====================
function renderBooksTable() {
    booksTableBody.innerHTML = '';

    booksData.forEach(book => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${book.imageUrl}" alt="${book.title}" class="book-cover-small" onerror="this.src='https://via.placeholder.com/40x60?text=No+Cover'"></td>
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.isbn}</td>
            <td><span class="status-badge ${book.status}">${book.status === 'available' ? 'Available' : 'Borrowed'}</span></td>
            <td>
                <button class="action-btn edit-btn" onclick="editBook(${book.id})">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteBook(${book.id})">Delete</button>
            </td>
        `;
        booksTableBody.appendChild(row);
    });
}

// Open Add Book Modal
addBookBtn.addEventListener('click', () => {
    editingBookId = null;
    bookModalTitle.textContent = 'Add New Book';
    bookForm.reset();
    bookModal.classList.add('active');
});

// Edit Book
window.editBook = function (bookId) {
    const book = booksData.find(b => b.id === bookId);
    if (!book) return;

    editingBookId = bookId;
    bookModalTitle.textContent = 'Edit Book';

    document.getElementById('book-title').value = book.title;
    document.getElementById('book-author').value = book.author;
    document.getElementById('book-isbn').value = book.isbn;
    document.getElementById('book-description').value = book.description;
    document.getElementById('book-image').value = book.imageUrl;

    bookModal.classList.add('active');
}

// Delete Book
window.deleteBook = async function (bookId) {
    if (!confirm('Are you sure you want to delete this book?')) return;

    try {
        const response = await fetch(`${API_BASE}/books.php`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: bookId })
        });

        const data = await response.json();

        if (data.success) {
            alert('Book deleted successfully');
            await loadAllData();
        } else {
            alert(data.message || 'Error deleting book');
        }
    } catch (error) {
        console.error('Error deleting book:', error);
        alert('Error deleting book');
    }
}

// Save Book (Add or Edit)
bookForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('book-title').value.trim();
    const author = document.getElementById('book-author').value.trim();
    const isbn = document.getElementById('book-isbn').value.trim();
    const description = document.getElementById('book-description').value.trim();
    let imageUrl = document.getElementById('book-image').value.trim();

    // Auto-generate image URL from ISBN if not provided
    if (!imageUrl) {
        imageUrl = `https://covers.openlibrary.org/b/isbn/${isbn.replace(/-/g, '')}-M.jpg`;
    }

    const bookData = {
        title,
        author,
        isbn,
        description,
        imageUrl
    };

    try {
        let response;
        if (editingBookId) {
            // Edit existing book
            bookData.id = editingBookId;
            response = await fetch(`${API_BASE}/books.php`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bookData)
            });
        } else {
            // Add new book
            response = await fetch(`${API_BASE}/books.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bookData)
            });
        }

        const data = await response.json();

        if (data.success) {
            alert(editingBookId ? 'Book updated successfully' : 'Book added successfully');
            bookModal.classList.remove('active');
            bookForm.reset();
            await loadAllData();
        } else {
            alert(data.message || 'Error saving book');
        }
    } catch (error) {
        console.error('Error saving book:', error);
        alert('Error saving book');
    }
});

// ==================== STUDENTS MANAGEMENT ====================
function renderStudentsTable() {
    studentsTableBody.innerHTML = '';

    studentsData.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.studentId}</td>
            <td>${student.name}</td>
            <td>${student.email}</td>
            <td>${student.activeLoans}</td>
            <td>
                <button class="action-btn edit-btn" onclick="editStudent(${student.id})">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteStudent(${student.id})">Delete</button>
            </td>
        `;
        studentsTableBody.appendChild(row);
    });
}

// Open Add Student Modal
addStudentBtn.addEventListener('click', () => {
    editingStudentId = null;
    studentModalTitle.textContent = 'Add New Student';
    studentForm.reset();
    studentModal.classList.add('active');
});

// Edit Student
window.editStudent = function (studentId) {
    const student = studentsData.find(s => s.id === studentId);
    if (!student) return;

    editingStudentId = studentId;
    studentModalTitle.textContent = 'Edit Student';

    document.getElementById('student-id').value = student.studentId;
    document.getElementById('student-name').value = student.name;
    document.getElementById('student-email').value = student.email;
    document.getElementById('student-password').value = student.password;

    studentModal.classList.add('active');
}

// Delete Student
window.deleteStudent = async function (studentId) {
    const student = studentsData.find(s => s.id === studentId);
    if (!student) return;

    if (!confirm(`Are you sure you want to delete student ${student.name}?`)) return;

    try {
        const response = await fetch(`${API_BASE}/users.php`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: studentId })
        });

        const data = await response.json();

        if (data.success) {
            alert('Student deleted successfully');
            await loadAllData();
        } else {
            alert(data.message || 'Error deleting student');
        }
    } catch (error) {
        console.error('Error deleting student:', error);
        alert('Error deleting student');
    }
}

// Save Student (Add or Edit)
studentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const studentId = document.getElementById('student-id').value.trim();
    const name = document.getElementById('student-name').value.trim();
    const email = document.getElementById('student-email').value.trim();
    const password = document.getElementById('student-password').value.trim();

    const studentData = {
        name,
        email,
        password
    };

    try {
        let response;
        if (editingStudentId) {
            // Edit existing student
            studentData.id = editingStudentId;
            studentData.studentId = studentId; // Include student_id for update
            response = await fetch(`${API_BASE}/users.php`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(studentData)
            });
        } else {
            // Add new student
            studentData.studentId = studentId;
            response = await fetch(`${API_BASE}/users.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(studentData)
            });
        }

        const data = await response.json();

        if (data.success) {
            alert(editingStudentId ? 'Student updated successfully' : 'Student added successfully');
            studentModal.classList.remove('active');
            studentForm.reset();
            await loadAllData();
        } else {
            alert(data.message || 'Error saving student');
        }
    } catch (error) {
        console.error('Error saving student:', error);
        alert('Error saving student');
    }
});

// ==================== LOANS MANAGEMENT ====================
function renderLoansTable(filter = 'all', searchTerm = '') {
    loansTableBody.innerHTML = '';

    let filteredLoans = loansData.filter(loan => loan.status !== 'returned');

    // Apply status filter
    if (filter !== 'all') {
        filteredLoans = filteredLoans.filter(loan => loan.status === filter);
    }

    // Apply search filter
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredLoans = filteredLoans.filter(loan =>
            loan.bookTitle.toLowerCase().includes(term) ||
            loan.studentName.toLowerCase().includes(term) ||
            loan.studentId.toLowerCase().includes(term)
        );
    }

    if (filteredLoans.length === 0) {
        loansTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #666;">No loans found.</td></tr>';
        return;
    }

    filteredLoans.forEach(loan => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${loan.bookTitle}</td>
            <td>${loan.studentName} (${loan.studentId})</td>
            <td>${formatDate(loan.borrowDate)}</td>
            <td>${formatDate(loan.dueDate)}</td>
            <td><span class="status-badge ${loan.status}">${loan.status === 'active' ? 'Active' : 'Overdue'}</span></td>
            <td>
                <button class="action-btn return-btn" onclick="returnBook(${loan.id})">Return</button>
            </td>
        `;
        loansTableBody.appendChild(row);
    });
}

// Return Book
window.returnBook = async function (loanId) {
    const loan = loansData.find(l => l.id === loanId);
    if (!loan) return;

    if (!confirm(`Mark book '${loan.bookTitle}' as returned?`)) return;

    try {
        const response = await fetch(`${API_BASE}/loans.php`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ loanId: loanId })
        });

        const data = await response.json();

        if (data.success) {
            alert('Book returned successfully');
            await loadAllData();
        } else {
            alert(data.message || 'Error returning book');
        }
    } catch (error) {
        console.error('Error returning book:', error);
        alert('Error returning book');
    }
}

// Loan Filters
statusFilter.addEventListener('change', () => {
    renderLoansTable(statusFilter.value, searchLoan.value);
});

searchLoan.addEventListener('input', () => {
    renderLoansTable(statusFilter.value, searchLoan.value);
});

// ==================== UTILITY FUNCTIONS ====================
function formatDate(dateString) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// ==================== MODAL CONTROLS ====================
closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const modalId = btn.getAttribute('data-modal');
        document.getElementById(modalId).classList.remove('active');
    });
});

cancelBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const modalId = btn.getAttribute('data-modal');
        document.getElementById(modalId).classList.remove('active');
    });
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// Logout
logoutBtn.addEventListener('click', () => {
    if (confirm('Do you really want to log out?')) {
        window.location.href = 'login.html';
    }
});
