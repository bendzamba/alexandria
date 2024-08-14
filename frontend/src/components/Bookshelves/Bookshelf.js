import React, { useState, useEffect, useCallback } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import { GetBookshelfBooks, GetBookshelf, DeleteBookshelf, GetBooksNotOnBookshelf, AddBooksToBookshelf, DeleteBookFromBookshelf } from '../../services/bookshelves'
import {confirm} from 'react-bootstrap-confirmation';

function Bookshelf({ bookshelfId = null, preview = false }) {

  const useParamsId = useParams();
  const id = bookshelfId || useParamsId.id;

  const [data, setData] = useState([]);
  const [books, setBooks] = useState([]);
  const [booksToAdd, setBooksToAdd] = useState([]);
  const [booksThatCanBeAdded, setBooksThatCanBeAdded] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      const data = await GetBookshelf(id);
      setData(data);
    } catch (error) {
      console.error('Error fetching bookshelf:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchBooks = useCallback(async () => {
    try {
      // TODO Limit books we fetch depending on preview or not
      const data = await GetBookshelfBooks(id);
      setBooks(data);
    } catch (error) {
      console.error('Error fetching bookshelf books:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
    fetchBooks();
  }, [id, fetchData, fetchBooks]);

  useEffect(() => {
    console.log('Updated booksToAdd:', booksToAdd);
  }, [booksToAdd]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleUpdate = async (e) => {
    e.preventDefault();
    navigate(`/bookshelves/update/` + id);
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    const result = await confirm('Are you sure you want to delete this bookshelf?');
    if (result) {
      await DeleteBookshelf(id);
      navigate(`/`);
    }
  };

  const handleShowModal = async (e) => {
    setShowModal(true);
  };

  const handleCloseModal = async (e) => {
    setShowModal(false);
  };

  const handleSaveChanges = async (e) => {
    if (booksToAdd.length) {
      await AddBooksToBookshelf(id, booksToAdd);
    }
    setShowModal(false);
    fetchBooks();
  };

  const handleDeleteBookFromBookshelf = async (e, bookToDelete) => {
    e.preventDefault();
    const result = await confirm('Are you sure you want to remove this book from this bookshelf?');
    if (result) {
      await DeleteBookFromBookshelf(id, bookToDelete);
      fetchBooks();
    }
  };

  const handleResetBooksToAdd = async (e) => {
    setBooksToAdd([]);
  };

  const fetchBooksThatCanBeAdded = async (e) => {
    const booksThatCanBeAdded = await GetBooksNotOnBookshelf(id);
    setBooksThatCanBeAdded(booksThatCanBeAdded);
  };

  const toggleBookSelection = async (e, bookToToggle) => {
    e.preventDefault();
    e.currentTarget.classList.toggle("border-light");
    e.currentTarget.classList.toggle("border-primary");

    setBooksToAdd((prevBooks) => {
      const isBookInArray = prevBooks.some((book) => book === bookToToggle);
  
      if (isBookInArray) {
        // If the book is already in the array, remove it
        return prevBooks.filter((book) => book !== bookToToggle);
      } else {
        // If the book is not in the array, add it
        return [...prevBooks, bookToToggle];
      }
    });
  };

  return (
    <Container>
        <Row className="mt-4 align-items-center" style={{ 'borderBottom': '3px solid black'}}>
            <Col xs={9}>
            { preview && (
              <NavLink 
                className="nav-link" 
                to={"/bookshelves/" + id}
                >
                  <h1 className="display-6 pull-left">{data.title}</h1>
              </NavLink>
            )}
            { ! preview && (
              <h1 className="display-5 pull-left">{data.title}</h1>
            )}
            </Col>
            { ! preview && (
              <Col xs={3} style={{
                textAlign:"right"
              }}>
                <button type="button" className="btn btn-primary" onClick={handleUpdate}>Update</button>
                <button type="button" className="btn btn-danger ms-1" onClick={handleDelete}>Delete</button>
              </Col>
            )}
        </Row>
        <Row className="mt-2 align-items-center">
          <Col md="auto">
            { preview && (
              <span className="text-secondary">{data.description}</span>
            )}
            { ! preview && (
              <h5 className="text-secondary">{data.description}</h5>
            )}
          </Col>
        </Row>
        <Row className="mt-2">
          { ! preview && (
            <Col md="auto">
              <button type="button" className="btn btn-outline-primary" style={{ 'width': '90px', 'height': '150px' }} onClick={handleShowModal}>+</button>
            </Col>
          )}
          {books.map((book) => (
              <Col md="auto">
                <div class="bookshelf-book-image-wrapper">
                  <img height="150px" src={book.cover_image} alt="Book Cover" /> 
                  { ! preview && (
                    <div class="remove-book-from-bookshelf-button">
                      <button class="btn btn-close" onClick={(event) => {handleDeleteBookFromBookshelf(event, book.id)}}></button>
                    </div>
                  )}
                </div>
              </Col>
            ))}
        </Row>
        <Modal size="lg" contentClassName="add-books-to-bookshelf-modal" show={showModal} onShow={fetchBooksThatCanBeAdded} onHide={handleCloseModal} onExit={handleResetBooksToAdd} centered>
          <Modal.Header closeButton>
            <Modal.Title>Choose one or more book to add</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Container>
              <Row>
                {booksThatCanBeAdded.map((book) => (
                  <Col>
                    <img src={book.cover_image} onClick={(event) => toggleBookSelection(event, book.id)} alt="Book Cover" class="border border-2 border-light" style={{'boxSizing': 'border-box', 'height': '175px', 'padding': '2px'}} /> 
                  </Col>
                ))}
              </Row>
            </Container>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Close
            </Button>
            <Button variant="primary" onClick={handleSaveChanges}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
    </Container>
  );
}

export default Bookshelf;