// Sample Books Data (shared with student portal)
let booksData = [
    { id: 1, title: "Introduction to Algorithms", author: "Thomas H. Cormen", isbn: "978-0262033848", status: "available", description: "A comprehensive introduction to the modern study of computer algorithms.", imageUrl: "https://covers.openlibrary.org/b/isbn/9780262033848-M.jpg" },
    { id: 2, title: "Clean Code", author: "Robert C. Martin", isbn: "978-0132350884", status: "unavailable", description: "A handbook of agile software craftsmanship.", imageUrl: "https://covers.openlibrary.org/b/isbn/9780132350884-M.jpg" },
    { id: 3, title: "Design Patterns", author: "Erich Gamma", isbn: "978-0201633610", status: "unavailable", description: "Elements of reusable object-oriented software.", imageUrl: "https://covers.openlibrary.org/b/isbn/9780201633610-M.jpg" },
    { id: 4, title: "The Pragmatic Programmer", author: "Andrew Hunt", isbn: "978-0135957059", status: "unavailable", description: "Your journey to mastery.", imageUrl: "https://covers.openlibrary.org/b/isbn/9780135957059-M.jpg" },
    { id: 5, title: "Structure and Interpretation of Computer Programs", author: "Harold Abelson", isbn: "978-0262510871", status: "available", description: "A classic text in computer science.", imageUrl: "https://covers.openlibrary.org/b/isbn/9780262510871-M.jpg" },
    { id: 6, title: "Code Complete", author: "Steve McConnell", isbn: "978-0735619678", status: "unavailable", description: "A practical handbook of software construction.", imageUrl: "https://covers.openlibrary.org/b/isbn/9780735619678-M.jpg" },
    { id: 7, title: "Refactoring", author: "Martin Fowler", isbn: "978-0134757599", status: "available", description: "Improving the design of existing code.", imageUrl: "https://covers.openlibrary.org/b/isbn/9780134757599-M.jpg" },
    { id: 8, title: "Head First Design Patterns", author: "Eric Freeman", isbn: "978-0596007126", status: "available", description: "A brain-friendly guide to design patterns.", imageUrl: "https://covers.openlibrary.org/b/isbn/9780596007126-M.jpg" },
    { id: 9, title: "JavaScript: The Good Parts", author: "Douglas Crockford", isbn: "978-0596517748", status: "available", description: "Unearthing the excellence in JavaScript.", imageUrl: "https://covers.openlibrary.org/b/isbn/9780596517748-M.jpg" },
    { id: 10, title: "You Don't Know JS", author: "Kyle Simpson", isbn: "978-1491950357", status: "unavailable", description: "Deep dive into JavaScript.", imageUrl: "https://covers.openlibrary.org/b/isbn/9781491950357-M.jpg" },
    { id: 11, title: "Eloquent JavaScript", author: "Marijn Haverbeke", isbn: "978-1593279509", status: "available", description: "A modern introduction to programming.", imageUrl: "https://covers.openlibrary.org/b/isbn/9781593279509-M.jpg" },
    { id: 12, title: "Python Crash Course", author: "Eric Matthes", isbn: "978-1593279288", status: "available", description: "A hands-on, project-based introduction to programming.", imageUrl: "https://covers.openlibrary.org/b/isbn/9781593279288-M.jpg" }
];

// Sample Students Data
let studentsData = [
    { id: 1, studentId: "S001", name: "John Doe", email: "john.doe@gju.edu.jo", password: "pass123", activeLoans: 2 },
    { id: 2, studentId: "S002", name: "Jane Smith", email: "jane.smith@gju.edu.jo", password: "pass123", activeLoans: 1 },
    { id: 3, studentId: "S003", name: "Ali Hassan", email: "ali.hassan@gju.edu.jo", password: "pass123", activeLoans: 0 },
    { id: 4, studentId: "S004", name: "Sara Ahmed", email: "sara.ahmed@gju.edu.jo", password: "pass123", activeLoans: 1 }
];

// Sample Loans Data
let loansData = [
    { id: 1, bookId: 2, bookTitle: "Clean Code", studentId: "S001", studentName: "John Doe", borrowDate: "2025-01-05", dueDate: "2025-01-19", status: "active" },
    { id: 2, bookId: 4, bookTitle: "The Pragmatic Programmer", studentId: "S001", studentName: "John Doe", borrowDate: "2025-01-01", dueDate: "2025-01-15", status: "overdue" },
    { id: 3, bookId: 3, bookTitle: "Design Patterns", studentId: "S002", studentName: "Jane Smith", borrowDate: "2025-01-10", dueDate: "2025-01-24", status: "active" },
    { id: 4, bookId: 6, bookTitle: "Code Complete", studentId: "S004", studentName: "Sara Ahmed", borrowDate: "2024-12-20", dueDate: "2025-01-03", status: "overdue" },
    { id: 5, bookId: 10, bookTitle: "You Don't Know JS", studentId: "S002", studentName: "Jane Smith", borrowDate: "2025-01-08", dueDate: "2025-01-22", status: "active" }
];

// Activity Log
let activityLog = [
    { text: "John Doe borrowed 'The Pragmatic Programmer'", time: "2 hours ago" },
    { text: "New book 'Clean Code' added to library", time: "5 hours ago" },
    { text: "Sara Ahmed returned 'Design Patterns'", time: "1 day ago" },
    { text: "New student 'Ali Hassan' registered", time: "2 days ago" }
];

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

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    renderDashboard();
    renderBooksTable();
    renderStudentsTable();
    renderLoansTable();
});

// Tab Switching
tabBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        const tabName = this.getAttribute('data-tab');

        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        this.classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
    });
});

// ==================== DASHBOARD ====================
function renderDashboard() {
    // Update statistics
    document.getElementById('total-books').textContent = booksData.length;
    document.getElementById('available-books').textContent = booksData.filter(b => b.status === 'available').length;
    document.getElementById('total-students').textContent = studentsData.length;
    document.getElementById('active-loans').textContent = loansData.filter(l => l.status === 'active' || l.status === 'overdue').length;

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
function editBook(bookId) {
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
function deleteBook(bookId) {
    if (!confirm('Are you sure you want to delete this book?')) return;

    // Check if book is borrowed
    const isLoanActive = loansData.some(loan => loan.bookId === bookId && (loan.status === 'active' || loan.status === 'overdue'));
    if (isLoanActive) {
        alert('Cannot delete book. It is currently borrowed.');
        return;
    }

    booksData = booksData.filter(b => b.id !== bookId);
    renderBooksTable();
    renderDashboard();
    addActivity(`Book deleted from library`);
}

// Save Book (Add or Edit)
bookForm.addEventListener('submit', (e) => {
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

    if (editingBookId) {
        // Edit existing book
        const book = booksData.find(b => b.id === editingBookId);
        if (book) {
            book.title = title;
            book.author = author;
            book.isbn = isbn;
            book.description = description;
            book.imageUrl = imageUrl;
            addActivity(`Book '${title}' updated`);
        }
    } else {
        // Add new book
        const newId = booksData.length > 0 ? Math.max(...booksData.map(b => b.id)) + 1 : 1;
        booksData.push({
            id: newId,
            title,
            author,
            isbn,
            status: 'available',
            description,
            imageUrl
        });
        addActivity(`New book '${title}' added to library`);
    }

    renderBooksTable();
    renderDashboard();
    bookModal.classList.remove('active');
    bookForm.reset();
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
function editStudent(studentId) {
    const student = studentsData.find(s => s.id === studentId);
    if (!student) return;

    editingStudentId = studentId;
    studentModalTitle.textContent = 'Edit Student';

    document.getElementById('student-id').value = student.studentId;
    document.getElementById('student-name').value = student.name;
    document.getElementById('student-email').value = student.email;
    document.getElementById('student-password').value = student.password;

    // Disable student ID field when editing
    document.getElementById('student-id').disabled = true;

    studentModal.classList.add('active');
}

// Delete Student
function deleteStudent(studentId) {
    const student = studentsData.find(s => s.id === studentId);
    if (!student) return;

    if (!confirm(`Are you sure you want to delete student ${student.name}?`)) return;

    // Check if student has active loans
    if (student.activeLoans > 0) {
        alert('Cannot delete student. They have active loans.');
        return;
    }

    studentsData = studentsData.filter(s => s.id !== studentId);
    renderStudentsTable();
    renderDashboard();
    addActivity(`Student '${student.name}' deleted`);
}

// Save Student (Add or Edit)
studentForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const studentId = document.getElementById('student-id').value.trim();
    const name = document.getElementById('student-name').value.trim();
    const email = document.getElementById('student-email').value.trim();
    const password = document.getElementById('student-password').value.trim();

    if (editingStudentId) {
        // Edit existing student
        const student = studentsData.find(s => s.id === editingStudentId);
        if (student) {
            student.name = name;
            student.email = email;
            student.password = password;
            addActivity(`Student '${name}' updated`);
        }
        // Re-enable student ID field
        document.getElementById('student-id').disabled = false;
    } else {
        // Check if student ID already exists
        if (studentsData.some(s => s.studentId === studentId)) {
            alert('Student ID already exists!');
            return;
        }

        // Add new student
        const newId = studentsData.length > 0 ? Math.max(...studentsData.map(s => s.id)) + 1 : 1;
        studentsData.push({
            id: newId,
            studentId,
            name,
            email,
            password,
            activeLoans: 0
        });
        addActivity(`New student '${name}' registered`);
    }

    renderStudentsTable();
    renderDashboard();
    studentModal.classList.remove('active');
    studentForm.reset();
});

// ==================== LOANS MANAGEMENT ====================
function renderLoansTable(filter = 'all', searchTerm = '') {
    loansTableBody.innerHTML = '';

    let filteredLoans = loansData;

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
function returnBook(loanId) {
    const loan = loansData.find(l => l.id === loanId);
    if (!loan) return;

    if (!confirm(`Mark book '${loan.bookTitle}' as returned?`)) return;

    // Update book status
    const book = booksData.find(b => b.id === loan.bookId);
    if (book) {
        book.status = 'available';
    }

    // Update student active loans count
    const student = studentsData.find(s => s.studentId === loan.studentId);
    if (student && student.activeLoans > 0) {
        student.activeLoans--;
    }

    // Remove loan from list
    loansData = loansData.filter(l => l.id !== loanId);

    renderLoansTable();
    renderBooksTable();
    renderStudentsTable();
    renderDashboard();
    addActivity(`${loan.studentName} returned '${loan.bookTitle}'`);
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

function addActivity(text) {
    activityLog.unshift({
        text: text,
        time: 'Just now'
    });
    // Keep only last 10 activities
    if (activityLog.length > 10) {
        activityLog = activityLog.slice(0, 10);
    }
    renderDashboard();
}

// ==================== MODAL CONTROLS ====================
closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const modalId = btn.getAttribute('data-modal');
        document.getElementById(modalId).classList.remove('active');
        // Re-enable student ID field if it was disabled
        if (modalId === 'student-modal') {
            document.getElementById('student-id').disabled = false;
        }
    });
});

cancelBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const modalId = btn.getAttribute('data-modal');
        document.getElementById(modalId).classList.remove('active');
        // Re-enable student ID field if it was disabled
        if (modalId === 'student-modal') {
            document.getElementById('student-id').disabled = false;
        }
    });
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
        document.getElementById('student-id').disabled = false;
    }
});

// Logout
logoutBtn.addEventListener('click', () => {
    if (confirm('Do you really want to log out?')) {
        window.location.href = 'login.html';
    }
});
