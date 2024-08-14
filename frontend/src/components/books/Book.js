import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

function Book({ id, title, author, year, category, cover }) {

  return (
    <Row>
      <Col xs={3}>
        <img src={cover} className="img-fluid" alt="Book Cover" />
      </Col>
      <Col xs={9}>
        <div>
          <span><strong>{title}</strong></span>
        </div>
        <div>
          <span className="text-secondary"><small>{author}</small></span>
        </div>
        <div>
          <span><small>{year}</small></span>
        </div>
        <div>
          <span className="text-secondary"><small>{category}</small></span>
        </div>
      </Col>
    </Row>
  );
}

export default Book;