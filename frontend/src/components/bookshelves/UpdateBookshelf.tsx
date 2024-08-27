import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BookshelfWithBooksInterface } from "../../interfaces/book_and_bookshelf";
import {
  GetBookshelf as GetBookshelfService,
  UpdateBookshelf as UpdateBookshelfService,
} from "../../services/bookshelves";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";

function UpdateBookshelf() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // get ID from path using react-router
  const { id } = useParams();

  const bookshelfId = id;
  let _bookshelfId = 0;
  if (bookshelfId) {
    _bookshelfId = parseInt(bookshelfId);
  }

  useEffect(() => {
    const fetchBookshelf = async () => {
      if (!_bookshelfId) {
        return;
      }
      const bookshelf: BookshelfWithBooksInterface | boolean =
        await GetBookshelfService(_bookshelfId);
      if (typeof bookshelf == "boolean") {
        // A message to the user may be warranted here
        return false;
      }
      setTitle(bookshelf.title);
      setDescription(bookshelf.description);
      setLoading(false);
    };

    void fetchBookshelf();
  }, [_bookshelfId]);

  const handleSubmit = async () => {
    const response: boolean = await UpdateBookshelfService(_bookshelfId, {
      title,
      description,
    });
    if (!response) {
      // A message to the user may be warranted here
      return false;
    }
    // not sure if I need this
    setTitle("");
    setDescription("");
    navigate(`/bookshelves/` + _bookshelfId.toString());
  };

  const handleSubmitClick = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleSubmit();
  };

  const handleCancel = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setTitle("");
    setDescription("");
    navigate(`/bookshelves/` + _bookshelfId.toString());
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <h2>Update Bookshelf</h2>
        </Col>
      </Row>
      <form onSubmit={handleSubmitClick}>
        <div className="mb-3">
          <label htmlFor="title" className="form-label">
            Title
          </label>
          <input
            type="text"
            className="form-control"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <input
            type="text"
            className="form-control"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Update
        </button>
        <button
          type="button"
          className="btn btn-danger ms-1"
          onClick={handleCancel}
        >
          Cancel
        </button>
      </form>
    </Container>
  );
}

export default UpdateBookshelf;
