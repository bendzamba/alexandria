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
import styles from "./css/Books.module.scss";

function Books() {
  const [books, setBooks] = useState<BookWithBookshelvesInterface[]>([]);
  const [search, setSearch] = useState<string | null>(null);
  const [sort, setSort] = useState<string>(
    () => localStorage.getItem("sort") || "id"
  );
  const [sortDirection, setSortDirection] = useState<string>(
    () => localStorage.getItem("sortDirection") || "ascending"
  );
  const [loading, setLoading] = useState(true);
  type SortFunction<T> = {
    (value: T, book: BookWithBookshelvesInterface): string | Date | null;
    (value: T): string | Date | null;
  };

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

  const surnameSort: SortFunction<string> = (author_name: string) => {
    /* 
    There may be a more intelligent way of handling this, such as procuring
    proper, semantic `first` and `last` names for each Author. In lieu of
    that, we attempt to determine whether or not their `double-barrelled` surname
    should be preserved for sorting.
    Example:
    Ursula K. Le Guin should be sorted by L, not G
    Guy de Maupassant should be sorted by M, not D
    */

    const nameParts = author_name.split(" ");

    // List of integral prefixes (part of surname)
    const integralPrefixes = ["le", "la", "de la"];

    // List of common surname prefixes to ignore
    const ignorePrefixes = [
      "van",
      "von",
      "de",
      "del",
      "di",
      "da",
      "al",
      "bin",
      "mc",
      "mac",
      "ibn",
    ];

    // Start by assuming the last name is the surname
    let surname = nameParts[nameParts.length - 1];

    // Check if the name includes an integral prefix
    for (let i = nameParts.length - 1; i > 0; i--) {
      const potentialPrefix = nameParts[i - 1].toLowerCase();
      const fullSurnameCandidate = nameParts.slice(i - 1).join(" ");

      // If the prefix is part of the surname (e.g., "Le Guin")
      if (integralPrefixes.includes(potentialPrefix)) {
        surname = fullSurnameCandidate;
        break;
      }

      // If we find an ignorable prefix, we stop and return the next part as surname
      else if (ignorePrefixes.includes(potentialPrefix)) {
        surname = nameParts[i];
        break;
      }
    }

    return surname.toLowerCase();
  };

  const dateSort: SortFunction<string> = (
    read_end_date_string: string | null,
    book?: BookWithBookshelvesInterface
  ) => {
    if (book === undefined) {
      console.log("Can't sort by date as book is undefined");
      return null;
    }
    // If there is a start date, but no end date, the end
    // should be "today" for proper sorting
    if (!read_end_date_string) {
      if (book.read_start_date) {
        return new Date();
      }
      return null;
    }
    return new Date(read_end_date_string);
  };

  const sortFunctions: Record<string, SortFunction<any>> = {
    author: surnameSort as SortFunction<string>,
    read_end_date: dateSort as SortFunction<string>,
  };

  const mapValueToSortable = (
    key: string,
    value: string | number | null,
    book: BookWithBookshelvesInterface
  ) => {
    // We've defined no specific sorting function for the value
    if (!(key in sortFunctions)) {
      return value;
    }
    return sortFunctions[key](value, book);
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
              const sortKey = sort as keyof SortableBookProperties;
              const directionModifier = sortDirection === "ascending" ? 1 : -1;
              if (
                bookA[sortKey] === undefined ||
                bookB[sortKey] === undefined
              ) {
                return 0;
              }
              // If the value is null, we essentially remove it from the
              // order by placing it at the very end with either 0 or Infinity
              // depending on sort direction
              let nullPosition = Infinity;
              if (directionModifier === -1) {
                nullPosition = 0;
              }
              const bookAMappedValue = mapValueToSortable(
                sortKey,
                bookA[sortKey],
                bookA
              );
              const bookAComparison = bookAMappedValue
                ? bookAMappedValue
                : nullPosition;
              const bookBMappedValue = mapValueToSortable(
                sortKey,
                bookB[sortKey],
                bookB
              );
              const bookBComparison = bookBMappedValue
                ? bookBMappedValue
                : nullPosition;
              if (bookAComparison < bookBComparison) {
                return -1 * directionModifier;
              } else if (bookAComparison > bookBComparison) {
                return 1 * directionModifier;
              }
              // A and B are equal
              return 0;
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
