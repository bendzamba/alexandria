import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'
import { CreateBook as CreateBookService, GetBookCategories, SearchBookByTitle } from '../../services/books';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';

function CreateBook() {
  const [searchTitle, setSearchTitle] = useState('');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [year, setYear] = useState('');
  const [category, setCategory] = useState('Literary Fiction');
  const [olid, setOlid] = useState('');
  const [availableCategories, setAvailableCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [olids, setOlids] = useState([]);
  const [coverUrl, setCoverUrl] = useState('');
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearching(true);
    setSearchResults(false);
    setNoResults(false);
    setAuthor('');
    setYear('');
    setOlids([]);
    setCoverUrl('');
    setOlid('');
    setTitle('');

    let response = await SearchBookByTitle(searchTitle);

    setSearching(false);

    if (Object.keys(response).length === 0 && response.constructor === Object) {
      setNoResults(true);
      return;
    }

    setSearchResults(true);
    setTitle(response.title);
    setAuthor(response.author_name);
    setYear(response.first_publish_year);
    setOlids(response.olids);
    setCoverUrl('/assets/cover_images/Select_A_Book_Cover.png')
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    await CreateBookService({ title, author, year, olid, category });
    setTitle('');
    setSearchTitle('');
    setAuthor('');
    setYear('');
    setCategory('');
    setOlid('');
    setOlids([]);
    navigate(`/books/`);
  };

  const handleCancel = async (e) => {
    e.preventDefault();
    setTitle('');
    setSearchTitle('');
    setAuthor('');
    setYear('');
    setCategory('');
    setOlid('');
    setOlids([]);
    navigate(`/books/`);
  };

  const imageOnload = async (event, olid) => {
    const img = event.target;
    // Images returned from Open Library that are 'blank' seem to render as 1x1s
    if (img.naturalWidth === 1 || img.naturalHeight === 1) {
      setOlids(prevOlids => {
        return prevOlids.filter(prevOlid => {
          return prevOlid !== olid;
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
    if (olids.length === 0) {
      setCoverUrl('/assets/cover_images/No_Image_Available.jpg');
    }
  }, [olids])

  const toggleBookCoverSelection = async (e, olidToToggle) => {
    e.preventDefault();
    const localOlid = olid === olidToToggle ? '' : olidToToggle;
    setOlid(localOlid);
    if (olid === olidToToggle) {
      setCoverUrl('/assets/cover_images/Select_A_Book_Cover.png')
    } else {
      setCoverUrl('https://covers.openlibrary.org/b/olid/' + olidToToggle + '-L.jpg');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Container className="mt-4">
      <form onSubmit={handleSearch}>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            id="searchTitle"
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
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
            { olids && olids.length > 0 && (
              <>
                <Col xs={6}>
                  <Row style={{ maxHeight: '500px', overflow: 'scroll', border: '1px solid grey', borderRadius: '.375em' }}>
                  { olids.map((map_olid) => (
                    <Col key={map_olid} className={"m-2"}>
                      <img 
                        src={'https://covers.openlibrary.org/b/olid/' + map_olid + '-M.jpg'} 
                        style={{ height: '150px', boxSizing: 'border-box', padding: '2px' }} 
                        onLoad={(event) => imageOnload(event, map_olid)} 
                        onClick={(event) => toggleBookCoverSelection(event, map_olid)} 
                        className={`border border-2 ${olid === map_olid ? 'border-primary' : 'border-light' }`}
                        alt='Book Cover'
                        loading='lazy'
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
