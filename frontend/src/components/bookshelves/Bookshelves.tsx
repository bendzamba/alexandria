import React, { useState, useEffect } from "react";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import Bookshelf from "./Bookshelf";
import { GetBookshelves } from "../../services/bookshelves";
import { BookshelfInterface } from "../../interfaces/book_and_bookshelf";

function Bookshelves() {
  const [bookshelves, setBookshelves] = useState<BookshelfInterface[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data: BookshelfInterface[] | boolean = await GetBookshelves();
        if (typeof data == "boolean") {
          return false;
        }
        setBookshelves(data);
      } catch (error) {
        console.error("Error fetching bookshelves:", error);
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
      {bookshelves.map((bookshelf) => (
        <Row
          className="mt-3 mb-3"
          style={{ "minHeight": "250px" }}
          key={bookshelf.id}
        >
          <Bookshelf bookshelfId={bookshelf.id} preview={true} />
        </Row>
      ))}
    </Container>
  );
}

export default Bookshelves;
