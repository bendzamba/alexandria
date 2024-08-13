import React, { useState, useEffect } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import { GetBookshelfBooks, GetBookshelf, DeleteBookshelf } from '../../services/bookshelves'
import {confirm} from 'react-bootstrap-confirmation';

function Bookshelf({ bookshelfId = null, preview = false }) {

  const useParamsId = useParams();
  const id = bookshelfId || useParamsId.id;

  const [data, setData] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await GetBookshelf(id);
        setData(data);
      } catch (error) {
        console.error('Error fetching bookshelf:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchBooks = async () => {
      try {
        const data = await GetBookshelfBooks(id);
        setBooks(data);
      } catch (error) {
        console.error('Error fetching bookshelf books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    fetchBooks();
  }, [id]);

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
    console.log('closing modal');
    setShowModal(false);
  };

  return (
    <Container>
        <Row className="mt-4 align-items-center" style={{ 'borderBottom': '3px solid black'}}>
            <Col xs={9}>
              <NavLink 
                className="nav-link" 
                to={"/bookshelves/" + id}
                >
                  <span className="h4 pull-left">{data.title}</span>
              </NavLink>
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
        <Row>
          <Col md="auto">
              <span className="text-secondary">{data.description}</span>
          </Col>
        </Row>
        <Row className="mt-2">
          { ! preview && (
            <Col md="auto">
              <button type="button" className="btn btn-outline-primary" style={{ 'width': '90px', 'height': '150px' }} onClick={handleShowModal}>+</button>
            </Col>
          )}
            {books.slice(0, 5).map((book) => (
                <Col md="auto">
                    <img height="150px" src={book.cover_image} alt="Book Cover" /> 
                </Col>
            ))}
        </Row>
        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Modal heading</Modal.Title>
          </Modal.Header>
          <Modal.Body>Woohoo, you are reading this text in a modal!</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Close
            </Button>
            <Button variant="primary" onClick={handleCloseModal}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
    </Container>
  );
}

export default Bookshelf;