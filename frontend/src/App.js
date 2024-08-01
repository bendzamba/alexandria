import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import './App.css';
import Bookshelves from './components/Bookshelves/Bookshelves';

function App() {
  return (
    <Container>
      <Row>
        <Col>
          <h1 class="display-2">Welcome to your Book Case</h1>
        </Col>
      </Row>
      <Bookshelves></Bookshelves>
    </Container>
  );
}

export default App;
