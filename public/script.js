
const API_URL = '/api/books';

// HTML elements
const bookForm = document.getElementById('bookForm');
const bookList = document.getElementById('bookList');

const bookId = document.getElementById('bookId');
const title = document.getElementById('title');
const author = document.getElementById('author');
const category = document.getElementById('category');
const quantity = document.getElementById('quantity');

const search = document.getElementById('search');

const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const formTitle = document.getElementById('formTitle');

// Load books from backend
async function loadBooks(searchText = '') {

    try {

        const response = await fetch(
            `${API_URL}?search=${encodeURIComponent(searchText)}`
        );

        if (!response.ok) {
            throw new Error('Unable to load books');
        }

        const books = await response.json();

        displayBooks(books);

    } catch (error) {

        console.error(error);

        bookList.innerHTML =
            '<tr><td colspan="7">Unable to load books. Please try again.</td></tr>';

    }
}

// Display books
function displayBooks(books) {

    bookList.replaceChildren();

    if (books.length === 0) {

        bookList.innerHTML =
            '<tr><td colspan="7">No books found</td></tr>';

        return;
    }

    books.forEach((book, index) => {

        const row = document.createElement('tr');

        const values = [
            index + 1,
            book.title,
            book.author,
            book.category,
            book.quantity
        ];

        values.forEach(value => {

            const cell = document.createElement('td');

            cell.textContent = value;

            row.appendChild(cell);

        });

        // Availability status
        const statusCell = document.createElement('td');

        statusCell.textContent =
            book.quantity > 0 ? 'Available' : 'Out of stock';

        statusCell.className =
            book.quantity > 0 ? 'available' : 'unavailable';

        row.appendChild(statusCell);

        // Action buttons
        const actionCell = document.createElement('td');

        const editButton = document.createElement('button');

        editButton.textContent = 'Edit';
        editButton.className = 'edit-btn';

        editButton.addEventListener('click', () => {
            editBook(book);
        });

        const deleteButton = document.createElement('button');

        deleteButton.textContent = 'Delete';
        deleteButton.className = 'delete-btn';

        deleteButton.addEventListener('click', () => {
            deleteBook(book.id);
        });

        actionCell.append(editButton, deleteButton);

        row.appendChild(actionCell);

        bookList.appendChild(row);

    });

}

// Update dashboard statistics
async function updateDashboard() {

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error('Unable to update dashboard');
        }

        const books = await response.json();

        const totalBooks = books.length;

        const totalQuantity = books.reduce(
            (total, book) => total + book.quantity,
            0
        );

        const categories = new Set(
            books.map(book => book.category.toLowerCase())
        );

        document.getElementById('totalBooks').textContent = totalBooks;

        document.getElementById('totalQuantity').textContent =
            totalQuantity;

        document.getElementById('totalCategories').textContent =
            categories.size;

    } catch (error) {

        console.error(error);

    }

}

// Add or update book
bookForm.addEventListener('submit', async (event) => {

    event.preventDefault();

    const book = {

        title: title.value.trim(),

        author: author.value.trim(),

        category: category.value.trim(),

        quantity: Number(quantity.value)

    };

    const id = bookId.value;

    const url = id
        ? `${API_URL}/${encodeURIComponent(id)}`
        : API_URL;

    const method = id ? 'PUT' : 'POST';

    try {

        const response = await fetch(url, {

            method: method,

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify(book)

        });

        const result = await response.json();

        if (!response.ok) {

            throw new Error(result.message || 'Something went wrong');

        }

        alert(result.message);

        resetForm();

        await refreshBooks();

    } catch (error) {

        alert(error.message);

    }

});

// Edit book
function editBook(book) {

    bookId.value = book.id;

    title.value = book.title;

    author.value = book.author;

    category.value = book.category;

    quantity.value = book.quantity;

    formTitle.textContent = 'Update Book';

    submitBtn.textContent = 'Update Book';

    cancelBtn.hidden = false;

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });

}

// Delete book
async function deleteBook(id) {

    const confirmDelete = confirm(
        'Are you sure you want to delete this book?'
    );

    if (!confirmDelete) {
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/${encodeURIComponent(id)}`,
            {
                method: 'DELETE'
            }
        );

        const result = await response.json();

        if (!response.ok) {

            throw new Error(result.message || 'Unable to delete book');

        }

        alert(result.message);

        await refreshBooks();

    } catch (error) {

        alert(error.message);

    }

}

// Reset form
function resetForm() {

    bookForm.reset();

    bookId.value = '';

    formTitle.textContent = 'Add New Book';

    submitBtn.textContent = 'Add Book';

    cancelBtn.hidden = true;

}

// Cancel edit
cancelBtn.addEventListener('click', resetForm);

// Search books
search.addEventListener('input', () => {

    loadBooks(search.value);

});

// Refresh book list and dashboard
async function refreshBooks() {

    await loadBooks(search.value);

    await updateDashboard();

}

// Initial application load
refreshBooks();
