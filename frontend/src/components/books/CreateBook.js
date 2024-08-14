import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'
import { CreateBook as CreateBookService, GetBookCategories } from '../../services/books';

function CreateBook() {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [year, setYear] = useState('');
  const [category, setCategory] = useState('');
  const [availableCategories, setAvailableCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await CreateBookService({ title, author, year, category });
    setTitle('');
    setAuthor('');
    setYear('');
    setCategory('');
    navigate(`/books/`);
  };

  const handleCancel = async (e) => {
    e.preventDefault();
    setTitle('');
    setAuthor('');
    setYear('');
    setCategory('');
    navigate(`/books/`);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await GetBookCategories();
        console.log('this is the category data: ', data);
        setAvailableCategories(data);
      } catch (error) {
        console.error('Error fetching book categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mt-4">
      <h2>Create Book</h2>
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
          <label htmlFor="author" className="form-label">Author</label>
          <input
            type="text"
            className="form-control"
            id="author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="year" className="form-label">Year</label>
          <input
            type="text"
            className="form-control"
            id="year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="category" className="form-label">Category</label>
          <select 
            className="form-select form-control"
            id="category" 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
           >
            <option selected></option>
            {availableCategories.map((category) => (
                <option value={category}>{category}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-primary">Create</button>
        <button type="button" className="btn btn-danger ms-1" onClick={handleCancel}>Cancel</button>
      </form>
    </div>
  );
}

export default CreateBook;
