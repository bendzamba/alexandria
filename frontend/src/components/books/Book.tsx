import React, { useEffect, useState, useCallback } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import { GetBook, DeleteBook, UpdateBook } from "../../services/books";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/esm/Container";
import styles from "./css/Book.module.scss";
import { BookWithBookshelvesInterface } from "../../interfaces/book_and_bookshelf";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface BookProps {
  book?: BookWithBookshelvesInterface;
  preview?: boolean;
}

function Book({ book, preview }: BookProps) {
  const [bookIdNumeric, setBookIdNumeric] = useState<number>(0);
  const [bookIdString, setBookIdString] = useState<string>("");
  const [bookProp] = useState<BookWithBookshelvesInterface | undefined>(book);
  const [currentBook, setCurrentBook] =
    useState<BookWithBookshelvesInterface>();
  const [savedCoverUri, setSavedCoverUri] = useState("");
  const [savedReview, setSavedReview] = useState("");
  const [loading, setLoading] = useState(true);
  const [availableOlids, setAvailableOlids] = useState<string[]>([]);
  const [savedOlid, setSavedOlid] = useState("");
  const [selectingNewCover, setSelectingNewCover] = useState(false);
  const [addingReview, setAddingReview] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [readStartDate, setReadStartDate] = useState<Date | null>(null);
  const [readEndDate, setReadEndDate] = useState<Date | null>(null);
  const reviewPlaceholder = "Share your thoughts on this book ...";
  const navigate = useNavigate();

  const API_BASE_URL = process.env.REACT_APP_API_URL || "";

  // From /books/{id}
  const { id } = useParams();

  const initialize = useCallback(async () => {
    try {
      if (bookProp) {
        setCurrentBook(bookProp);
        setBookIdNumeric(bookProp.id);
        setBookIdString(bookProp.id.toString());
      }
      if (!currentBook && id) {
        setBookIdNumeric(parseInt(id));
        setBookIdString(id);
        const book_fetched_from_api: BookWithBookshelvesInterface | boolean =
          await GetBook(parseInt(id));
        if (typeof book_fetched_from_api == "boolean") {
          // A message to the user may be warranted here
          return false;
        }
        setCurrentBook(book_fetched_from_api);
      }

      if (!currentBook) {
        console.log("Something went wrong and we have no book!");
        return false;
      }

      setSavedOlid(currentBook.olid);
      // olids should come back as a JSON encoded array or null
      try {
        if (availableOlids.length === 0) {
          const allBookOlids: string[] = JSON.parse(
            currentBook.olids
          ) as string[];
          if (allBookOlids !== undefined) {
            setAvailableOlids(allBookOlids);
          }
        }
      } catch (e) {
        console.log("Could not set available olids", e);
      }
      setSavedCoverUri(API_BASE_URL + currentBook.cover_uri);
      setSavedReview(currentBook.review);
      if (currentBook.read_start_date) {
        setReadStartDate(new Date(currentBook.read_start_date));
      }
      if (currentBook.read_end_date) {
        setReadEndDate(new Date(currentBook.read_end_date));
      }
    } catch (error) {
      console.error("Error fetching book:", error);
    } finally {
      setLoading(false);
    }
  }, [id, bookProp, currentBook, availableOlids]);

  const handleChangeCover = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setSelectingNewCover(true);
  };

  const handleUpdate = async () => {
    if (!currentBook) {
      console.log("We can not update a book we do not have.");
      return false;
    }
    try {
      await UpdateBook(bookIdNumeric, { olid: currentBook.olid });
      setSelectingNewCover(false);
      // Other logic
    } catch (error) {
      console.error("Error updating:", error);
      // Handle the error (e.g., show an error message)
    }
  };

  const handleUpdateClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    void handleUpdate(); // Call the async function but don't return its Promise
  };

  const handleDelete = async () => {
    const response: boolean = await DeleteBook(bookIdNumeric);
    if (!response) {
      // A message to the user may be warranted here
      // Especially if we are going to prevent navigation
      return false;
    }
    navigate(`/books/`);
  };

  const handleDeleteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setShowDeleteModal(true);
  };

  const imageOnload = (
    event: React.SyntheticEvent<HTMLImageElement>,
    olid: string
  ) => {
    const img = event.currentTarget;
    // Images returned from Open Library that are 'blank' seem to render as 1x1s
    if (img.naturalWidth === 1 || img.naturalHeight === 1) {
      setAvailableOlids((previousAvailableOlids) => {
        return previousAvailableOlids.filter((previousAvailableOlid) => {
          return previousAvailableOlid !== olid;
        });
      });
    }
  };

  const updateCurrentBook = (
    updates: Partial<BookWithBookshelvesInterface>
  ) => {
    setCurrentBook((previousCurrentBook) => ({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ...previousCurrentBook!,
      ...updates,
    }));
  };

  const toggleBookCoverSelection = (
    event:
      | React.MouseEvent<HTMLImageElement>
      | React.KeyboardEvent<HTMLImageElement>,
    olidToToggle: string
  ) => {
    event.preventDefault();
    const localOlid =
      currentBook?.olid === olidToToggle ? savedOlid : olidToToggle;
    let newCoverUri = "";
    if (currentBook?.olid === olidToToggle) {
      newCoverUri = savedCoverUri;
    } else {
      newCoverUri =
        "https://covers.openlibrary.org/b/olid/" + olidToToggle + "-L.jpg";
    }
    updateCurrentBook({
      olid: localOlid,
      cover_uri: newCoverUri,
    });
  };

  const changeRating = async (newRating: number) => {
    let ratingToPropagate: number | null = newRating;
    if (newRating === currentBook?.rating) {
      ratingToPropagate = null;
    }
    updateCurrentBook({
      rating: ratingToPropagate,
    });
    await UpdateBook(bookIdNumeric, { rating: ratingToPropagate });
  };

  const changeRatingClick = (event: React.MouseEvent<HTMLInputElement>) => {
    const newRating = parseInt(event.currentTarget.value);
    void changeRating(newRating);
  };

  const editReview = (
    event:
      | React.MouseEvent<HTMLDivElement>
      | React.KeyboardEvent<HTMLDivElement>
  ) => {
    const el = event.currentTarget;
    if (addingReview === false) {
      el.setAttribute("placeholder", "");
      setAddingReview(true);
    }
  };

  const changeReview = async () => {
    const newReview = getReview();
    if (newReview === false) {
      console.log("could not get review to change");
      return false;
    }
    if (newReview !== savedReview) {
      updateCurrentBook({
        review: newReview,
      });
      const response: boolean = await UpdateBook(bookIdNumeric, {
        review: newReview,
      });
      setAddingReview(false);
      if (!response) {
        // A message to the user may be warranted here
        return false;
      }
    }
  };

  const changeAuthor = async () => {
    const newAuthor = getAuthor();
    if (!newAuthor) {
      console.log("could not get author to change");
      return false;
    }
    if (newAuthor !== currentBook?.author) {
      updateCurrentBook({
        author: newAuthor,
      });
      const response: boolean = await UpdateBook(bookIdNumeric, {
        author: newAuthor,
      });
      if (!response) {
        // A message to the user may be warranted here
        return false;
      }
    }
  };

  const changeYear = async () => {
    const newYear = getYear();
    if (!newYear) {
      console.log("could not get year to change");
      return false;
    }
    const numericNewYear = parseInt(newYear);
    if (numericNewYear !== currentBook?.year) {
      updateCurrentBook({
        year: numericNewYear,
      });
      const response: boolean = await UpdateBook(bookIdNumeric, {
        year: numericNewYear,
      });
      if (!response) {
        // A message to the user may be warranted here
        return false;
      }
    }
  };

  const changeTitle = async () => {
    const newTitle = getTitle();
    if (!newTitle) {
      console.log("could not get title to change");
      return false;
    }
    if (newTitle !== currentBook?.title) {
      updateCurrentBook({
        title: newTitle,
      });
      const response: boolean = await UpdateBook(bookIdNumeric, {
        title: newTitle,
      });
      if (!response) {
        // A message to the user may be warranted here
        return false;
      }
    }
  };

  const changeReviewClick = () => {
    void changeReview();
  };

  const changeReviewReturn = () => {
    void changeReview();
  };

  const changeAuthorHandler = () => {
    void changeAuthor();
  };

  const changeYearHandler = () => {
    void changeYear();
  };

  const changeTitleHandler = () => {
    void changeTitle();
  };

  const blurReview = () => {
    const el = document.getElementById("book-review-content-editable");
    if (!el) {
      console.log("could not find `review` div");
      return false;
    }
    const newReview = getReview();
    if (newReview === false || newReview === savedReview) {
      el.setAttribute("placeholder", reviewPlaceholder);
      setAddingReview(false);
    }
  };

  const getReview = () => {
    const element = document.getElementById("book-review-content-editable");
    if (!element) {
      console.log("could not find `review` div");
      return false;
    }
    const newReview = element.innerHTML;
    // innerHtml will get <div> and <br> elements added by contentenditable <div>
    // swap these for newlines
    return newReview
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/div>|<\/p>/gi, "\n")
      .replace(/<div>|<p>/gi, "");
  };

  const getAuthor = () => {
    const element = document.getElementById("book-author");
    if (!element) {
      console.log("could not find author");
      return false;
    }
    return element.textContent;
  };

  const getYear = () => {
    const element = document.getElementById("book-year");
    if (!element) {
      console.log("could not find year");
      return false;
    }
    return element.textContent;
  };

  const getTitle = () => {
    const element = document.getElementById("book-title");
    if (!element) {
      console.log("could not find title");
      return false;
    }
    return element.textContent;
  };

  const handleReadStatusUpdate = async (
    read_status: string,
    read_start_date = null,
    read_end_date = null
  ) => {
    const updateBody = {
      read_status: read_status,
      ...(read_start_date !== undefined && {
        read_start_date: read_start_date,
      }),
      ...(read_end_date !== undefined && {
        read_end_date: read_end_date,
      }),
    };
    const response: boolean = await UpdateBook(bookIdNumeric, updateBody);
    if (!response) {
      // A message to the user may be warranted here
      return false;
    }
  };

  const handleReadStatusChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newReadStatus = event.currentTarget.value;
    updateCurrentBook({
      read_status: newReadStatus,
    });
    if (newReadStatus === "not_read") {
      setReadStartDate(null);
      setReadEndDate(null);
      handleReadStatusUpdate(newReadStatus, null, null);
    } else {
      handleReadStatusUpdate(newReadStatus);
    }
  };

  const handleReadDatesUpdate = async (
    read_start_date: string | null,
    read_end_date: string | null
  ) => {
    const response: boolean = await UpdateBook(bookIdNumeric, {
      read_start_date: read_start_date,
      read_end_date: read_end_date,
    });
    if (!response) {
      // A message to the user may be warranted here
      return false;
    }
  };

  const handleReadDatesChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setReadStartDate(start);
    setReadEndDate(end);
    handleReadDatesUpdate(
      start ? start.toISOString() : null,
      end ? end.toISOString() : null
    );
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
  };

  useEffect(() => {
    void initialize();
  }, [initialize]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Container>
      {!preview && (
        <Row
          className="mt-4 mb-4 align-items-center"
          style={{ borderBottom: "3px solid black" }}
        >
          <Col xs={12} lg={6}>
            <div
              contentEditable="true"
              spellCheck={false}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault(); // Prevent inserting a newline
                  e.currentTarget.blur();
                }
              }}
              onBlur={() => {
                changeTitleHandler();
              }}
              tabIndex={0}
              role="textbox"
            >
              <h1 className="display-5" id="book-title">
                {currentBook?.title}
              </h1>
            </div>
          </Col>
          <Col xs={12} lg={6} className={styles["book-component-controls"]}>
            <div className={`form-floating ${styles["custom-form-floating"]}`}>
              <select
                className="form-select"
                id="floatingSelect"
                aria-label="Floating label select example"
                onChange={handleReadStatusChange}
                value={currentBook?.read_status}
              >
                <option value="not_read">Not read</option>
                <option value="read">Read</option>
                <option value="reading">Reading</option>
              </select>
              <label htmlFor="floatingSelect">Status</label>
            </div>
            {currentBook?.read_status !== "not_read" && (
              <DatePicker
                selected={readStartDate}
                onChange={(date) => handleReadDatesChange(date)}
                startDate={readStartDate ? readStartDate : undefined}
                endDate={readEndDate ? readEndDate : undefined}
                selectsRange
                className="me-1"
                customInput={
                  <button className="btn btn-sm btn-primary">
                    {readStartDate &&
                      `${readStartDate?.toLocaleDateString("en-us", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                      - `}
                    {readEndDate &&
                      `${readEndDate?.toLocaleDateString("en-us", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}`}
                    {!readStartDate && "Reading dates"}
                  </button>
                }
              />
            )}
            {!selectingNewCover && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                style={{ marginBottom: "0.5rem" }}
                onClick={handleChangeCover}
              >
                Cover
              </button>
            )}
            {selectingNewCover && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                style={{ marginBottom: "0.5rem" }}
                onClick={handleUpdateClick}
              >
                Update
              </button>
            )}
            <button
              type="button"
              className="btn btn-danger btn-sm ms-1"
              style={{ marginBottom: "0.5rem" }}
              onClick={handleDeleteClick}
            >
              Delete
            </button>
          </Col>
        </Row>
      )}
      <Row>
        <Col xs={4} lg={3}>
          <NavLink className="nav-link" to={"/books/" + bookIdString}>
            <img
              src={
                currentBook?.cover_uri.includes("openlibrary.org")
                  ? currentBook?.cover_uri
                  : API_BASE_URL + currentBook?.cover_uri
              }
              className="img-fluid"
              alt="Book Cover"
              loading="lazy"
            />
          </NavLink>
        </Col>
        <Col xs={8} lg={selectingNewCover ? 5 : 9} className="mb-4">
          {preview && (
            <NavLink className="nav-link" to={"/books/" + bookIdString}>
              <div>
                <span>
                  <strong>{currentBook?.title}</strong>
                </span>
              </div>
            </NavLink>
          )}
          <Row>
            {preview && (
              <span className="text-secondary">
                <small>{currentBook?.author}</small>
              </span>
            )}
            {!preview && (
              <div
                contentEditable="true"
                spellCheck={false}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault(); // Prevent inserting a newline
                    e.currentTarget.blur();
                  }
                }}
                onBlur={() => {
                  changeAuthorHandler();
                }}
                tabIndex={0}
                role="textbox"
              >
                <h3 id="book-author">{currentBook?.author}</h3>
              </div>
            )}
          </Row>
          <Row>
            {preview && (
              <span>
                <small>{currentBook?.year}</small>
              </span>
            )}
            {!preview && (
              <div
                contentEditable="true"
                spellCheck={false}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault(); // Prevent inserting a newline
                    e.currentTarget.blur();
                  }
                }}
                onBlur={() => {
                  changeYearHandler();
                }}
                tabIndex={0}
                role="textbox"
              >
                <h5 id="book-year">{currentBook?.year}</h5>
              </div>
            )}
          </Row>
          <Row className="ms-auto">
            <fieldset
              className={`${styles.rating} ${preview ? styles["rating-preview"] : ""}`}
            >
              <input
                type="radio"
                id={`star5-${bookIdString}`}
                name={`rating-${bookIdString}`}
                value="5"
                onClick={changeRatingClick}
                checked={currentBook?.rating === 5}
              />
              <label htmlFor={`star5-${bookIdString}`}>5 stars</label>
              <input
                type="radio"
                id={`star4-${bookIdString}`}
                name={`rating-${bookIdString}`}
                value="4"
                onClick={changeRatingClick}
                checked={currentBook?.rating === 4}
              />
              <label htmlFor={`star4-${bookIdString}`}>4 stars</label>
              <input
                type="radio"
                id={`star3-${bookIdString}`}
                name={`rating-${bookIdString}`}
                value="3"
                onClick={changeRatingClick}
                checked={currentBook?.rating === 3}
              />
              <label htmlFor={`star3-${bookIdString}`}>3 stars</label>
              <input
                type="radio"
                id={`star2-${bookIdString}`}
                name={`rating-${bookIdString}`}
                value="2"
                onClick={changeRatingClick}
                checked={currentBook?.rating === 2}
              />
              <label htmlFor={`star2-${bookIdString}`}>2 stars</label>
              <input
                type="radio"
                id={`star1-${bookIdString}`}
                name={`rating-${bookIdString}`}
                value="1"
                onClick={changeRatingClick}
                checked={currentBook?.rating === 1}
              />
              <label htmlFor={`star1-${bookIdString}`}>1 star</label>
            </fieldset>
          </Row>
          {!preview && (
            <Row className="mt-2">
              <Col>
                <div
                  contentEditable="true"
                  id="book-review-content-editable"
                  onClick={editReview}
                  onBlur={blurReview}
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                      e.preventDefault(); // Prevent inserting a newline
                      changeReviewReturn(); // Trigger the click event or any other logic
                    }
                  }}
                  tabIndex={0}
                  role="textbox"
                  data-placeholder={reviewPlaceholder}
                  className="text-secondary"
                >
                  {currentBook?.review}
                </div>
              </Col>
            </Row>
          )}
          {!preview && addingReview && (
            <Row className="mt-2">
              <Col>
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={changeReviewClick}
                >
                  Update Review
                </button>
              </Col>
            </Row>
          )}
        </Col>
        {selectingNewCover && (
          <>
            {availableOlids && availableOlids.length > 0 && (
              <Col xs={12} lg={4}>
                <Row
                  style={{
                    maxHeight: "500px",
                    overflow: "scroll",
                    border: "1px solid grey",
                    borderRadius: ".375em",
                  }}
                >
                  {availableOlids.map((map_olid: string) => (
                    <Col key={map_olid} className="m-1">
                      <img
                        src={
                          "https://covers.openlibrary.org/b/olid/" +
                          map_olid +
                          "-M.jpg"
                        }
                        style={{
                          height: "150px",
                          boxSizing: "border-box",
                          padding: "2px",
                        }}
                        onLoad={(event) => imageOnload(event, map_olid)}
                        onClick={(event) =>
                          toggleBookCoverSelection(event, map_olid)
                        }
                        className={`border border-2 ${currentBook?.olid === map_olid ? "border-primary" : "border-light"}`}
                        alt="Book Cover"
                        loading="lazy"
                        onKeyDown={(event) => {
                          if (
                            (event.ctrlKey || event.metaKey) &&
                            event.key === "Enter"
                          ) {
                            toggleBookCoverSelection(event, map_olid); // Trigger the click event or any other logic
                          }
                        }}
                        role="presentation"
                      />
                    </Col>
                  ))}
                </Row>
              </Col>
            )}
            {availableOlids.length === 0 && (
              <Col xs={4}>
                <Row
                  style={{
                    maxHeight: "500px",
                    overflow: "scroll",
                    border: "1px solid grey",
                    borderRadius: ".375em",
                  }}
                >
                  <h3>Sorry there are no additional covers to select from.</h3>
                </Row>
              </Col>
            )}
          </>
        )}
      </Row>
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Warning</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this book?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Book;
