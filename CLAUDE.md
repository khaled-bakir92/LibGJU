# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MyGJU is a library management system for the German Jordanian University (GJU). This is a frontend-only application built with vanilla HTML, CSS, and JavaScript. The project simulates a library portal with authentication and book borrowing functionality.

## Application Architecture

### Multi-Page Structure

The application consists of two main pages with distinct purposes:

1. **Login Page** (`login.html` + `script.js` + `styles.css`)
   - Entry point for both students and employees
   - Two separate login buttons route to different portals
   - Currently redirects students to `student.html`
   - Employee portal not yet implemented (shows alert)

2. **Student Portal** (`student.html` + `student-script.js` + `student-styles.css`)
   - Inherits base styles from `styles.css`
   - Adds portal-specific styles from `student-styles.css`
   - Tab-based interface with two main sections

### Shared Design System

Both pages share:
- Common header with MyGJU and GJU logos
- Left-side decorative background image (`Img/GJU-left-bg.png`)
- Main container with shadow and white background
- Footer with copyright and branding
- Responsive design breakpoints at 1200px, 768px, and 480px

Key: Always maintain this consistent layout structure when adding new pages (e.g., employee portal).

### Student Portal Architecture

**Tab System:**
- "Book List" tab: Browse, search, and view book details
- "My Loans" tab: View borrowed books with due dates

**Data Flow:**
- `booksData`: Array of book objects (id, title, author, isbn, status, description, imageUrl)
- `loansData`: Array of loan objects (id, bookId, bookTitle, borrowDate, dueDate, status)
- Book images fetched from Open Library API using ISBN: `https://covers.openlibrary.org/b/isbn/{ISBN}-M.jpg`
- Fallback to placeholder images if covers unavailable

**Key Features:**
- Pagination: 6 books per page
- Search: Client-side filtering by title, author, or ISBN
- Modal system: Click book card to view details and borrow
- Dynamic borrowing: Updates both `booksData` status and adds to `loansData`

## Language Considerations

The codebase has mixed language elements:
- **UI Text**: English (recently translated from German)
- **Alert Messages in script.js**: Some still in German (script.js:53, 59, 73)
- **Comments**: Mix of English and German

When adding new features: Use English for all UI text and maintain consistency with the student portal.

## Styling Architecture

**CSS Cascade:**
1. `styles.css` - Base styles shared across all pages (header, footer, main-container, form elements)
2. `student-styles.css` - Portal-specific styles (tabs, books-list, modal, user-info-bar)

**Important CSS Classes:**
- `.book-card`: Grid layout with book image (150x200px) + info
- `.loan-card`: Flexbox with small image (80x120px) + loan details + status badge
- `.modal`: Overlay with book details, uses flexbox for image (200x300px) + info
- `.user-info-bar`: Appears below header, contains welcome message + logout button

When styling new components: Reuse existing patterns from student portal (cards, modals, status badges).

## State Management

All state is client-side in-memory:
- No backend integration (see TODO at script.js:77)
- `loansData` and `booksData` reset on page reload
- When a book is borrowed:
  1. Book status changes from "available" to "unavailable" in `booksData`
  2. New entry added to `loansData` with bookId, due date (14 days from borrow)
  3. Both book list and loans list re-render

## Key Implementation Patterns

**Dynamic Rendering:**
- Books and loans are rendered dynamically via `renderBooks()` and `renderLoans()`
- Always call these functions after data mutations
- DOM elements are recreated from scratch (no incremental updates)

**Modal Pattern:**
- `showBookDetail(book)` populates modal and adds `.active` class
- Close via X button or clicking outside modal
- `borrowBook(id)` is called via inline onclick in modal HTML

**Image Handling:**
- All book images include `onerror` handlers for graceful fallback
- Example: `onerror="this.src='https://via.placeholder.com/150x200?text=No+Cover'"`
- When adding new image features, always include fallback

## Future Implementation Notes

**Employee Portal (TODO):**
- Should follow same layout structure as student portal
- Create: `employee.html`, `employee-script.js`, `employee-styles.css`
- Uncomment redirect at script.js:74
- Likely features: Add/edit books, manage loans, view all students

**Backend Integration (TODO at script.js:77):**
- Current authentication is cosmetic (no validation)
- Will need API calls for: login, fetch books, borrow/return books
- Consider maintaining same data structures for easy migration

## Running the Application

This is a static HTML application. To run:
- Open `login.html` in a web browser, or
- Use a local server: `python -m http.server 8000` or `npx serve`

No build process required.
