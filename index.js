
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Books database
const DATA_FILE = path.join(__dirname, 'data', 'books.json');

function getBooks() {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function saveBooks(books) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(books, null, 2));
}

// Get books
app.get('/api/books', (req, res) => {
    res.json(getBooks());
});

// Add book
app.post('/api/books', (req, res) => {
    const { title, author, category, quantity } = req.body;

    if (
        typeof title !== 'string' || !title.trim() ||
        typeof author !== 'string' || !author.trim() ||
        typeof category !== 'string' || !category.trim() ||
        !Number.isInteger(quantity) || quantity < 0
    ) {
        return res.status(400).json({ message: 'Invalid book details' });
    }

    const books = getBooks();

    const newBook = {
        id: Date.now().toString(),
        title: title.trim(),
        author: author.trim(),
        category: category.trim(),
        quantity
    };

    books.push(newBook);
    saveBooks(books);

    res.status(201).json({
        message: 'Book added successfully',
        book: newBook
    });
});

// Update book
app.put('/api/books/:id', (req, res) => {
    const books = getBooks();

    const index = books.findIndex(
        book => book.id === req.params.id
    );

    if (index === -1) {
        return res.status(404).json({ message: 'Book not found' });
    }

    const { title, author, category, quantity } = req.body;

    if (
        typeof title !== 'string' || !title.trim() ||
        typeof author !== 'string' || !author.trim() ||
        typeof category !== 'string' || !category.trim() ||
        !Number.isInteger(quantity) || quantity < 0
    ) {
        return res.status(400).json({ message: 'Invalid book details' });
    }

    books[index] = {
        ...books[index],
        title: title.trim(),
        author: author.trim(),
        category: category.trim(),
        quantity
    };

    saveBooks(books);

    res.json({ message: 'Book updated successfully' });
});

// Delete book
app.delete('/api/books/:id', (req, res) => {
    const books = getBooks();

    const updatedBooks = books.filter(
        book => book.id !== req.params.id
    );

    if (books.length === updatedBooks.length) {
        return res.status(404).json({ message: 'Book not found' });
    }

    saveBooks(updatedBooks);

    res.json({ message: 'Book deleted successfully' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
