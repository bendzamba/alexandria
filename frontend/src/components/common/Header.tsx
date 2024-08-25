import React from "react";
import { Link } from "react-router-dom";
import { Container, Col } from "react-bootstrap";
import Nav from "react-bootstrap/Nav";
import { Navbar } from "react-bootstrap";
import NavDropdown from "react-bootstrap/NavDropdown";

function Header() {
  return (
    <Navbar collapseOnSelect expand="lg" className="bg-body-tertiary">
      <Container>
        <Col xs={9}>
          <Navbar.Brand href="/">
            <Link className="navbar-brand" to="/">
              <h1 className="display-2">Welcome to your Book Case</h1>
            </Link>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
        </Col>
        <Col xs={3}>
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav>
              <NavDropdown title="Bookshelves">
                <NavDropdown.Item href="/">View</NavDropdown.Item>
                <NavDropdown.Item href="/bookshelves/create/">
                  Create
                </NavDropdown.Item>
              </NavDropdown>
              <NavDropdown title="Books">
                <NavDropdown.Item href="/books/">View</NavDropdown.Item>
                <NavDropdown.Item href="/books/create/">
                  Create
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Col>
      </Container>
    </Navbar>
  );
}

export default Header;
