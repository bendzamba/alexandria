import React, { useEffect, useState, useCallback } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import { GetBook, DeleteBook } from '../../services/books'
import Container from 'react-bootstrap/esm/Container';
import {confirm} from 'react-bootstrap-confirmation';

function Book({ bookId = null, preview = false }) {

  const useParamsId = useParams();
  const id = bookId || useParamsId.id;
  const [cover, setCover] = useState('');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [year, setYear] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchBook = useCallback(async () => {
    try {
      const data = await GetBook(id);
      setTitle(data.title);
      setAuthor(data.author);
      setYear(data.year);
      setCategory(data.category);
      setCover(data.cover_image);
    } catch (error) {
      console.error('Error fetching book:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    navigate(`/books/update/` + id);
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    const result = await confirm('Are you sure you want to delete this book?');
    if (result) {
      await DeleteBook(id);
      navigate(`/books/`);
    }
  };

  useEffect(() => {
    fetchBook();
  }, [fetchBook]);

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
            <button type="button" className="btn btn-primary" onClick={handleUpdate}>Update</button>
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
            <img src={cover} className="img-fluid" alt="Book Cover" />
          </NavLink>
        </Col>
        <Col xs={9}>
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
    </Container>
  );
}

export default Book;