import React, { useState, useEffect } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { GetBookshelfBooks } from '../../services/api'

function Bookshelf({ id, title, description }) {

    const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
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
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
        <Row class="mt-3">
            <Col>
                <span class="h5 pull-left">{title} | </span>
                <span class="text-secondary">{description}</span>
            </Col>
        </Row>
        <Row class="mt-1">
            {books.map((book) => (
                <Col md="auto">
                    <img height="150px" src={book.cover_image} alt="Book Cover" /> 
                </Col>
            ))}
        </Row>
    </>
  );
}

export default Bookshelf;