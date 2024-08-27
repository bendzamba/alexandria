import { Link } from "react-router-dom";
import { Container } from "react-bootstrap";
import Nav from "react-bootstrap/Nav";
import { Navbar } from "react-bootstrap";
import NavDropdown from "react-bootstrap/NavDropdown";

function Header() {
  return (
    <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
      <Container>
        <Navbar.Brand>
          <Link className="navbar-brand" to="/">
            <h1
              className="display-4 mb-0"
              style={{ wordBreak: "break-word", whiteSpace: "normal" }}
            >
              Alexandria
            </h1>
            <p className="text-secondary">A Library Management System</p>
          </Link>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="ms-auto text-end">
            <NavDropdown
              title="Bookshelves"
              id="bookshelves-nav-dropdown"
              className="ms-auto"
            >
              <NavDropdown.Item href="/">View</NavDropdown.Item>
              <NavDropdown.Item href="/bookshelves/create/">
                Create
              </NavDropdown.Item>
            </NavDropdown>
            <NavDropdown
              title="Books"
              id="books-nav-dropdown"
              className="ms-auto"
            >
              <NavDropdown.Item href="/books/">View</NavDropdown.Item>
              <NavDropdown.Item href="/books/create/">Create</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;
