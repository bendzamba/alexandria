import React, { useState, useEffect } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Book from "./Book";
import { GetBooks } from "../../services/books";
import { BookInterface } from "../../interfaces/book_and_bookshelf";

function Books() {
  const [books, setBooks] = useState<BookInterface[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data: BookInterface[] = await GetBooks();
        if (!data) {
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Container>
      <Row>
        {books.map((book: BookInterface) => (
          <Col xs={4} className="mt-3 mb-3" key={`col-${book.id}`}>
            <Book bookId={book.id} preview={true} key={book.id} />
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default Books;
