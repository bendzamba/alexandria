import React, { useState } from 'react';
import { CreateBookshelf as CreateBookshelfService } from '../../services/bookshelves';

function CreateBookshelf() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await CreateBookshelfService({ title, description });
    setTitle('');
    setDescription('');
    // Optionally, you can update the parent component or redirect
  };

  return (
    <div className="container mt-4">
      <h2>Create Bookshelf</h2>
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
        <button type="submit" className="btn btn-primary">Create</button>
      </form>
    </div>
  );
}

export default CreateBookshelf;
