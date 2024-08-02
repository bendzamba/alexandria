import Container from 'react-bootstrap/Container';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Bookshelves from './components/bookshelves/Bookshelves';
import CreateBookshelf from './components/bookshelves/CreateBookshelf';
import UpdateBookshelf from './components/bookshelves/UpdateBookshelf';
import Header from './components/common/Header';

function App() {
  return (
    <Router>
      <Container>
        <Header />
        <div className="container mt-4">
          <Routes>
            <Route path="/" element={<Bookshelves />} />
            <Route path="/bookshelves/create" element={<CreateBookshelf />} />
            <Route path="/bookshelves/update/:id" element={<UpdateBookshelf />} />
          </Routes>
        </div>
      </Container>
    </Router>
  );
}

export default App;
