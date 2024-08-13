import React, { useState, useEffect } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import { GetBookshelfBooks, GetBookshelf } from '../../services/bookshelves'

function Bookshelf({ bookshelfId = null, preview = false }) {

  const useParamsId = useParams();
  const id = bookshelfId || useParamsId.id;

  const [data, setData] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
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
    // navigate(`/bookshelves/update/{id}`);
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
                {/* <NavLink 
                  className="nav-link" 
                  to={"/bookshelves/update/" + id}
                  >
                    Update Bookshelf
                </NavLink> */}
              </Col>
            )}
        </Row>
        <Row>
          <Col md="auto">
              <span className="text-secondary">{data.description}</span>
          </Col>
        </Row>
        <Row className="mt-2">
            {books.slice(0, 5).map((book) => (
                <Col md="auto">
                    <img height="150px" src={book.cover_image} alt="Book Cover" /> 
                </Col>
            ))}
        </Row>
    </Container>
  );
}

export default Bookshelf;