import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import CreateBook from "../../components/books/CreateBook";
import userEvent from "@testing-library/user-event";

test("creates a book from multiple search results", async () => {
  // Required for MSW to be able to monitor the request
  const fetchSpy = jest.spyOn(global, "fetch");

  render(
    <BrowserRouter>
      <CreateBook />
    </BrowserRouter>
  );

  // We start with only a search prompt
  const searchInput = await screen.findByLabelText("Search for a title");
  expect(searchInput).toBeInTheDocument();

  const searchButton = await screen.findByText("Search");
  expect(searchButton).toBeInTheDocument();

  // We search
  await userEvent.type(searchInput, "Farewell to Arms");
  await userEvent.click(searchButton);

  // Verify that search API call happens
  await waitFor(() => {
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.REACT_APP_API_URL}/books/search/Farewell to Arms`,
      {}
    );
  });

  // We receive and display multiple search results
  const selectFromMultipleText = await screen.findByText(
    "Please select from the multiple results found"
  );
  expect(selectFromMultipleText).toBeInTheDocument();

  // First book choice
  const firstResultTitle = await screen.findByText("A Farewell to Arms");
  expect(firstResultTitle).toBeInTheDocument();

  const firstResultAuthor = await screen.findByText("Ernest Hemingway");
  expect(firstResultAuthor).toBeInTheDocument();

  const firstResultYear = await screen.findByText("1929");
  expect(firstResultYear).toBeInTheDocument();

  const firstResultImage = await screen.findByAltText("Book to choose from 0");
  expect(firstResultImage).toBeInTheDocument();

  // Second book choice
  const secondResultTitle = await screen.findByText("An Armful of Farewells");
  expect(secondResultTitle).toBeInTheDocument();

  const secondResultAuthor = await screen.findByText("Errol Wellinghay");
  expect(secondResultAuthor).toBeInTheDocument();

  const secondResultYear = await screen.findByText("1931");
  expect(secondResultYear).toBeInTheDocument();

  const secondResultImage = await screen.findByAltText("Book to choose from 1");
  expect(secondResultImage).toBeInTheDocument();

  // We select the first book option
  const firstResultClickableDiv = await screen.findByLabelText(
    "Book to choose from 0"
  );
  await userEvent.click(firstResultClickableDiv);

  // The book, and its cover choices, show up for finalization
  const searchResultsHeader = await screen.findByText("Search Results");
  expect(searchResultsHeader).toBeInTheDocument();

  const createButton = await screen.findByText("Create");
  expect(createButton).toBeInTheDocument();

  const imagePlaceholder = await screen.findByAltText("Selected Book Cover");
  expect(imagePlaceholder).toBeInTheDocument();

  const selectedBookTitle = await screen.findByTestId("selected-book-title");
  expect(selectedBookTitle).toBeInTheDocument();
  expect(selectedBookTitle).toHaveTextContent("A Farewell to Arms");

  const selectedBookAuthor = await screen.findByTestId("selected-book-author");
  expect(selectedBookAuthor).toBeInTheDocument();
  expect(selectedBookAuthor).toHaveTextContent("Ernest Hemingway");

  const selectedBookYear = await screen.findByTestId("selected-book-year");
  expect(selectedBookYear).toBeInTheDocument();
  expect(selectedBookYear).toHaveTextContent("1929");

  const selectedBookAvailableCover1 = await screen.findByAltText(
    "Available Book Cover 0"
  );
  expect(selectedBookAvailableCover1).toBeInTheDocument();

  // We select the first of the available cover images
  await userEvent.click(selectedBookAvailableCover1);

  // We create the book
  await userEvent.click(createButton);

  // Verify that create API call happens
  await waitFor(() => {
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.REACT_APP_API_URL}/books/`,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          read_status: "not_read", // Default value
          title: "A Farewell to Arms",
          author: "Ernest Hemingway",
          year: 1929,
          olid: "OL24206828M",
          olids: '["OL24206828M","OL32992800M","OL32596124M"]',
        }),
      })
    );
  });

  fetchSpy.mockRestore(); // Restore fetch after test
});
