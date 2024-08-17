import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'
import { CreateBook as CreateBookService, GetBookCategories, SearchBookByTitle } from '../../services/books';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';

function CreateBook() {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [year, setYear] = useState('');
  const [category, setCategory] = useState('');
  const [availableCategories, setAvailableCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(false);
  const [coverEditionKey, setCoverEditionKey] = useState('');
  const [editionKey, setEditionKey] = useState([]);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearching(true);
    setAuthor('');
    setYear('');
    setCoverEditionKey('');
    setEditionKey('');
    let response = await SearchBookByTitle(title);
    setAuthor(response.author_name);
    setYear(response.first_publish_year);
    setCoverEditionKey(response.cover_edition_key);
    setEditionKey(response.edition_key);
    setSearching(false);
    setSearchResults(true);
  };

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
    <Container className="mt-4">
      {/* <h2>Create Book</h2> */}
      <form onSubmit={handleSearch}>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Search for a title..."
          />
        </div>
        <button type="submit" className="btn btn-primary">Search</button>
        <button type="button" className="btn btn-danger ms-1" onClick={handleCancel}>Cancel</button>
      </form>

      { searching && (
        <Row>
          <h4>Searching...</h4>
        </Row>
      )}

      { searchResults && (
        <>
          <Row className='mt-4'>
            <h4>Search Results</h4>
          </Row>
          <Row>
            <span>Author: {author}</span>
          </Row>
          <Row>
            <span>Year: {year}</span>
          </Row>
          <Row>
            <span>Select a cover image</span>
          </Row>
          <Row className="mt-4" style={{ maxHeight: '500px', overflow: 'scroll', border: '1px solid grey', borderRadius: '.375em' }}>
          { editionKey && (
              editionKey.map((editionKey) => (
                <Col className='mt-2'>
                  <img src={'https://covers.openlibrary.org/b/olid/' + editionKey + '-M.jpg'} style={{ height: '150px' }} />
                </Col>
              ))
          )}
          </Row>
        </>
      )}
      
      

    </Container>
  );
}

export default CreateBook;
