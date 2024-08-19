import React, { useEffect, useState, useCallback } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import { GetBook, DeleteBook, UpdateBook } from '../../services/books'
import Container from 'react-bootstrap/esm/Container';
import {confirm} from 'react-bootstrap-confirmation';
import { SearchBookByTitle } from '../../services/books';

function Book({ bookId = null, preview = false }) {

  const useParamsId = useParams();
  const id = bookId || useParamsId.id;
  const [coverUri, setCoverUri] = useState('');
  const [savedCoverUri, setSavedCoverUri] = useState('');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [year, setYear] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(false);
  const [olid, setOlid] = useState([]);
  const [savedOlid, setSavedOlid] = useState([]);
  const [olids, setOlids] = useState([]);
  const navigate = useNavigate();

  const fetchBook = useCallback(async () => {
    try {
      const data = await GetBook(id);
      setTitle(data.title);
      setAuthor(data.author);
      setYear(data.year);
      setCategory(data.category);
      setOlid(data.olid);
      setSavedOlid(data.olid);
      setCoverUri(data.cover_uri);
      setSavedCoverUri(data.cover_uri);
    } catch (error) {
      console.error('Error fetching book:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleChangeCover = async (e) => {
    e.preventDefault();
    setSearching(true);

    let response = await SearchBookByTitle(title);

    setSearching(false);
    setSearchResults(true);
    setOlids(response.olids);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    await UpdateBook(id, { title, author, year, category, olid });

    setSearchResults(false);
    setOlids([]);
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    const result = await confirm('Are you sure you want to delete this book?');
    if (result) {
      await DeleteBook(id);
      navigate(`/books/`);
    }
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

  const toggleBookCoverSelection = async (e, olidToToggle) => {
    e.preventDefault();
    const localOlid = olid === olidToToggle ? savedOlid : olidToToggle;
    setOlid(localOlid);
    if (olid === olidToToggle) {
      setCoverUri(savedCoverUri)
    } else {
      setCoverUri('https://covers.openlibrary.org/b/olid/' + olidToToggle + '-L.jpg');
    }
  };

  useEffect(() => {
    fetchBook();
  }, [fetchBook]);

  useEffect(() => {
    // pass
  }, [olids])

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Container>
      { ! preview && (
        <Row className="mt-4 mb-4 align-items-center" style={{ 'borderBottom': '3px solid black'}}>
          <Col xs={9}>
            <div>
              <h1 className="display-5 pull-left">{title}</h1>
            </div>
          </Col>
          <Col xs={3} style={{
            textAlign:"right"
          }}>
            { ! searchResults && (
              <button type="button" className="btn btn-primary" onClick={handleChangeCover}>Change Cover</button>
            )}
            { searchResults && (
              <button type="button" className="btn btn-primary" onClick={handleUpdate}>Update</button>
            )}
            <button type="button" className="btn btn-danger ms-1" onClick={handleDelete}>Delete</button>
          </Col>
        </Row>
      )}
      <Row>
        <Col xs={ preview ? 12 : (olids && olids.length > 0 ? 8 : 12)}>
          <Row>
            <Col className={ ! preview ? 'col-auto' : '' } xs={ preview ? 3 : null}>
              <NavLink 
                className="nav-link" 
                to={"/books/" + id}
              >
                <img src={coverUri} className="img-fluid" alt="Book Cover" />
              </NavLink>
            </Col>
            <Col className={ ! preview ? 'col-auto' : '' } xs={ preview ? 9 : null }>
              { preview && (
                <NavLink 
                  className="nav-link" 
                  to={"/books/" + id}
                >
                  <div>
                    <span><strong>{title}</strong></span>
                  </div>
                </NavLink>
              )}
              <div>  
                { preview && (
                  <span className="text-secondary">
                    <small>{author}</small>
                  </span>
                )}
                { ! preview && (
                  <h3>
                    {author}
                  </h3>
                )}
              </div>
              <div>
                { preview && (
                  <span>
                    <small>{year}</small>
                  </span>
                )}
                { ! preview && (
                  <h5>
                    {year}
                  </h5>
                )}
              </div>
              <div>
                { preview && (
                  <span>
                    <small>{category}</small>
                  </span>
                )}
                { ! preview && (
                  <h6>
                    {category}
                  </h6>
                )}
              </div>
            </Col>
          </Row>
        </Col>
        { olids && olids.length > 0 && (
          <>
            <Col xs={4}>
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
                  />
                </Col>
              ))}
              </Row>  
            </Col>
          </>
        )}
      </Row>
    </Container>
  );
}

export default Book;