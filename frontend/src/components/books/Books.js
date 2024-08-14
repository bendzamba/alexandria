import React, { useState, useEffect } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Book from './Book';
import { GetBooks } from '../../services/books'

function Books() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await GetBooks();
        setBooks(data);
      } catch (error) {
        console.error('Error fetching books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Container>
      <Row>
        {books.map((book) => (
          <Col xs={4} className="mt-3 mb-3">
            <Book
              bookId={book.id}
              preview={true}
            />
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default Books;
