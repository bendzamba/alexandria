import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Bookshelves from "../../components/bookshelves/Bookshelves";

test("loads and displays bookshelves from the API", async () => {
  render(
    <BrowserRouter>
      <Bookshelves />
    </BrowserRouter>
  );

  // Bookshelf 1
  const bookshelfOneTitle = await waitFor(() =>
    screen.getByText(/The Great American Novel/i)
  );
  expect(bookshelfOneTitle).toBeInTheDocument();
  const bookshelfOneDescription = await waitFor(() =>
    screen.getByText(/Books that capture the essence of America/i)
  );
  expect(bookshelfOneDescription).toBeInTheDocument();
  const bookshelfOneBook = await screen.findByAltText(
    /Lonesome Dove: Book Cover/i
  );
  expect(bookshelfOneBook).toBeInTheDocument();

  // Bookshelf 2
  const bookshelfTwoTitle = await waitFor(() =>
    screen.getByText(/Science Fiction Classics/i)
  );
  expect(bookshelfTwoTitle).toBeInTheDocument();
  const bookshelfTwoDescription = await waitFor(() =>
    screen.getByText(/Masters of speculation/i)
  );
  expect(bookshelfTwoDescription).toBeInTheDocument();
  const bookshelfTwoBook = await screen.findByAltText(
    /The Left Hand of Darkness: Book Cover/i
  );
  expect(bookshelfTwoBook).toBeInTheDocument();
});
