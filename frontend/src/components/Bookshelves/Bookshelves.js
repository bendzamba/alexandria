import React, { useState, useEffect } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Bookshelf from './Bookshelf';
import { GetBookshelves } from '../../services/bookshelves'

function Bookshelves() {
  const [bookshelves, setBookshelves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await GetBookshelves();
        setBookshelves(data);
      } catch (error) {
        console.error('Error fetching bookshelves:', error);
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
    <Container>
      <Row>
        <Col><h2>Bookshelves</h2></Col>
      </Row>
      <Row className="mt-3 mb-3">
        {bookshelves.map((shelf) => (
          <Bookshelf
            id={shelf.id}
            title={shelf.title}
            description={shelf.description}
          />
        ))}
      </Row>
    </Container>
  );
}

// async function Bookshelves() {
//   console.log('about to get');
//   let bookshelves = await GetBookshelves()
//   console.log('bookshelves');
//   console.log(bookshelves);
//   // const bookshelves = [
//   //   { id: 1, title: 'Banned Books', description: 'The ones they dont want you to read' },
//   //   { id: 2, title: 'Classics', description: 'Classic literature from around the world' },
//   //   // Add more books as needed
//   // ];
//   return (
//     <>
//       <Row class="mt-4 mb-4">
//         <Col><h2>Bookshelves</h2></Col>
//       </Row>
//       <Row>
//           <Bookshelf class="mt-2" key={bookshelves[0].id} title={bookshelves[0].title} description={bookshelves[0].description} />
//       </Row>
//     </>
//   );
// }

export default Bookshelves;
