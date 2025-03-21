import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreateBook as CreateBookService,
  SearchBookByTitle,
} from "../../services/books";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import styles from "./css/CreateBook.module.css";
import { WorkInterface } from "../../interfaces/work";
import {
  CreateOrUpdateBookInterface,
  AvailableCoverImageInterface,
} from "../../interfaces/book_and_bookshelf";
import { createPlaceholderImage } from "../../utils/create_placeholder_image";
import CoverImage from "./CoverImage";

function CreateBook() {
  // Book metadata
  const [title, setTitle] = useState<string | null>(null);
  const [author, setAuthor] = useState<string | null>(null);
  const [year, setYear] = useState<number | null>(null);
  const [olids, setOlids] = useState<string[]>([]);
  const [selectedCoverImage, setSelectedCoverImage] =
    useState<Partial<AvailableCoverImageInterface> | null>(null);

  // Search
  const [searchTitle, setSearchTitle] = useState<string>("");
  const [noResults, setNoResults] = useState(false);
  const [booksToChooseFrom, setBooksToChooseFrom] = useState<WorkInterface[]>(
    []
  );

  // Book selected from search results
  const [selectedBook, setSelectedBook] = useState<number | null>(null);

  // Book covers to choose from selected book
  const [availableCoverImages, setAvailableCoverImages] = useState<
    Partial<AvailableCoverImageInterface>[]
  >([]);

  // Processing states
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);

  // Static values
  const placeholderImageText = "No Cover Image Selected";
  const olidImagePath = "https://covers.openlibrary.org/b/olid/";

  const navigate = useNavigate();

  const handleSearch = async () => {
    setSearching(true);
    setNoResults(false);
    setTitle(null);
    setAuthor(null);
    setYear(null);
    setOlids([]);
    setBooksToChooseFrom([]);
    setAvailableCoverImages([]);
    setSelectedCoverImage(null);
    setSelectedBook(null);

    const response: WorkInterface[] | boolean =
      await SearchBookByTitle(searchTitle);

    setSearching(false);

    if (typeof response == "boolean") {
      // A message to the user may be warranted here
      return false;
    }

    if (response.length === 0) {
      setNoResults(true);
      return true;
    }

    setBooksToChooseFrom(response);

    if (response.length === 1) {
      setSelectedBook(0);
      setTitle(response[0].title);
      setAuthor(response[0].author_name);
      setYear(response[0].first_publish_year);
      setOlids(response[0].olids);
      const localAvailableCoverImages = response[0].olids.map((olid) => {
        const bookCover: Partial<AvailableCoverImageInterface> = {
          unique_id: olid,
          thumb_uri: olidImagePath + olid + "-M.jpg",
          uri: olidImagePath + olid + "-L.jpg",
        };
        return bookCover;
      });
      setAvailableCoverImages(localAvailableCoverImages);
    }
  };

  const handleSearchClick = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleSearch();
  };

  const handleSelectBook = (
    event: React.MouseEvent<HTMLElement>,
    index: number
  ) => {
    event.preventDefault();
    setSelectedBook(index);
    setTitle(booksToChooseFrom[index].title);
    setAuthor(booksToChooseFrom[index].author_name);
    setYear(booksToChooseFrom[index].first_publish_year);
    setOlids(booksToChooseFrom[index].olids);
    // Create book covers
    const localAvailableCoverImages = booksToChooseFrom[index].olids.map(
      (olid) => {
        const bookCover: Partial<AvailableCoverImageInterface> = {
          unique_id: olid,
          thumb_uri: olidImagePath + olid + "-M.jpg",
          uri: olidImagePath + olid + "-L.jpg",
        };
        return bookCover;
      }
    );
    setAvailableCoverImages(localAvailableCoverImages);
  };

  const handleCreate = async () => {
    // We are in the process of creating. Disable the 'Create' button
    setCreating(true);
    const json_olids = JSON.stringify(olids);
    const filteredBookData: Partial<CreateOrUpdateBookInterface> = {
      read_status: "not_read",
    };
    if (title != null) filteredBookData.title = title;
    if (author != null) filteredBookData.author = author;
    if (year != null) filteredBookData.year = year;
    if (json_olids != null) filteredBookData.olids = json_olids;
    if (selectedCoverImage != null) {
      if (selectedCoverImage.unique_id) {
        filteredBookData.olid = selectedCoverImage.unique_id;
      }
      if (selectedCoverImage.upload) {
        filteredBookData.upload = selectedCoverImage.upload;
      }
    }

    const response: boolean = await CreateBookService(filteredBookData);
    if (!response) {
      // A message to the user may be warranted here
      setCreating(false);
      return false;
    }
    setTitle(null);
    setSearchTitle("");
    setAuthor(null);
    setYear(null);
    setOlids([]);
    setAvailableCoverImages([]);
    navigate(`/books/`);
  };

  const handleCreateClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    void handleCreate();
  };

  const handleCancel = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setTitle(null);
    setSearchTitle("");
    setAuthor(null);
    setYear(null);
    setOlids([]);
    setAvailableCoverImages([]);
    navigate(`/books/`);
  };

  useEffect(() => {
    if (olids && olids.length === 0) {
      setAvailableCoverImages([]);
    }
  }, [olids, setAvailableCoverImages]);

  const toggleCoverImageSelection = (
    bookCoverToSelect: Partial<AvailableCoverImageInterface>
  ) => {
    const localSelectedBookCover =
      selectedCoverImage === bookCoverToSelect ? null : bookCoverToSelect;
    setSelectedCoverImage(localSelectedBookCover);
  };

  return (
    <Container className="mt-4">
      <form onSubmit={handleSearchClick}>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            id="searchTitle"
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            placeholder="Search for a title..."
            aria-label="Search for a title"
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Search
        </button>
        <button
          type="button"
          className="btn btn-danger ms-1"
          onClick={handleCancel}
        >
          Cancel
        </button>
      </form>

      {searching && (
        <Row>
          <Col>
            <h4>Searching...</h4>
          </Col>
        </Row>
      )}

      {noResults && (
        <Row className="mt-4">
          <Col>
            <h4>No Results Found. Please Try Another Search.</h4>
          </Col>
        </Row>
      )}

      {selectedBook !== null && (
        <>
          <Row
            className="mt-4 mb-4 align-items-center"
            style={{ borderBottom: "3px solid black" }}
          >
            <Col x3={9}>
              <h1 className="display-5 pull-left">Search Results</h1>
            </Col>
            <Col
              xs={3}
              style={{
                textAlign: "right",
              }}
            >
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleCreateClick}
                disabled={creating}
              >
                {creating && (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-1"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Creating...
                  </>
                )}
                {!creating && <span>Create</span>}
              </button>
            </Col>
          </Row>
          <Row>
            <Col xs={3} className="mb-3">
              <img
                src={
                  selectedCoverImage !== null
                    ? selectedCoverImage.uri
                    : createPlaceholderImage(320, 484, placeholderImageText)
                }
                className="img-fluid"
                alt={`${selectedCoverImage !== null ? "Selected" : "Placeholder"} Book Cover: ${title}`}
                height="300px"
              />
            </Col>
            <Col xs={9} lg={4}>
              <h2 data-testid="selected-book-title">{title}</h2>
              <h4 data-testid="selected-book-author">{author}</h4>
              <h6 data-testid="selected-book-year">{year}</h6>
            </Col>
            <Col xs={12} lg={5}>
              <CoverImage
                parentAvailableCoverImages={availableCoverImages}
                onSelectCoverImage={toggleCoverImageSelection}
              />
            </Col>
          </Row>
        </>
      )}

      {booksToChooseFrom.length > 1 && (
        <>
          <Row className="mt-4">
            <Col>
              <h3>Please select from the multiple results found</h3>
            </Col>
          </Row>
          <Row className="mt-4">
            {booksToChooseFrom.map((book, index) => (
              <Col
                xs={6}
                md={4}
                lg={3}
                xl={2}
                className={`mt-4 ${styles["search-result-book"]} ${index === selectedBook ? styles["search-result-book-selected"] : ""}`}
                key={`col-booktochoosefrom-${index}`}
                aria-label={`Book to choose from ${index.toString()}`}
                onClick={(event) => handleSelectBook(event, index)}
              >
                <Row>
                  <Col style={{ height: "125px" }}>
                    <img
                      src={
                        "https://covers.openlibrary.org/b/olid/" +
                        book["olids"][0] +
                        "-M.jpg"
                      }
                      style={{ maxWidth: "100%", maxHeight: "100%" }}
                      alt={`Book to choose from ${index.toString()}`}
                      loading="lazy"
                    />
                  </Col>
                  <Col
                    className={`p-1 ${styles["search-result-book-metadata"]}`}
                    style={{ overflow: "scroll" }}
                  >
                    <Row>
                      <span>{book["title"]}</span>
                    </Row>
                    <Row>
                      <span className="text-secondary">
                        {book["author_name"]}
                      </span>
                    </Row>
                    <Row>
                      <span>{book["first_publish_year"]}</span>
                    </Row>
                  </Col>
                </Row>
              </Col>
            ))}
          </Row>
        </>
      )}
    </Container>
  );
}

export default CreateBook;
