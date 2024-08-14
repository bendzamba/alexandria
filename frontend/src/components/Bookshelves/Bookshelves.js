import React, { useState, useEffect } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import { NavLink } from 'react-router-dom';
import Bookshelf from './Bookshelf';
import { GetBookshelves } from '../../services/bookshelves'

function Bookshelves() {
  const [bookshelves, setBookshelves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await GetBookshelves();
        setBookshelves(data);
      } catch (error) {
        console.error('Error fetching bookshelves:', error);
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
        <Col><h2>Bookshelves</h2></Col>
        <Col>
          <NavLink 
            className="nav-link" 
            to="/bookshelves/create/"
            >
              Create Bookshelf
          </NavLink>
        </Col>
      </Row>
      <Row className="mt-3 mb-3">
        {bookshelves.map((bookshelf) => (
          <Bookshelf
            bookshelfId={bookshelf.id}
          />
        ))}
      </Row>
    </Container>
  );
}

export default Bookshelves;
