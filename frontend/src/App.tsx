import Container from "react-bootstrap/Container";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Bookshelves from "./components/bookshelves/Bookshelves";
import Bookshelf from "./components/bookshelves/Bookshelf";
import CreateBookshelf from "./components/bookshelves/CreateBookshelf";
import UpdateBookshelf from "./components/bookshelves/UpdateBookshelf";
import Books from "./components/books/Books";
import Book from "./components/books/Book";
import CreateBook from "./components/books/CreateBook";
import Header from "./components/common/Header";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoggedOut from "./components/common/Logout";
import RequireAuth from "./components/common/RequireAuth";
import { configure_amplify } from "./utils/amplify_config";
import { AuthProvider } from "./components/common/AuthProvider";

function App() {
  configure_amplify();
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Container className="mt-4">
          <Routes>
            <Route
              path="/"
              element={
                <RequireAuth>
                  <Bookshelves />
                </RequireAuth>
              }
            />
            <Route path="/logout" element={<LoggedOut />} />
            <Route
              path="/bookshelves/:id"
              element={
                <RequireAuth>
                  <Bookshelf />
                </RequireAuth>
              }
            />
            <Route
              path="/bookshelves/create"
              element={
                <RequireAuth>
                  <CreateBookshelf />
                </RequireAuth>
              }
            />
            <Route
              path="/bookshelves/update/:id"
              element={
                <RequireAuth>
                  <UpdateBookshelf />
                </RequireAuth>
              }
            />
            <Route
              path="/books/"
              element={
                <RequireAuth>
                  <Books />
                </RequireAuth>
              }
            />
            <Route
              path="/books/:id"
              element={
                <RequireAuth>
                  <Book />
                </RequireAuth>
              }
            />
            <Route
              path="/books/create"
              element={
                <RequireAuth>
                  <CreateBook />
                </RequireAuth>
              }
            />
          </Routes>
        </Container>
        <ToastContainer />
      </Router>
    </AuthProvider>
  );
}

export default App;
