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

function CreateBook() {
  const [searchTitle, setSearchTitle] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [year, setYear] = useState("");
  const [olid, setOlid] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [olids, setOlids] = useState([]);
  const [coverUrl, setCoverUrl] = useState("");
  const [booksToChooseFrom, setBooksToChooseFrom] = useState([]);
  const [selectedBook, setSelectedBook] = useState("");
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearching(true);
    setSearchResults(false);
    setNoResults(false);
    setAuthor("");
    setYear("");
    setOlids([]);
    setCoverUrl("");
    setOlid("");
    setTitle("");

    let response = await SearchBookByTitle(searchTitle);

    setSearching(false);

    if (!response) {
      // A message to the user may be warranted here
      return false;
    }

    if (response.length === 0) {
      setNoResults(true);
      return true;
    }

    if (response.length === 1) {
      setSearchResults(true);
      setTitle(response[0].title);
      setAuthor(response[0].author_name);
      setYear(response[0].first_publish_year);
      setOlids(response[0].olids);
      setCoverUrl("/assets/cover_images/Select_A_Book_Cover.png");
    } else {
      setBooksToChooseFrom(response);
    }
  };

  const handleSelectBook = async (e, index) => {
    e.preventDefault();
    setSelectedBook(parseInt(index));
    setSearchResults(true);
    setTitle(booksToChooseFrom[index].title);
    setAuthor(booksToChooseFrom[index].author_name);
    setYear(booksToChooseFrom[index].first_publish_year);
    setOlids(booksToChooseFrom[index].olids);
    setCoverUrl("/assets/cover_images/Select_A_Book_Cover.png");
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const json_olids = JSON.stringify(olids);
    let response = await CreateBookService({
      title,
      author,
      year,
      olid,
      olids: json_olids,
    });
    if (!response) {
      // A message to the user may be warranted here
      return false;
    }
    setTitle("");
    setSearchTitle("");
    setAuthor("");
    setYear("");
    setOlid("");
    setOlids([]);
    navigate(`/books/`);
  };

  const handleCancel = async (e) => {
    e.preventDefault();
    setTitle("");
    setSearchTitle("");
    setAuthor("");
    setYear("");
    setOlid("");
    setOlids([]);
    navigate(`/books/`);
  };

  const imageOnload = async (event, olid) => {
    const img = event.target;
    // Images returned from Open Library that are 'blank' seem to render as 1x1s
    if (img.naturalWidth === 1 || img.naturalHeight === 1) {
      setOlids((prevOlids) => {
        return prevOlids.filter((prevOlid) => {
          return prevOlid !== olid;
        });
      });
    }
  };

  useEffect(() => {
    if (olids && olids.length === 0) {
      setCoverUrl("/assets/cover_images/No_Image_Available.jpg");
    }
  }, [olids]);

  const toggleBookCoverSelection = async (e, olidToToggle) => {
    e.preventDefault();
    const localOlid = olid === olidToToggle ? "" : olidToToggle;
    setOlid(localOlid);
    if (olid === olidToToggle) {
      setCoverUrl("/assets/cover_images/Select_A_Book_Cover.png");
    } else {
      setCoverUrl(
        "https://covers.openlibrary.org/b/olid/" + olidToToggle + "-L.jpg",
      );
    }
  };

  return (
    <Container className="mt-4">
      <form onSubmit={handleSearch}>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            id="searchTitle"
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            placeholder="Search for a title..."
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
          <h4>Searching...</h4>
        </Row>
      )}

      {noResults && (
        <Row className="mt-4">
          <h4>No Results Found. Please Try Another Search.</h4>
        </Row>
      )}

      {searchResults && (
        <>
          <Row
            className="mt-4 mb-4 align-items-center"
            style={{ borderBottom: "3px solid black" }}
          >
            <Col x3={9}>
              <div>
                <h1 className="display-5 pull-left">Search Results</h1>
              </div>
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
                onClick={handleCreate}
              >
                Create
              </button>
            </Col>
          </Row>
          <Row>
            <Col xs={3}>
              <img
                src={coverUrl}
                className="img-fluid"
                alt="Book Cover"
                height="300px"
              />
            </Col>
            <Col xs={3}>
              <div>
                <h2>{title}</h2>
              </div>
              <div>
                <h4>{author}</h4>
              </div>
              <div>
                <h6>{year}</h6>
              </div>
            </Col>
            {olids && olids.length > 0 && (
              <>
                <Col xs={6}>
                  <Row
                    style={{
                      maxHeight: "500px",
                      overflow: "scroll",
                      border: "1px solid grey",
                      borderRadius: ".375em",
                    }}
                  >
                    {olids.map((map_olid) => (
                      <Col key={map_olid} className={"m-2"}>
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
                        />
                      </Col>
                    ))}
                  </Row>
                </Col>
              </>
            )}
          </Row>
        </>
      )}

      {booksToChooseFrom.length > 0 && (
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
                sm={4}
                md={2}
                className={`mt-4 ${styles["search-result-book"]} ${index === selectedBook ? styles["search-result-book-selected"] : ""}`}
                key={`col-booktochoosefrom-${index}`}
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
                      alt="Book Cover"
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
