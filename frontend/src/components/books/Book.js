import React, { useEffect, useState, useCallback } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import { GetBook, DeleteBook, UpdateBook } from '../../services/books'
import Container from 'react-bootstrap/esm/Container';
import {confirm} from 'react-bootstrap-confirmation';
import { SearchBookByTitle } from '../../services/books';
import styles from './css/Book.module.css';

function Book({ bookId = null, preview = false }) {

  const useParamsId = useParams();
  const id = bookId || useParamsId.id;
  const [coverUri, setCoverUri] = useState('');
  const [savedCoverUri, setSavedCoverUri] = useState('');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [year, setYear] = useState('');
  const [category, setCategory] = useState('');
  const [rating, setRating] = useState('');
  const [review, setReview] = useState('');
  const [savedReview, setSavedReview] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(false);
  const [olid, setOlid] = useState([]);
  const [savedOlid, setSavedOlid] = useState([]);
  const [olids, setOlids] = useState([]);
  const navigate = useNavigate();
  const [addingReview, setAddingReview] = useState(false);
  const reviewPlaceholder = 'Share your thoughts on this book ...';

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
      setRating(data.rating);
      setReview(data.review);
      setSavedReview(data.review);
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
    await UpdateBook(id, { olid });

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

  const changeRating = async (e) => {
    const newRating = parseInt(e.target.value);
    if (rating !== newRating) {
      setRating(newRating);
      await UpdateBook(id, { rating: newRating });
    }
  };

  const editReview = async (e) => {
    const el = e.target;
    if (addingReview === false) {
      el.setAttribute('placeholder', '');
      setAddingReview(true);
    }
  }

  const changeReview = async (e) => {
    const el = document.getElementById('review');
    let newReview = el.innerHTML;
    // innerHtml will get <div> and <br> elements added by contentenditable <div>
    // swap these for newlines
    newReview = newReview.replace(/<br\s*\/?>/gi, '\n').replace(/<\/div>|<\/p>/gi, '\n').replace(/<div>|<p>/gi, '');
    if (newReview !== savedReview) {
      setReview(newReview);
      await UpdateBook(id, { review: newReview });
      setAddingReview(false);
    }
  };

  const blurReview = async (e) => {
    const el = document.getElementById('review');
    let newReview = el.innerHTML;
    newReview = newReview.replace(/<br\s*\/?>/gi, '\n').replace(/<\/div>|<\/p>/gi, '\n').replace(/<div>|<p>/gi, '');
    console.log('new review', newReview);
    if ( ! newReview || newReview === savedReview) {
      el.setAttribute('placeholder', reviewPlaceholder);
      setAddingReview(false);
    }
  };

  useEffect(() => {
    fetchBook();
  }, [fetchBook]);

  useEffect(() => {
    // pass
  }, [olids]);

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
        <Col xs={3}>
          <NavLink 
            className="nav-link" 
            to={"/books/" + id}
          >
            <img src={coverUri} className="img-fluid" alt="Book Cover" loading="lazy" />
          </NavLink>
        </Col>
        <Col className='text-truncate' xs={ olids && olids.length > 0 ? 5 : 9}>
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
          <Row>  
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
          </Row>
          <Row>
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
          </Row>
          <Row>
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
          </Row>
          <Row className='ms-auto'>
            <fieldset className={`${styles.rating} ${preview ? styles['rating-preview'] : ''}`}>
              <input type="radio" id={`star5-${id}`} name={`rating-${id}`} value="5" onClick={changeRating} checked={rating === 5} />
              <label htmlFor={`star5-${id}`}>5 stars</label>
              <input type="radio" id={`star4-${id}`} name={`rating-${id}`} value="4" onClick={changeRating} checked={rating === 4} />
              <label htmlFor={`star4-${id}`}>4 stars</label>
              <input type="radio" id={`star3-${id}`} name={`rating-${id}`} value="3" onClick={changeRating} checked={rating === 3} />
              <label htmlFor={`star3-${id}`}>3 stars</label>
              <input type="radio" id={`star2-${id}`} name={`rating-${id}`} value="2" onClick={changeRating} checked={rating === 2} />
              <label htmlFor={`star2-${id}`}>2 stars</label>
              <input type="radio" id={`star1-${id}`} name={`rating-${id}`} value="1" onClick={changeRating} checked={rating === 1} />
              <label htmlFor={`star1-${id}`}>1 star</label> 
            </fieldset>
          </Row>
          { ! preview && (
            <Row className='mt-2'>
              <Col>
                <div 
                  contentEditable="true"
                  id='review' 
                  name='review' 
                  onClick={editReview}
                  onBlur={blurReview}
                  placeholder={reviewPlaceholder}
                  className='text-secondary book-review'
                  style={{ 'minHeight': '200px', 'border': 'none', 'fontStyle': 'italic', 'outline': 'none', 'textWrap': 'wrap', 'whiteSpace': 'pre-wrap'}}
                >
                  {review}
                </div>                  
              </Col>
            </Row>
          )}
          { ! preview && addingReview && (
            <Row className='mt-2'>
              <Col>
                <button type="button" className="btn btn-sm btn-primary" onClick={changeReview}>Update Review</button>
              </Col>
            </Row>
          )}
        </Col>
        { olids && olids.length > 0 && (
          <>
            <Col xs={4}>
              <Row style={{ maxHeight: '500px', overflow: 'scroll', border: '1px solid grey', borderRadius: '.375em' }}>
              { olids.map((map_olid) => (
                <Col key={map_olid} className="m-1">
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
    </Container>
  );
}

export default Book;