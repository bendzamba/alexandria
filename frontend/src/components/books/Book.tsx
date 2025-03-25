import React, { useEffect, useState, useCallback, useRef } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import { GetBook, DeleteBook, UpdateBook } from "../../services/books";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import styles from "./css/Book.module.scss";
import {
  BookWithBookshelvesInterface,
  AvailableCoverImageInterface,
} from "../../interfaces/book_and_bookshelf";
import DatePicker from "react-datepicker";
import { createPlaceholderImage } from "../../utils/create_placeholder_image";
import CoverImage from "./CoverImage";
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
  const [savedReview, setSavedReview] = useState<string | null>("");
  const [loading, setLoading] = useState(true);
  const [selectingNewCover, setSelectingNewCover] = useState(false);
  const [addingReview, setAddingReview] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [readStartDate, setReadStartDate] = useState<Date | null>(null);
  const [readEndDate, setReadEndDate] = useState<Date | null>(null);
  const [updating, setUpdating] = useState<boolean>(false);
  const reviewPlaceholder = "Share your thoughts on this book ...";
  // This is for tracking whether or not we've rendered the Book already
  // when loaded from the Books component. We want to prevent unnecessarily
  // re-setting the current book below, which can overwrite our state
  const hasRenderedFromParent = useRef(false);
  const hasInitialized = useRef(false);
  const navigate = useNavigate();

  // Book covers to choose from selected book
  const [availableCoverImages, setAvailableCoverImages] = useState<
    Partial<AvailableCoverImageInterface>[]
  >([]);

  const [selectedCoverImage, setSelectedCoverImage] =
    useState<Partial<AvailableCoverImageInterface> | null>(null);

  const placeholderImageText = "No Cover Image Selected";
  const olidImagePath = "https://covers.openlibrary.org/b/olid/";

  // From /books/{id}
  const { id } = useParams();

  const noop = () => {
    // No-op to satisfy controlled input requirements
  };

  const initialize = useCallback(async () => {
    if (hasInitialized.current) {
      return;
    }
    try {
      if (bookProp && !hasRenderedFromParent.current) {
        setCurrentBook(bookProp);
        setBookIdNumeric(bookProp.id);
        setBookIdString(bookProp.id.toString());
        // Track the fact that we have rendered this component
        // We don't want to overwrite our currentBook from the parent again
        hasRenderedFromParent.current = true;
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
        console.log("About to try");
      }

      if (!currentBook) {
        console.log("Something went wrong and we have no book!");
        return false;
      }

      handleSetAvailableCoverImages(currentBook);

      // setSavedCoverUri(currentBook.cover_uri);
      setSavedReview(currentBook.review);
      if (currentBook.read_start_date) {
        setReadStartDate(new Date(currentBook.read_start_date));
      }
      if (currentBook.read_end_date) {
        setReadEndDate(new Date(currentBook.read_end_date));
      }
      if (currentBook.image) {
        const coverImage: Partial<AvailableCoverImageInterface> = {
          unique_id: currentBook.image.source_id,
          thumb_uri: currentBook.image.uri,
          uri: currentBook.image.uri,
        };
        setSelectedCoverImage(coverImage);
      }
      hasInitialized.current = true;
    } catch (error) {
      console.error("Error fetching book:", error);
    } finally {
      setLoading(false);
    }
  }, [id, bookProp, currentBook, availableCoverImages.length]);

  const handleSetAvailableCoverImages = (
    localCurrentBook: BookWithBookshelvesInterface
  ) => {
    try {
      const allBookOlids: string[] = JSON.parse(
        localCurrentBook.olids
      ) as string[];
      const selectedCoverImages = [];
      if (localCurrentBook.image) {
        // Put selected image first
        selectedCoverImages.push({
          unique_id: localCurrentBook.image.source_id,
          thumb_uri: localCurrentBook.image.uri,
          uri: localCurrentBook.image.uri,
        });
      }
      const unselectedCoverImages = allBookOlids
        .filter((olid) => {
          if (
            localCurrentBook.image &&
            localCurrentBook.image.source === "open_library" &&
            localCurrentBook.image.source_id === olid
          ) {
            // Already added as first in array
            return false;
          }
          return true;
        })
        .map((olid) => {
          const bookCover: Partial<AvailableCoverImageInterface> = {
            unique_id: olid,
            thumb_uri: olidImagePath + olid + "-M.jpg",
            uri: olidImagePath + olid + "-L.jpg",
          };
          return bookCover;
        });

      setAvailableCoverImages([
        ...selectedCoverImages,
        ...unselectedCoverImages,
      ]);
    } catch (e) {
      console.log("Could not set available olids", e);
    }
  };

  const handleChangeCover = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setSelectingNewCover(true);
  };

  const handleUpdateCoverImage = async () => {
    if (!currentBook) {
      console.log("We can not update a book we do not have.");
      return false;
    }
    setUpdating(true);
    try {
      if (selectedCoverImage?.upload) {
        // TODO How to handle updating local current book with this
        await UpdateBook(bookIdNumeric, {
          upload: selectedCoverImage.upload,
        });
      } else if (selectedCoverImage?.unique_id) {
        await UpdateBook(bookIdNumeric, {
          olid: selectedCoverImage?.unique_id,
        });
      }
    } catch (error) {
      console.error("Error updating:", error);
    }
    setSelectingNewCover(false);
    setUpdating(false);
  };

  const handleCoverImageUpdateClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    void handleUpdateCoverImage(); // Call the async function but don't return its Promise
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

  const updateCurrentBook = (
    updates: Partial<BookWithBookshelvesInterface>
  ) => {
    setCurrentBook((previousCurrentBook) => ({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ...previousCurrentBook!,
      ...updates,
    }));
  };

  const toggleCoverImageSelection = (
    coverImageToSelect: Partial<AvailableCoverImageInterface>
  ) => {
    if (coverImageToSelect != null) {
      setSelectedCoverImage(coverImageToSelect);
    }
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
    const cleanedNewReview = newReview
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/div>|<\/p>/gi, "\n")
      .replace(/<div>|<p>/gi, "");
    if (cleanedNewReview === "") {
      return null;
    }
    return cleanedNewReview;
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
    read_start_date: string | null | undefined = undefined,
    read_end_date: string | null | undefined = undefined
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
              suppressContentEditableWarning={true}
              data-testid="book-title-content-editable"
            >
              <h1 className="display-4" id="book-title">
                {currentBook?.title}
              </h1>
            </div>
          </Col>
          <Col xs={12} lg={6} className={styles["book-component-controls"]}>
            <div className={`form-floating ${styles["custom-form-floating"]}`}>
              <select
                className="form-select"
                id="floatingSelect"
                aria-label="Read Status"
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
                  <button
                    className="btn btn-sm btn-primary"
                    aria-label="Date Selection"
                    data-testid="reading-dates-selection"
                  >
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
                onClick={handleCoverImageUpdateClick}
                disabled={updating}
              >
                {updating && (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-1"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Updating...
                  </>
                )}
                {!updating && <span>Update</span>}
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
                selectedCoverImage !== null
                  ? selectedCoverImage.uri
                  : createPlaceholderImage(320, 484, placeholderImageText)
              }
              className="img-fluid"
              alt={`${currentBook?.title}: Book Cover`}
              data-testid={selectedCoverImage?.uri}
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
                suppressContentEditableWarning={true}
                data-testid="book-author-content-editable"
              >
                <h3 id="book-author" className="display-6">
                  {currentBook?.author}
                </h3>
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
                suppressContentEditableWarning={true}
                data-testid="book-year-content-editable"
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
                onChange={noop}
                checked={currentBook?.rating === 5}
              />
              <label htmlFor={`star5-${bookIdString}`}>5 stars</label>
              <input
                type="radio"
                id={`star4-${bookIdString}`}
                name={`rating-${bookIdString}`}
                value="4"
                onClick={changeRatingClick}
                onChange={noop}
                checked={currentBook?.rating === 4}
              />
              <label htmlFor={`star4-${bookIdString}`}>4 stars</label>
              <input
                type="radio"
                id={`star3-${bookIdString}`}
                name={`rating-${bookIdString}`}
                value="3"
                onClick={changeRatingClick}
                onChange={noop}
                checked={currentBook?.rating === 3}
              />
              <label htmlFor={`star3-${bookIdString}`}>3 stars</label>
              <input
                type="radio"
                id={`star2-${bookIdString}`}
                name={`rating-${bookIdString}`}
                value="2"
                onClick={changeRatingClick}
                onChange={noop}
                checked={currentBook?.rating === 2}
              />
              <label htmlFor={`star2-${bookIdString}`}>2 stars</label>
              <input
                type="radio"
                id={`star1-${bookIdString}`}
                name={`rating-${bookIdString}`}
                value="1"
                onClick={changeRatingClick}
                onChange={noop}
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
                  data-testid="book-review-content-editable"
                  onClick={editReview}
                  onBlur={blurReview}
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                      e.preventDefault(); // Prevent inserting a newline
                      changeReviewReturn();
                    }
                  }}
                  tabIndex={0}
                  role="textbox"
                  aria-label="Book Review"
                  data-placeholder={reviewPlaceholder}
                  className="text-secondary"
                  suppressContentEditableWarning={true}
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
          <Col xs={12} lg={4}>
            <CoverImage
              parentAvailableCoverImages={availableCoverImages}
              parentSelectedCoverImage={selectedCoverImage}
              onSelectCoverImage={toggleCoverImageSelection}
            />
          </Col>
        )}
      </Row>
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Warning</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this book?</Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleCloseDeleteModal}
            aria-label="Cancel Delete"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
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

export default Book;
