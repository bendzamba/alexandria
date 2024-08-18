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
  const [category, setCategory] = useState('Literary Fiction');
  const [cover_olid, setCover_olid] = useState('');
  const [availableCategories, setAvailableCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [editionKeys, setEditionKeys] = useState([]);
  const [coverUrl, setCoverUrl] = useState('');
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearching(true);
    setSearchResults(false);
    setNoResults(false);
    setAuthor('');
    setYear('');
    setEditionKeys([]);
    setCoverUrl('');
    setCover_olid('');

    let response = await SearchBookByTitle(title);

    setSearching(false);

    if (Object.keys(response).length === 0 && response.constructor === Object) {
      setNoResults(true);
      return;
    }

    setSearchResults(true);
    setAuthor(response.author_name);
    setYear(response.first_publish_year);
    setEditionKeys(response.edition_keys);
    setCoverUrl('/assets/cover_images/Select_A_Book_Cover.png')
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    await CreateBookService({ title, author, year, cover_olid, category });
    setTitle('');
    setAuthor('');
    setYear('');
    setCategory('');
    setCover_olid('');
    navigate(`/books/`);
  };

  const handleCancel = async (e) => {
    e.preventDefault();
    setTitle('');
    setAuthor('');
    setYear('');
    setCategory('');
    setCover_olid('');
    navigate(`/books/`);
  };

  const imageOnload = async (event, editionKey) => {
    const img = event.target;
    // Images returned from Open Library that are 'blank' seem to render as 1x1s
    if (img.naturalWidth === 1 || img.naturalHeight === 1) {
      setEditionKeys(prevEditionKeys => {
        return prevEditionKeys.filter(item => {
          return item !== editionKey;
        })
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await GetBookCategories();
        setAvailableCategories(data);
      } catch (error) {
        console.error('Error fetching book categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (editionKeys.length === 0) {
      setCoverUrl('/assets/cover_images/No_Image_Available.png');
    }
  }, [editionKeys])

  const toggleBookSelection = async (e, bookToToggle) => {
    e.preventDefault();
    const localCoverOlid = cover_olid === bookToToggle ? '' : bookToToggle;
    setCover_olid(localCoverOlid);
    if (cover_olid === bookToToggle) {
      setCoverUrl('/assets/cover_images/Select_A_Book_Cover.png')
    } else {
      setCoverUrl('https://covers.openlibrary.org/b/olid/' + bookToToggle + '-L.jpg');
    }
  };

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

      { noResults && (
        <Row className='mt-4'>
          <h4>No Results Found. Please Try Another Search.</h4>
        </Row>
      )}

      { searchResults && (
        <>
          <Row className="mt-4 mb-4 align-items-center" style={{ 'borderBottom': '3px solid black'}}>
            <Col x3={9}>
              <div>
                <h1 className="display-5 pull-left">Search Results</h1>
              </div>
            </Col>
            <Col xs={3} style={{
              textAlign:"right"
            }}>
              <button type="button" className="btn btn-primary" onClick={handleCreate}>Create</button>
            </Col>
          </Row>
          <Row>
            <Col xs={3}>
              <img src={coverUrl} className="img-fluid" alt="Book Cover" height="300px"/>
            </Col>
            <Col xs={3}>
              <div>
                <h2>{title}</h2>
              </div>
              <div>
                <h4>{author}</h4>
              </div>
              <div>
                <h6>{year}</h6>
              </div>
            </Col>
            { editionKeys && editionKeys.length > 0 && (
              <>
                <Col xs={6}>
                  <Row style={{ maxHeight: '500px', overflow: 'scroll', border: '1px solid grey', borderRadius: '.375em' }}>
                  { editionKeys.map((editionKey) => (
                    <Col key={editionKey} className={"m-2"}>
                      {/* index >= editionKey.length - (editionKey.length % 9) ? "m-2 col-auto" :  */}
                      <img 
                        src={'https://covers.openlibrary.org/b/olid/' + editionKey + '-M.jpg'} 
                        style={{ height: '150px', boxSizing: 'border-box', padding: '2px' }} 
                        onLoad={(event) => imageOnload(event, editionKey)} 
                        onClick={(event) => toggleBookSelection(event, editionKey)} 
                        className={`border border-2 ${cover_olid === editionKey ? 'border-primary' : 'border-light' }`}
                        alt='Book Cover'
                      />
                    </Col>
                  ))}
                  </Row>  
                </Col>
              </>
            )}
          </Row>
        </>
      )}
      
      

    </Container>
  );
}

export default CreateBook;
