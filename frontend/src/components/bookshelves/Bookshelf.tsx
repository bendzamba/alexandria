import React, { useState, useEffect, useCallback } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { NavLink, useParams, useNavigate } from "react-router-dom";
import {
  GetBookshelf,
  DeleteBookshelf,
  GetBooksNotOnBookshelf,
  AddBooksToBookshelf,
  DeleteBookFromBookshelf,
} from "../../services/bookshelves";
import LazyImage from "../common/LazyLoadImage";
import { BookInterface, BookshelfWithBooksInterface } from "../../interfaces/book_and_bookshelf";

interface BookshelfProps {
  bookshelfId?: number;
  preview?: boolean;
}

function Bookshelf({ bookshelfId, preview }: BookshelfProps) {
  const { id } = useParams();

  let _bookshelfId = bookshelfId || 0;

  if (id) {
    _bookshelfId = parseInt(id);
  }
  
  const [bookshelf, setBookshelf] = useState<BookshelfWithBooksInterface | null>(null);
  const [booksToAdd, setBooksToAdd] = useState<number[]>([]);
  const [booksThatCanBeAdded, setBooksThatCanBeAdded] = useState<BookInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const fetchBookshelf = useCallback(async () => {
    try {
      const response: BookshelfWithBooksInterface | boolean = await GetBookshelf(_bookshelfId);
      if (typeof response == "boolean") {
        // A message to the user may be warranted here
        return false;
      }
      setBookshelf(response);
    } catch (error) {
      console.error("Error fetching bookshelf:", error);
    } finally {
      setLoading(false);
    }
  }, [_bookshelfId]);

  useEffect(() => {
    const fetchData = async () => {
      await fetchBookshelf();
    };
    void fetchData();
  }, [_bookshelfId, fetchBookshelf]);

  useEffect(() => {
    console.log("Updated booksToAdd:", booksToAdd);
  }, [booksToAdd]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleUpdate = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    navigate(`/bookshelves/update/` + _bookshelfId.toString());
  };

  const handleDelete = async () => {
    // const result = await confirm(
    //   "Are you sure you want to delete this bookshelf?",
    // );
    const result = true;
    if (result) {
      const response: boolean = await DeleteBookshelf(_bookshelfId);
      if (!response) {
        // A message to the user may be warranted here
        // Especially if we are going to prevent navigation
        return false;
      }
      navigate(`/`);
    }
  };

  const handleDeleteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    void handleDelete();
  }

  const handleShowModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSaveChanges = async () => {
    if (booksToAdd.length) {
      const response: boolean = await AddBooksToBookshelf(_bookshelfId, booksToAdd);
      setShowModal(false);
      if (!response) {
        // A message to the user may be warranted here
        return false;
      }
    }

    // No sense fetching our bookshelf again if the update failed
    void fetchBookshelf();
  };

  const handleSaveChangeClick = () => {
    void handleSaveChanges();
  };

  const handleDeleteBookFromBookshelf = async (bookToDelete: number) => {
    // const result = await confirm(
    //   "Are you sure you want to remove this book from this bookshelf?",
    // );
    const result = true;
    if (result) {
      const response: boolean = await DeleteBookFromBookshelf(_bookshelfId, bookToDelete);
      if (!response) {
        // A message to the user may be warranted here
        return false;
      }

      // No sense fetching our bookshelf again if the deletion failed
      void fetchBookshelf();
    }
  };

  const handleDeleteBookFromBookshelfClick = (event: React.MouseEvent<HTMLButtonElement>, bookToDelete: number) => {
    event.preventDefault();
    void handleDeleteBookFromBookshelf(bookToDelete);
  };

  const handleResetBooksToAdd = () => {
    setBooksToAdd([]);
  };

  const fetchBooksThatCanBeAdded = async () => {
    const booksThatCanBeAdded: BookInterface[] | boolean = await GetBooksNotOnBookshelf(_bookshelfId);
    if (typeof booksThatCanBeAdded == "boolean") {
      return false;
    }
    setBooksThatCanBeAdded(booksThatCanBeAdded);
  };

  const handleFetchBooksThatCanBeAddedShow = () => {
    void fetchBooksThatCanBeAdded();
  };

  const toggleBookSelection = (event: React.MouseEvent<HTMLElement>, bookToToggle: number) => {
    event.preventDefault();
    event.currentTarget.classList.toggle("border-light");
    event.currentTarget.classList.toggle("border-primary");

    setBooksToAdd((prevBooks) => {
      const isBookInArray = prevBooks.some((book) => book === bookToToggle);

      if (isBookInArray) {
        // If the book is already in the array, remove it
        return prevBooks.filter((book) => book !== bookToToggle);
      } else {
        // If the book is not in the array, add it
        return [...prevBooks, bookToToggle];
      }
    });
  };

  if (!_bookshelfId || _bookshelfId === 0) {
    console.log('could not find bookshelf ID');
    return <></>
  }

  return (
    <Container>
      <Row
        className="mt-4 align-items-center"
        style={{ borderBottom: "3px solid black" }}
      >
        <Col xs={9}>
          {preview && bookshelf && (
            <NavLink className="nav-link" to={"/bookshelves/" + _bookshelfId.toString()}>
              <h1 className="display-6 pull-left">{bookshelf.title}</h1>
            </NavLink>
          )}
          {!preview && bookshelf && <h1 className="display-5 pull-left">{bookshelf.title}</h1>}
        </Col>
        {!preview && (
          <Col
            xs={3}
            style={{
              textAlign: "right",
            }}
          >
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleUpdate}
            >
              Update
            </button>
            <button
              type="button"
              className="btn btn-danger ms-1"
              onClick={handleDeleteClick}
            >
              Delete
            </button>
          </Col>
        )}
      </Row>
      <Row className="mt-2 align-items-center">
        <Col md="auto">
          {preview && bookshelf && (
            <span className="text-secondary">{bookshelf.description}</span>
          )}
          {!preview && bookshelf && <h5 className="text-secondary">{bookshelf.description}</h5>}
        </Col>
      </Row>
      <Row className="mt-2" style={{ "minHeight": "150px" }}>
        {!preview && (
          <Col md="auto" className="mt-3">
            <button
              type="button"
              className="btn btn-outline-primary"
              style={{ width: "90px", height: "150px" }}
              onClick={handleShowModal}
            >
              +
            </button>
          </Col>
        )}
        {bookshelf && bookshelf.books.map((book: BookInterface) => (
          <Col
            md="auto"
            className="mt-3"
            style={{ "minHeight": "150px", "minWidth": "80px" }}
          >
            <div
              className="bookshelf-book-image-wrapper"
              style={{ "minHeight": "150px", "minWidth": "80px" }}
            >
              <img
                height="150px"
                src={book.cover_uri}
                alt="Book Cover"
                loading="lazy"
                style={{
                  height: "150px",
                  "minHeight": "150px",
                  "minWidth": "80px",
                }}
              />
              {!preview && (
                <div className="remove-book-from-bookshelf-button">
                  <button
                    className="btn btn-close"
                    onClick={(event) => {
                      handleDeleteBookFromBookshelfClick(event, book.id);
                    }}
                  ></button>
                </div>
              )}
            </div>
          </Col>
        ))}
      </Row>
      <Modal
        size="lg"
        contentClassName="add-books-to-bookshelf-modal"
        show={showModal}
        onShow={handleFetchBooksThatCanBeAddedShow}
        onHide={handleCloseModal}
        onExit={handleResetBooksToAdd}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Choose one or more book to add</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container>
            <Row>
              {booksThatCanBeAdded.map((book) => (
                <Col
                  className="m-3 border border-2 border-light"
                  onClick={(event) => toggleBookSelection(event, book.id)}
                  style={{
                    height: "175px",
                    "minWidth": "100px",
                    padding: "2px",
                    boxSizing: "border-box",
                  }}
                >
                  <LazyImage
                    src={book.cover_uri}
                    alt="Book Cover"
                    style={{ "maxWidth": "100%", "maxHeight": "100%" }}
                    rootElement={document.querySelector(".modal-content")}
                  ></LazyImage>
                </Col>
              ))}
            </Row>
          </Container>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSaveChangeClick}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Bookshelf;
