import React, { useState, useEffect } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import { NavLink, useParams } from 'react-router-dom';
import { GetBookshelfBooks, GetBookshelf } from '../../services/bookshelves'

function Bookshelf({ bookshelfId = null, preview = false }) {

  const useParamsId = useParams();
  const id = bookshelfId || useParamsId.id;

  const [data, setData] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <Container>
        <Row className="mt-4 align-items-center" style={{ 'borderBottom': '3px solid black' }}>
            <Col md="auto">
              <NavLink 
                className="nav-link" 
                to={"/bookshelves/" + id}
                >
                  <span className="h4 pull-left">{data.title}</span>
              </NavLink>
            </Col>
            <Col md="auto" style={{
              textAlign:"right"
            }}>
              <span className="text-secondary">{data.description}</span>
            </Col>
            { ! preview && (
              <Col md="auto" style={{
                textAlign:"right"
              }}>
                <NavLink 
                  className="nav-link" 
                  to={"/bookshelves/update/" + id}
                  >
                    Update Bookshelf
                </NavLink>
              </Col>
            )}
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