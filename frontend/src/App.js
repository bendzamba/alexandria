import Container from 'react-bootstrap/Container';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Bookshelves from './components/bookshelves/Bookshelves';
import Bookshelf from './components/bookshelves/Bookshelf';
import CreateBookshelf from './components/bookshelves/CreateBookshelf';
import UpdateBookshelf from './components/bookshelves/UpdateBookshelf';
import Books from './components/books/Books';
import Book from './components/books/Book';
import CreateBook from './components/books/CreateBook';
import Header from './components/common/Header';

function App() {
  return (
    <Router>
      <Container>
        <Header />
        <div className="container mt-4">
          <Routes>
            <Route path="/" element={<Bookshelves />} />
            <Route path="/bookshelves/:id" element={<Bookshelf />} />
            <Route path="/bookshelves/create" element={<CreateBookshelf />} />
            <Route path="/bookshelves/update/:id" element={<UpdateBookshelf />} />
            <Route path="/books/" element={<Books />} />
            <Route path="/books/:id" element={<Book />} />
            <Route path="/books/create" element={<CreateBook />} />
         </Routes>
        </div>
      </Container>
    </Router>
  );
}

export default App;
