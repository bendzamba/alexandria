import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreateBookshelf as CreateBookshelfService } from "../../services/bookshelves";
import { CreateOrUpdateBookshelfInterface } from "../../interfaces/book_and_bookshelf";

function CreateBookshelf() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const bookshelfData: CreateOrUpdateBookshelfInterface = {
      title,
      description
    }
    const response = await CreateBookshelfService(bookshelfData);
    if (!response) {
      // A message to the user may be warranted here
      // Especially if we are going to prevent navigation
      return false;
    }
    setTitle("");
    setDescription("");
    navigate(`/`);
  };

  return (
    <div className="container mt-4">
      <h2>Create Bookshelf</h2>
      <form onSubmit={handleSubmit}>
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
          Create
        </button>
      </form>
    </div>
  );
}

export default CreateBookshelf;
