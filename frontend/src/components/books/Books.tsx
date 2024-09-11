import React, { useState, useEffect, useRef } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Book from "./Book";
import { GetBooks, BulkDeleteBooks } from "../../services/books";
import {
  BookWithBookshelvesInterface,
  SortableBookProperties,
} from "../../interfaces/book_and_bookshelf";
import { bookSort } from "../../utils/book_sort";
import styles from "./css/Books.module.scss";

function Books() {
  const [allBooks, setAllBooks] = useState<BookWithBookshelvesInterface[]>([]);
  const [books, setBooks] = useState<BookWithBookshelvesInterface[]>([]); // All filtered/sorted books
  const [displayedBooks, setDisplayedBooks] = useState<
    BookWithBookshelvesInterface[]
  >([]); // The books that are currently rendered
  const displayedCount = 20; // Number of books to display initially and to load on scroll
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string | null>(null);
  const [sort, setSort] = useState<string>(
    () => localStorage.getItem("sort") || "title"
  );
  const [readStatusFilter, setReadStatusFilter] = useState<string>(
    () => localStorage.getItem("readStatusFilter") || "all"
  );
  const [sortDirection, setSortDirection] = useState<string>(
    () => localStorage.getItem("sortDirection") || "ascending"
  );
  const [loading, setLoading] = useState(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null); // Ref for the sentinel element for IntersectionObserver
  const observerRef = useRef<IntersectionObserver | null>(null); // Ref for IntersectionObserver instance
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false);
  const [selectedBooksForDeletion, setSelectedBooksForDeletion] = useState<
    number[]
  >([]);

  // Function to update filtered books based on search, sort, and filter
  const updateFilteredBooks = () => {
    const filteredBooks = allBooks
      .filter((book: BookWithBookshelvesInterface) => {
        return searchTerm && searchTerm !== ""
          ? book.title.toLowerCase().includes(searchTerm.toLowerCase())
          : true;
      })
      .filter((book: BookWithBookshelvesInterface) => {
        if (readStatusFilter === "all") {
          return true;
        }
        return book.read_status === readStatusFilter;
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
      );

    // Pause the observer to avoid triggering during re-render
    if (observerRef.current && sentinelRef.current) {
      observerRef.current.unobserve(sentinelRef.current);
    }

    setBooks(filteredBooks); // Store the filtered and sorted books
    setDisplayedBooks(filteredBooks.slice(0, displayedCount)); // Show initial batch of books
    setHasMore(filteredBooks.length > displayedCount); // Determine if more books are available
  };

  // Load more books when the sentinel is intersected
  const loadMoreBooks = () => {
    if (!hasMore) return;
    const nextBooks = books.slice(
      displayedBooks.length,
      displayedBooks.length + displayedCount
    );
    setDisplayedBooks((prev) => [...prev, ...nextBooks]);
    if (nextBooks.length < displayedCount) {
      setHasMore(false); // No more books to load
    }
  };

  useEffect(() => {
    updateFilteredBooks();
  }, [allBooks, searchTerm, readStatusFilter, sort, sortDirection]);

  useEffect(() => {
    localStorage.setItem("sort", sort);
  }, [sort]);

  useEffect(() => {
    localStorage.setItem("sortDirection", sortDirection);
  }, [sortDirection]);

  useEffect(() => {
    localStorage.setItem("readStatusFilter", readStatusFilter);
  }, [readStatusFilter]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data: BookWithBookshelvesInterface[] | boolean = await GetBooks();
        if (typeof data == "boolean") {
          // A message to the user may be warranted here
          return false;
        }
        setAllBooks(data);
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.currentTarget.value);
  };

  const handleSort = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(event.currentTarget.value);
  };

  const handleSortDirection = () => {
    setSortDirection(
      sortDirection === "ascending" ? "descending" : "ascending"
    );
  };

  const handleReadStatusFilter = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setReadStatusFilter(event.currentTarget.value);
  };

  // IntersectionObserver for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreBooks();
      }
    });

    observerRef.current = observer; // Store the observer instance

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => {
      if (sentinelRef.current) {
        observer.unobserve(sentinelRef.current);
      }
    };
  }, [hasMore, displayedBooks]);

  const handleBulkDeleteSetup = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    setBulkDeleteMode(true);
  };

  const handleBulkDeleteCancel = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    setBulkDeleteMode(false);
    setSelectedBooksForDeletion([]);
  };

  const handleBulkDelete = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    const response: boolean = await BulkDeleteBooks(selectedBooksForDeletion);
    if (!response) {
      // A message to the user may be warranted here
      // Especially if we are going to prevent navigation
      return false;
    }
    setAllBooks((prev) =>
      prev.filter((book) => !selectedBooksForDeletion.includes(book.id))
    );
    setSelectedBooksForDeletion([]);
    setBulkDeleteMode(false);
  };

  const toggleBookForDeletion = (bookId: number) => {
    setSelectedBooksForDeletion((prev) =>
      prev.includes(bookId)
        ? prev.filter((id) => id !== bookId)
        : [...prev, bookId]
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Container style={{ minHeight: "100vh" }}>
        <Row>
          <Col xs={12} sm={3} className="mb-2">
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
          <Col xs={3} sm={2}>
            <div className={`form-floating ${styles["custom-form-floating"]}`}>
              <select
                className="form-select"
                id="read-status-filter-select"
                aria-label="Read Status Filter"
                onChange={handleReadStatusFilter}
                value={readStatusFilter}
              >
                <option value="all">All Books</option>
                <option value="read">Read</option>
                <option value="reading">Reading</option>
                <option value="not_read">Not Read</option>
              </select>
              <label htmlFor="floatingSelect">Filter</label>
            </div>
          </Col>
          <Col xs={3} sm={2}>
            <div className={`form-floating ${styles["custom-form-floating"]}`}>
              <select
                className="form-select"
                id="floatingSelect"
                aria-label="Sort Key"
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
          <Col
            xs={4}
            sm={3}
            className="d-flex justify-content-end align-items-center"
          >
            {!bulkDeleteMode && (
              <button
                type="button"
                className={`btn btn-sm btn-outline-danger`}
                onClick={handleBulkDeleteSetup}
                aria-label="Bulk Delete Setup"
              >
                Bulk Delete
              </button>
            )}
            {bulkDeleteMode && (
              <>
                <button
                  type="button"
                  className={`btn btn-sm btn-outline-danger`}
                  onClick={handleBulkDelete}
                  aria-label="Bulk Delete"
                >
                  Delete
                </button>
                <button
                  type="button"
                  className={`btn btn-sm btn-outline-secondary ms-1`}
                  onClick={handleBulkDeleteCancel}
                  aria-label="Bulk Delete Cancel"
                >
                  Cancel
                </button>
              </>
            )}
          </Col>
        </Row>
        <Row>
          {displayedBooks.map((book: BookWithBookshelvesInterface) => (
            <Col
              xs={12}
              md={6}
              xl={4}
              className="mt-3 mb-3 position-relative"
              key={`col-${book.id}`}
            >
              {bulkDeleteMode && (
                <div
                  className={`${styles["bulk-delete-overlay"]} ${selectedBooksForDeletion.includes(book.id) ? styles["bulk-delete-selected"] : ""}`}
                  onClick={() => toggleBookForDeletion(book.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      toggleBookForDeletion(book.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-pressed={selectedBooksForDeletion.includes(book.id)}
                ></div>
              )}
              <Book book={book} preview={true} key={book.id} />
            </Col>
          ))}
        </Row>
      </Container>
      <div ref={sentinelRef} style={{ height: "1px" }}></div>
    </>
  );
}

export default Books;
