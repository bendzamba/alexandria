import React, { useState, useEffect } from 'react';
import { GetBookshelf as GetBookshelfService, UpdateBookshelf as UpdateBookshelfService } from '../../services/bookshelves';

function UpdateBookshelf({ match }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  const bookshelfId = match.params.id; // Assuming you are using react-router

  useEffect(() => {
    const fetchBookshelf = async () => {
      const bookshelf = await GetBookshelfService();
      setTitle(bookshelf.title);
      setDescription(bookshelf.description);
      setLoading(false);
    };

    fetchBookshelf();
  }, [bookshelfId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await UpdateBookshelfService(bookshelfId, { title, description });
    // Optionally, you can update the parent component or redirect
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mt-4">
      <h2>Update Bookshelf</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="title" className="form-label">Title</label>
          <input
            type="text"
            className="form-control"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="description" className="form-label">Description</label>
          <input
            type="text"
            className="form-control"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary">Update</button>
      </form>
    </div>
  );
}

export default UpdateBookshelf;
