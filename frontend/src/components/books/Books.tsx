import React, { useState, useEffect } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Book from "./Book";
import { GetBooks } from "../../services/books";
import {
  BookWithBookshelvesInterface,
  SortableBookProperties,
} from "../../interfaces/book_and_bookshelf";
import { bookSort } from "../../utils/book_sort";
import styles from "./css/Books.module.scss";

function Books() {
  const [books, setBooks] = useState<BookWithBookshelvesInterface[]>([]);
  const [search, setSearch] = useState<string | null>(null);
  const [sort, setSort] = useState<string>(
    () => localStorage.getItem("sort") || "title"
  );
  const [sortDirection, setSortDirection] = useState<string>(
    () => localStorage.getItem("sortDirection") || "ascending"
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem("sort", sort);
  }, [sort]);

  useEffect(() => {
    localStorage.setItem("sortDirection", sortDirection);
  }, [sortDirection]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data: BookWithBookshelvesInterface[] | boolean = await GetBooks();
        if (typeof data == "boolean") {
          // A message to the user may be warranted here
          return false;
        }
        setBooks(data);
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.currentTarget.value);
  };

  const handleSort = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(event.currentTarget.value);
  };

  const handleSortDirection = () => {
    setSortDirection(
      sortDirection === "ascending" ? "descending" : "ascending"
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Container>
      <Row>
        <Col xs={5} lg={3}>
          <form className={`form-floating ${styles["custom-form-floating"]}`}>
            <input
              type="text"
              placeholder="search..."
              id="search"
              name="search"
              className="form-control form-control-sm"
              onChange={handleSearch}
            />
            <label htmlFor="search">Search...</label>
          </form>
        </Col>
        <Col xs={5} lg={3}>
          <div className={`form-floating ${styles["custom-form-floating"]}`}>
            <select
              className="form-select"
              id="floatingSelect"
              aria-label="Floating label select example"
              onChange={handleSort}
              value={sort}
            >
              <option value="id">Date Added</option>
              <option value="title">Title</option>
              <option value="author">Author</option>
              <option value="year">Year</option>
              <option value="rating">Rating</option>
              <option value="read_end_date">Reading Dates</option>
            </select>
            <label htmlFor="floatingSelect">Sort by</label>
          </div>
        </Col>
        <Col xs={2}>
          <button
            type="button"
            className={`btn btn-outline-secondary ms-1 ${styles["custom-sort-button"]}`}
            onClick={handleSortDirection}
            aria-label="Sort"
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
        </Col>
      </Row>
      <Row>
        {books
          .filter((book: BookWithBookshelvesInterface) => {
            return search && search !== ""
              ? book.title.toLowerCase().includes(search.toLowerCase())
              : true;
          })
          .sort(
            (
              bookA: BookWithBookshelvesInterface,
              bookB: BookWithBookshelvesInterface
            ) => {
              return bookSort(
                bookA,
                bookB,
                sort as keyof SortableBookProperties,
                sortDirection
              );
            }
          )
          .map((book: BookWithBookshelvesInterface) => (
            <Col
              xs={12}
              md={6}
              xl={4}
              className="mt-3 mb-3"
              key={`col-${book.id}`}
            >
              <Book book={book} preview={true} key={book.id} />
            </Col>
          ))}
      </Row>
    </Container>
  );
}

export default Books;
