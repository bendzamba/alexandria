import { Link, useLocation } from "react-router-dom";
import { Button, Container } from "react-bootstrap";
import Nav from "react-bootstrap/Nav";
import { Navbar } from "react-bootstrap";
import NavDropdown from "react-bootstrap/NavDropdown";
import { signOut } from "@aws-amplify/auth";
import { useAuth } from "./AuthProvider";

function Header() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const handleLogout = () => {
    signOut();
  };

  return (
    <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
      <Container>
        <Navbar.Brand>
          <Link
            className="navbar-brand"
            to="/"
            onClick={(e) => {
              if (location.pathname === "/") {
                e.preventDefault(); // Prevent navigation if already on the same page
              }
            }}
          >
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
            {isAuthenticated && (
              <>
                <NavDropdown
                  title="Bookshelves"
                  id="bookshelves-nav-dropdown"
                  className="ms-auto"
                >
                  <NavDropdown.Item
                    as={Link}
                    to="/"
                    onClick={(e) =>
                      location.pathname === "/" && e.preventDefault()
                    }
                  >
                    View
                  </NavDropdown.Item>
                  <NavDropdown.Item
                    as={Link}
                    to="/bookshelves/create/"
                    onClick={(e) =>
                      location.pathname === "/bookshelves/create/" &&
                      e.preventDefault()
                    }
                  >
                    Create
                  </NavDropdown.Item>
                </NavDropdown>
                <NavDropdown
                  title="Books"
                  id="books-nav-dropdown"
                  className="ms-auto"
                >
                  <NavDropdown.Item
                    as={Link}
                    to="/books/"
                    onClick={(e) =>
                      location.pathname === "/books/" && e.preventDefault()
                    }
                  >
                    View
                  </NavDropdown.Item>
                  <NavDropdown.Item
                    as={Link}
                    to="/books/create/"
                    onClick={(e) =>
                      location.pathname === "/books/create/" &&
                      e.preventDefault()
                    }
                  >
                    Create
                  </NavDropdown.Item>
                </NavDropdown>
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;
