import React, { useEffect, useState, useCallback } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import { GetBook, DeleteBook, UpdateBook } from "../../services/books";
import Container from "react-bootstrap/esm/Container";
import styles from "./css/Book.module.css";
import { BookWithBookshelvesInterface } from "../../interfaces/book_and_bookshelf";

interface BookProps {
  bookId?: number;
  preview?: boolean;
}

function Book({ bookId, preview }: BookProps) {
  const { id } = useParams();

  let _bookId = bookId || 0;

  if (id) {
    _bookId = parseInt(id);
  }

  const [coverUri, setCoverUri] = useState("");
  const [savedCoverUri, setSavedCoverUri] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [year, setYear] = useState(0);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [savedReview, setSavedReview] = useState("");
  const [loading, setLoading] = useState(true);
  const [olid, setOlid] = useState("");
  const [savedOlid, setSavedOlid] = useState("");
  const [olids, setOlids] = useState<string[]>([]);
  const [selectingNewCover, setSelectingNewCover] = useState(false);

  const navigate = useNavigate();
  const [addingReview, setAddingReview] = useState(false);
  const reviewPlaceholder = "Share your thoughts on this book ...";

  const fetchBook = useCallback(async () => {
    try {
      const data: BookWithBookshelvesInterface | boolean =
        await GetBook(_bookId);
      if (typeof data == "boolean") {
        // A message to the user may be warranted here
        return false;
      }
      setTitle(data.title);
      setAuthor(data.author);
      setYear(data.year);
      setOlid(data.olid);
      setSavedOlid(data.olid);
      // olids should come back as a JSON encoded array or null
      try {
        const allBookOlids: string[] = JSON.parse(data.olids) as string[];
        if (allBookOlids === undefined) {
          setOlids([]);
        } else {
          setOlids(allBookOlids);
        }
      } catch (e) {
        console.log(e);
        setOlids([]);
      }
      setCoverUri(data.cover_uri);
      setSavedCoverUri(data.cover_uri);
      setRating(data.rating);
      setReview(data.review);
      setSavedReview(data.review);
    } catch (error) {
      console.error("Error fetching book:", error);
    } finally {
      setLoading(false);
    }
  }, [_bookId]);

  const handleChangeCover = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setSelectingNewCover(true);
  };

  const handleUpdate = async () => {
    try {
      await UpdateBook(_bookId, { olid });
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
    // const result = await confirm("Are you sure you want to delete this book?");
    const result = true;
    if (result) {
      const response: boolean = await DeleteBook(_bookId);
      if (!response) {
        // A message to the user may be warranted here
        // Especially if we are going to prevent navigation
        return false;
      }
      navigate(`/books/`);
    }
  };

  const handleDeleteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    void handleDelete(); // Call the async function but don't return its Promise
  };

  const imageOnload = (
    event: React.SyntheticEvent<HTMLImageElement>,
    olid: string,
  ) => {
    const img = event.currentTarget;
    // Images returned from Open Library that are 'blank' seem to render as 1x1s
    if (img.naturalWidth === 1 || img.naturalHeight === 1) {
      setOlids((prevOlids) => {
        return prevOlids.filter((prevOlid) => {
          return prevOlid !== olid;
        });
      });
    }
  };

  const toggleBookCoverSelection = (
    event: React.MouseEvent<HTMLImageElement>,
    olidToToggle: string,
  ) => {
    event.preventDefault();
    const localOlid = olid === olidToToggle ? savedOlid : olidToToggle;
    setOlid(localOlid);
    if (olid === olidToToggle) {
      setCoverUri(savedCoverUri);
    } else {
      setCoverUri(
        "https://covers.openlibrary.org/b/olid/" + olidToToggle + "-L.jpg",
      );
    }
  };

  const changeRating = async (newRating: number) => {
    if (rating !== newRating) {
      setRating(newRating);
      await UpdateBook(_bookId, { rating: newRating });
    }
  };

  const changeRatingClick = (event: React.MouseEvent<HTMLInputElement>) => {
    const newRating = parseInt(event.currentTarget.value);
    void changeRating(newRating);
  };

  const editReview = (
    event:
      | React.MouseEvent<HTMLDivElement>
      | React.KeyboardEvent<HTMLDivElement>,
  ) => {
    const el = event.currentTarget;
    if (addingReview === false) {
      el.setAttribute("placeholder", "");
      setAddingReview(true);
    }
  };

  const changeReview = async () => {
    const newReview = getReview();
    if (!newReview) {
      console.log("could not get review to change");
      return false;
    }
    if (newReview !== savedReview) {
      setReview(newReview);
      const response: boolean = await UpdateBook(_bookId, {
        review: newReview,
      });
      setAddingReview(false);
      if (!response) {
        // A message to the user may be warranted here
        return false;
      }
    }
  };

  const changeReviewClick = () => {
    void changeReview();
  };

  const blurReview = () => {
    const el = document.getElementById("review");
    if (!el) {
      console.log("could not find `review` div");
      return false;
    }
    const newReview = getReview();
    if (!newReview || newReview === savedReview) {
      el.setAttribute("placeholder", reviewPlaceholder);
      setAddingReview(false);
    }
  };

  const getReview = () => {
    const element = document.getElementById("review");
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

  useEffect(() => {
    const fetchData = async () => {
      await fetchBook();
    };
    void fetchData();
  }, [fetchBook]);

  useEffect(() => {
    // pass
  }, [olids]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!_bookId || _bookId === 0) {
    console.log("could not find book ID");
    return <></>;
  }

  return (
    <Container>
      {!preview && (
        <Row
          className="mt-4 mb-4 align-items-center"
          style={{ borderBottom: "3px solid black" }}
        >
          <Col xs={9}>
            <div>
              <h1 className="display-5 pull-left">{title}</h1>
            </div>
          </Col>
          <Col
            xs={3}
            style={{
              textAlign: "right",
            }}
          >
            {!selectingNewCover && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleChangeCover}
              >
                Change Cover
              </button>
            )}
            {selectingNewCover && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleUpdateClick}
              >
                Update
              </button>
            )}
            <button
              type="button"
              className="btn btn-danger ms-1"
              onClick={handleDeleteClick}
            >
              Delete
            </button>
          </Col>
        </Row>
      )}
      <Row>
        <Col xs={3}>
          <NavLink className="nav-link" to={"/books/" + _bookId.toString()}>
            <img
              src={coverUri}
              className="img-fluid"
              alt="Book Cover"
              loading="lazy"
            />
          </NavLink>
        </Col>
        <Col xs={olids && olids.length > 0 ? 5 : 9}>
          {preview && (
            <NavLink className="nav-link" to={"/books/" + _bookId.toString()}>
              <div>
                <span>
                  <strong>{title}</strong>
                </span>
              </div>
            </NavLink>
          )}
          <Row>
            {preview && (
              <span className="text-secondary">
                <small>{author}</small>
              </span>
            )}
            {!preview && <h3>{author}</h3>}
          </Row>
          <Row>
            {preview && (
              <span>
                <small>{year}</small>
              </span>
            )}
            {!preview && <h5>{year}</h5>}
          </Row>
          <Row className="ms-auto">
            <fieldset
              className={`${styles.rating} ${preview ? styles["rating-preview"] : ""}`}
            >
              <input
                type="radio"
                id={`star5-${_bookId}`}
                name={`rating-${_bookId}`}
                value="5"
                onClick={changeRatingClick}
                checked={rating === 5}
              />
              <label htmlFor={`star5-${_bookId}`}>5 stars</label>
              <input
                type="radio"
                id={`star4-${_bookId}`}
                name={`rating-${_bookId}`}
                value="4"
                onClick={changeRatingClick}
                checked={rating === 4}
              />
              <label htmlFor={`star4-${_bookId}`}>4 stars</label>
              <input
                type="radio"
                id={`star3-${_bookId}`}
                name={`rating-${_bookId}`}
                value="3"
                onClick={changeRatingClick}
                checked={rating === 3}
              />
              <label htmlFor={`star3-${_bookId}`}>3 stars</label>
              <input
                type="radio"
                id={`star2-${_bookId}`}
                name={`rating-${_bookId}`}
                value="2"
                onClick={changeRatingClick}
                checked={rating === 2}
              />
              <label htmlFor={`star2-${_bookId}`}>2 stars</label>
              <input
                type="radio"
                id={`star1-${_bookId}`}
                name={`rating-${_bookId}`}
                value="1"
                onClick={changeRatingClick}
                checked={rating === 1}
              />
              <label htmlFor={`star1-${_bookId}`}>1 star</label>
            </fieldset>
          </Row>
          {!preview && (
            <Row className="mt-2">
              <Col>
                <div
                  contentEditable="true"
                  id="review"
                  onClick={editReview}
                  onBlur={blurReview}
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                      e.preventDefault(); // Prevent inserting a newline
                      editReview(e); // Trigger the click event or any other logic
                    }
                  }}
                  tabIndex={0}
                  role="textbox"
                  data-placeholder={reviewPlaceholder}
                  className="text-secondary book-review"
                  style={{
                    minHeight: "200px",
                    border: "none",
                    fontStyle: "italic",
                    outline: "none",
                    textWrap: "wrap",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {review}
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
            {olids && olids.length > 0 && (
              <Col xs={4}>
                <Row
                  style={{
                    maxHeight: "500px",
                    overflow: "scroll",
                    border: "1px solid grey",
                    borderRadius: ".375em",
                  }}
                >
                  {olids.map((map_olid: string) => (
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
                        className={`border border-2 ${olid === map_olid ? "border-primary" : "border-light"}`}
                        alt="Book Cover"
                        loading="lazy"
                        onKeyDown={(event) => {
                          if (
                            (event.ctrlKey || event.metaKey) &&
                            event.key === "Enter"
                          ) {
                            editReview(event); // Trigger the click event or any other logic
                          }
                        }}
                        role="presentation"
                      />
                    </Col>
                  ))}
                </Row>
              </Col>
            )}
            {olids.length === 0 && (
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
    </Container>
  );
}

export default Book;
