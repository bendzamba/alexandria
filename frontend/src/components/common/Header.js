import React from 'react';
import Nav from 'react-bootstrap/Nav';
import { useLocation, Link, NavLink } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import { Container, Row, Col } from 'react-bootstrap'

function Header() {
  const location = useLocation();

  return (    
    <Container>
      <Row>
        <Col>
          <Link className="navbar-brand" to="/"><h1 class="display-2">Welcome to your Book Case</h1></Link>
        </Col>
      </Row>
      <Row className="align-items-center">
        <Col>
          <Nav variant="pills">
            <Nav.Item>
              <Nav.Link href="/" active={location.pathname === '/'}>
                <h1>Bookshelves</h1>
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link href="/books/" active={location.pathname === '/books/'}>
                <h1>Books</h1>
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Col>
        <Col style={{
          textAlign:"right"
        }}>
          { location.pathname === '/' && (
            <NavLink 
              className="nav-link" 
              to="/bookshelves/create/"
              >
                <Button variant="info">Create Bookshelf</Button>{' '}
            </NavLink>
          )}

          { location.pathname === '/books/' && (
            <NavLink 
              className="nav-link" 
              to="/books/create/"
              >
                <Button variant="info">Create Book</Button>{' '}
            </NavLink>
          )}
          
        </Col>
      </Row>
    </Container>
  );
}

export default Header;
