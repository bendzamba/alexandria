import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreateBookshelf as CreateBookshelfService } from "../../services/bookshelves";
import { CreateOrUpdateBookshelfInterface } from "../../interfaces/book_and_bookshelf";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";

function CreateBookshelf() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const sort_key = "id";
  const sort_direction = "ascending";
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    // We are in the process of creating. Disable the 'Create' button
    setCreating(true);
    const bookshelfData: CreateOrUpdateBookshelfInterface = {
      title,
      description,
      sort_key,
      sort_direction,
    };
    const response: boolean = await CreateBookshelfService(bookshelfData);
    if (!response) {
      // A message to the user may be warranted here
      // Especially if we are going to prevent navigation
      setCreating(false);
      return false;
    }
    setTitle("");
    setDescription("");
    // navigate(`/`);
  };

  const handleSubmitClick = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleSubmit();
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <h2>Create Bookshelf</h2>
        </Col>
      </Row>
      <Row>
        <Col>
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
            <button
              type="submit"
              className="btn btn-primary"
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
          </form>
        </Col>
      </Row>
    </Container>
  );
}

export default CreateBookshelf;
