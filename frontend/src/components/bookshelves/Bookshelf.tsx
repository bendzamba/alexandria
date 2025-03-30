import React, { useState, useEffect, useCallback, useRef } from "react";
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
  UpdateBookshelf,
} from "../../services/bookshelves";
import useLazyLoad from "../../hooks/useLazyLoad";
import LazyImage from "../common/LazyLoadImage";
import {
  BookInterface,
  BookshelfWithBooksInterface,
  SortableBookProperties,
} from "../../interfaces/book_and_bookshelf";
import { bookSort } from "../../utils/book_sort";
import styles from "./css/Bookshelf.module.scss";
import { createPlaceholderImage } from "../../utils/create_placeholder_image";
import { truncateText } from "../../utils/string";

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

  const [bookshelf, setBookshelf] =
    useState<BookshelfWithBooksInterface | null>(null);
  const [booksToAdd, setBooksToAdd] = useState<number[]>([]);
  const [booksThatCanBeAdded, setBooksThatCanBeAdded] = useState<
    BookInterface[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [sortKey, setSortKey] = useState("");
  const [sortDirection, setSortDirection] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();
  const lazyLoadContainerRef = useRef<HTMLDivElement>(null);
  const { observe, visibleImages } = useLazyLoad(lazyLoadContainerRef);

  const fetchBookshelf = useCallback(async () => {
    try {
      const response: BookshelfWithBooksInterface | boolean =
        await GetBookshelf(_bookshelfId);
      if (typeof response == "boolean") {
        // A message to the user may be warranted here
        return false;
      }
      setBookshelf(response);
      setSortKey(response.sort_key);
      setSortDirection(response.sort_direction);
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

  const handleUpdateClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    navigate(`/bookshelves/update/` + _bookshelfId.toString());
  };

  const handleDelete = async () => {
    const response: boolean = await DeleteBookshelf(_bookshelfId);
    if (!response) {
      // A message to the user may be warranted here
      // Especially if we are going to prevent navigation
      return false;
    }
    navigate(`/`);
  };

  const handleDeleteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setShowDeleteModal(true);
  };

  const handleShowModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSaveChanges = async () => {
    if (booksToAdd.length) {
      const response: boolean = await AddBooksToBookshelf(
        _bookshelfId,
        booksToAdd
      );
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
    const response: boolean = await DeleteBookFromBookshelf(
      _bookshelfId,
      bookToDelete
    );
    if (!response) {
      // A message to the user may be warranted here
      return false;
    }

    // No sense fetching our bookshelf again if the deletion failed
    void fetchBookshelf();
  };

  const handleDeleteBookFromBookshelfClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    bookToDelete: number
  ) => {
    event.preventDefault();
    void handleDeleteBookFromBookshelf(bookToDelete);
  };

  const handleResetBooksToAdd = () => {
    setBooksToAdd([]);
  };

  const fetchBooksThatCanBeAdded = async () => {
    const booksThatCanBeAdded: BookInterface[] | boolean =
      await GetBooksNotOnBookshelf(_bookshelfId);
    if (typeof booksThatCanBeAdded == "boolean") {
      return false;
    }
    setBooksThatCanBeAdded(booksThatCanBeAdded);
  };

  const handleFetchBooksThatCanBeAddedShow = () => {
    void fetchBooksThatCanBeAdded();
  };

  const toggleBookSelection = (
    event: React.MouseEvent<HTMLElement>,
    bookToToggle: number
  ) => {
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

  const handleSort = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSortKey = event.currentTarget.value;
    setSortKey(newSortKey);
    handleUpdate("sort_key", newSortKey);
  };

  const handleSortDirection = () => {
    const newSortDirection =
      sortDirection === "ascending" ? "descending" : "ascending";
    setSortDirection(newSortDirection);
    handleUpdate("sort_direction", newSortDirection);
  };

  const handleUpdate = async (
    field: "sort_key" | "sort_direction",
    value: string
  ) => {
    const response: boolean = await UpdateBookshelf(_bookshelfId, {
      [field]: value,
    });
    if (!response) {
      // A message to the user may be warranted here
      return false;
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
  };

  if (!_bookshelfId || _bookshelfId === 0) {
    console.log("could not find bookshelf ID");
    return <></>;
  }

  return (
    <Container>
      <Row
        className="mt-4 align-items-center"
        style={{ borderBottom: "3px solid black" }}
      >
        <Col xs={12} lg={preview ? 12 : 6} xl={preview ? 12 : 7}>
          {preview && bookshelf && (
            <NavLink
              className="nav-link"
              to={"/bookshelves/" + _bookshelfId.toString()}
            >
              <h1 className="display-6 pull-left">{bookshelf.title}</h1>
            </NavLink>
          )}
          {!preview && bookshelf && (
            <h1 className="display-5 pull-left">{bookshelf.title}</h1>
          )}
        </Col>
        {!preview && (
          <Col
            xs={12}
            lg={6}
            xl={5}
            className={styles["bookshelf-component-controls"]}
          >
            <div className={`form-floating ${styles["custom-form-floating"]}`}>
              <select
                className="form-select"
                id="floatingSelect"
                aria-label="Floating label select example"
                onChange={handleSort}
                defaultValue={sortKey}
              >
                <option value="id">Date Added</option>
                <option value="title">Title</option>
                <option value="author">Author</option>
                <option value="year">Year</option>
                <option value="rating">Rating</option>
              </select>
              <label htmlFor="floatingSelect">Sort by</label>
            </div>
            <button
              type="button"
              className={`btn btn-outline-secondary me-1 mb-2 ${styles["bookshelf-sort-button"]}`}
              onClick={handleSortDirection}
            >
              {sortDirection === "ascending" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="currentColor"
                  className="bi bi-sort-up"
                  viewBox="0 0 16 16"
                >
                  <path d="M3.5 12.5a.5.5 0 0 1-1 0V3.707L1.354 4.854a.5.5 0 1 1-.708-.708l2-1.999.007-.007a.5.5 0 0 1 .7.006l2 2a.5.5 0 1 1-.707.708L3.5 3.707zm3.5-9a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5M7.5 6a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1zm0 3a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1zm0 3a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1z" />
                </svg>
              )}
              {sortDirection === "descending" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="currentColor"
                  className="bi bi-sort-down"
                  viewBox="0 0 16 16"
                >
                  <path d="M3.5 2.5a.5.5 0 0 0-1 0v8.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L3.5 11.293zm3.5 1a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5M7.5 6a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1zm0 3a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1zm0 3a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1z" />
                </svg>
              )}
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleUpdateClick}
              style={{ marginBottom: "0.5rem" }}
            >
              Update
            </button>
            <button
              type="button"
              className="btn btn-danger btn-sm ms-1"
              onClick={handleDeleteClick}
              style={{ marginBottom: "0.5rem" }}
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
          {!preview && bookshelf && (
            <h5 className="text-secondary">{bookshelf.description}</h5>
          )}
        </Col>
      </Row>
      <Row className="mt-2" style={{ minHeight: "150px" }}>
        {!preview && (
          <Col xs="auto" className="mt-3">
            <button
              type="button"
              className="btn btn-outline-primary"
              style={{ width: "90px", height: "150px" }}
              onClick={handleShowModal}
              aria-label="Add Book to Bookshelf"
            >
              +
            </button>
          </Col>
        )}
        {bookshelf &&
          bookshelf.books
            .sort((bookA: BookInterface, bookB: BookInterface) => {
              return bookSort(
                bookA,
                bookB,
                sortKey as keyof SortableBookProperties,
                sortDirection
              );
            })
            .map((book: BookInterface) => (
              <Col
                xs="auto"
                className="mt-3 bookshelf-book-image-wrapper"
                style={{ minHeight: "150px", minWidth: "80px" }}
                key={`bookshelf-book-${book.id}`}
                tabIndex={0}
                onClick={() => {
                  if (preview) {
                    navigate(`/books/` + book.id.toString());
                  }
                }}
              >
                <img
                  height="150px"
                  src={
                    book.image !== null
                      ? book.image.uri
                      : createPlaceholderImage(
                          320,
                          484,
                          truncateText(book.title, 75)
                        )
                  }
                  alt={`${book.title}: Book Cover`}
                  loading="lazy"
                  style={{
                    height: "150px",
                    minHeight: "150px",
                    minWidth: "80px",
                  }}
                />
                {!preview && (
                  <div className="remove-book-from-bookshelf-button">
                    <button
                      className="btn btn-sm btn-danger"
                      aria-label={`Remove ${book.title} from bookshelf`}
                      onClick={(event) => {
                        handleDeleteBookFromBookshelfClick(event, book.id);
                      }}
                      data-bs-theme="dark"
                    >
                      X
                    </button>
                  </div>
                )}
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
        <Modal.Body ref={lazyLoadContainerRef}>
          <Container>
            <Row>
              {booksThatCanBeAdded.map((book) => (
                <Col
                  className="m-3 border border-2 border-light"
                  onClick={(event) => toggleBookSelection(event, book.id)}
                  style={{
                    height: "175px",
                    minWidth: "100px",
                    padding: "2px",
                    boxSizing: "border-box",
                  }}
                  key={`book-that-can-be-added-${book.id}`}
                >
                  <LazyImage
                    key={String(book.id)}
                    src={
                      book.image !== null
                        ? book.image.uri
                        : createPlaceholderImage(
                            320,
                            484,
                            truncateText(book.title, 75)
                          )
                    }
                    alt={`${book.title}: Book Cover`}
                    style={{ maxWidth: "100%", maxHeight: "100%" }}
                    observe={observe}
                    visibleImages={visibleImages}
                  ></LazyImage>
                </Col>
              ))}
            </Row>
          </Container>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleCloseModal}
            aria-label="Cancel Adding Books to Bookshelf"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveChangeClick}
            aria-label="Add Books to Bookshelf"
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Warning</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this bookshelf?</Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleCloseDeleteModal}
            aria-label="Cancel Delete"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleDelete}
            aria-label="Delete Confirmation"
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Bookshelf;
