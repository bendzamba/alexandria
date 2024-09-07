import { render, screen, waitFor } from "@testing-library/react";
import App from "../../App";

test("loads and displays bookshelves from the API", async () => {
  render(<App />);

  // Wait for the mock data to load and appear on the screen
  const bookshelfTitle = await waitFor(() =>
    screen.getByText(/My First Bookshelf/i)
  );

  // Check if the bookshelf data is rendered correctly
  expect(bookshelfTitle).toBeInTheDocument();
});
