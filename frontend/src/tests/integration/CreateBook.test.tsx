import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import CreateBook from "../../components/books/CreateBook";
import userEvent from "@testing-library/user-event";

test("search page renders", async () => {
  render(
    <BrowserRouter>
      <CreateBook />
    </BrowserRouter>
  );

  // Start with only a search prompt
  const searchInput = await screen.findByLabelText("Search for a title");
  expect(searchInput).toBeInTheDocument();

  // ... and a search button
  const searchButton = await screen.findByText("Search");
  expect(searchButton).toBeInTheDocument();
});

test("creates a book from multiple search results", async () => {
  // Required for MSW to be able to monitor the request
  const fetchSpy = jest.spyOn(global, "fetch");

  render(
    <BrowserRouter>
      <CreateBook />
    </BrowserRouter>
  );

  // Search form
  const searchInput = await screen.findByLabelText("Search for a title");
  const searchButton = await screen.findByText("Search");
  const titleToSearch = "Farewell to Arms";

  // Search for a book
  await userEvent.type(searchInput, titleToSearch);
  await userEvent.click(searchButton);

  // Verify that search API call happens
  await waitFor(() => {
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.REACT_APP_API_URL}/books/search/${titleToSearch}`,
      {}
    );
  });

  // Receive and display multiple search results
  const selectFromMultipleText = await screen.findByText(
    "Please select from the multiple results found"
  );
  expect(selectFromMultipleText).toBeInTheDocument();

  // First book choice
  const firstResultTitle = "A Farewell to Arms";
  const firstResultTitleElement = await screen.findByText(firstResultTitle);
  expect(firstResultTitleElement).toBeInTheDocument();

  const firstResultAuthor = "Ernest Hemingway";
  const firstResultAuthorElement = await screen.findByText(firstResultAuthor);
  expect(firstResultAuthorElement).toBeInTheDocument();

  const firstResultYear = "1929";
  const firstResultYearElement = await screen.findByText(firstResultYear);
  expect(firstResultYearElement).toBeInTheDocument();

  const firstResultImageText = "Book to choose from 0";
  const firstResultImage = await screen.findByAltText(firstResultImageText);
  expect(firstResultImage).toBeInTheDocument();

  // Second book choice
  const secondResultTitle = "An Armful of Farewells";
  const secondResultTitleElement = await screen.findByText(secondResultTitle);
  expect(secondResultTitleElement).toBeInTheDocument();

  const secondResultAuthor = "Errol Wellinghay";
  const secondResultAuthorElement = await screen.findByText(secondResultAuthor);
  expect(secondResultAuthorElement).toBeInTheDocument();

  const secondResultYear = "1931";
  const secondResultYearElement = await screen.findByText(secondResultYear);
  expect(secondResultYearElement).toBeInTheDocument();

  const secondResultImage = await screen.findByAltText("Book to choose from 1");
  expect(secondResultImage).toBeInTheDocument();

  // Select the first book option
  const firstResultClickableDiv =
    await screen.findByLabelText(firstResultImageText);
  await userEvent.click(firstResultClickableDiv);

  // The book, and its cover choices, show up for finalization
  const searchResultsHeader = await screen.findByText("Search Results");
  expect(searchResultsHeader).toBeInTheDocument();

  const createButton = await screen.findByText("Create");
  expect(createButton).toBeInTheDocument();

  const imagePlaceholder = await screen.findByAltText(
    "Placeholder Book Cover: " + firstResultTitle
  );
  expect(imagePlaceholder).toBeInTheDocument();

  const selectedBookTitle = await screen.findByTestId("selected-book-title");
  expect(selectedBookTitle).toBeInTheDocument();
  expect(selectedBookTitle).toHaveTextContent(firstResultTitle);

  const selectedBookAuthor = await screen.findByTestId("selected-book-author");
  expect(selectedBookAuthor).toBeInTheDocument();
  expect(selectedBookAuthor).toHaveTextContent(firstResultAuthor);

  const selectedBookYear = await screen.findByTestId("selected-book-year");
  expect(selectedBookYear).toBeInTheDocument();
  expect(selectedBookYear).toHaveTextContent(firstResultYear);

  const selectedBookAvailableCover1 = await screen.findByAltText(
    "Available Book Cover 0"
  );
  expect(selectedBookAvailableCover1).toBeInTheDocument();

  // Select the first of the available cover images
  await userEvent.click(selectedBookAvailableCover1);

  // Check that the selected cover is now populated in the image element
  const selectedImage = await screen.findByAltText(
    "Selected Book Cover: " + firstResultTitle
  );
  expect(selectedImage).toBeInTheDocument();
  expect(selectedImage).toHaveAttribute(
    "src",
    "https://covers.openlibrary.org/b/olid/OL24206828M-L.jpg"
  );

  // Create the book
  await waitFor(() => {
    userEvent.click(createButton);
  });

  // Wait for the "Creating..." button to appear
  const creatingButton = await screen.findByText("Creating...");
  expect(creatingButton).toBeInTheDocument();

  // Button should be disabled
  expect(creatingButton).toHaveAttribute("disabled");

  // Ensure the original "Create" button is no longer present
  expect(screen.queryByText("Create")).not.toBeInTheDocument();

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
          title: firstResultTitle,
          author: firstResultAuthor,
          year: parseInt(firstResultYear),
          olid: "OL24206828M",
          olids: '["OL24206828M","OL32992800M","OL32596124M"]',
        }),
      })
    );
  });

  // Restore fetch after test
  fetchSpy.mockRestore();
});

test("creates a book from one search result", async () => {
  // Required for MSW to be able to monitor the request
  const fetchSpy = jest.spyOn(global, "fetch");

  render(
    <BrowserRouter>
      <CreateBook />
    </BrowserRouter>
  );

  // Search form
  const searchInput = await screen.findByLabelText("Search for a title");
  const searchButton = await screen.findByText("Search");

  // Search
  await userEvent.type(searchInput, "Tale of Two Cities");
  await userEvent.click(searchButton);

  // Verify that search API call happens
  await waitFor(() => {
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.REACT_APP_API_URL}/books/search/Tale of Two Cities`,
      {}
    );
  });

  // The single book, and its cover choices, show up for finalization
  const searchResultsHeader = await screen.findByText("Search Results");
  expect(searchResultsHeader).toBeInTheDocument();

  const createButton = await screen.findByText("Create");
  expect(createButton).toBeInTheDocument();

  const searchResultTitle = "A Tale of Two Cities";
  const selectedBookTitle = await screen.findByTestId("selected-book-title");
  expect(selectedBookTitle).toBeInTheDocument();
  expect(selectedBookTitle).toHaveTextContent(searchResultTitle);

  const imagePlaceholder = await screen.findByAltText(
    "Placeholder Book Cover: " + searchResultTitle
  );
  expect(imagePlaceholder).toBeInTheDocument();

  const searchResultAuthor = "Charles Dickens";
  const selectedBookAuthor = await screen.findByTestId("selected-book-author");
  expect(selectedBookAuthor).toBeInTheDocument();
  expect(selectedBookAuthor).toHaveTextContent(searchResultAuthor);

  const searchResultYear = "1859";
  const selectedBookYear = await screen.findByTestId("selected-book-year");
  expect(selectedBookYear).toBeInTheDocument();
  expect(selectedBookYear).toHaveTextContent(searchResultYear);

  const selectedBookAvailableCover1 = await screen.findByAltText(
    "Available Book Cover 0"
  );
  expect(selectedBookAvailableCover1).toBeInTheDocument();

  // Select the first of the available cover images
  await userEvent.click(selectedBookAvailableCover1);

  // Check that the selected cover is now populated in the image element
  const selectedImage = await screen.findByAltText(
    "Selected Book Cover: " + searchResultTitle
  );
  expect(selectedImage).toBeInTheDocument();
  expect(selectedImage).toHaveAttribute(
    "src",
    "https://covers.openlibrary.org/b/olid/OL52151281M-L.jpg"
  );

  // Create the book
  await waitFor(() => {
    userEvent.click(createButton);
  });

  // Wait for the "Creating..." button to appear
  const creatingButton = await screen.findByText("Creating...");
  expect(creatingButton).toBeInTheDocument();

  // Button should be disabled
  expect(creatingButton).toHaveAttribute("disabled");

  // Ensure the original "Create" button is no longer present
  expect(screen.queryByText("Create")).not.toBeInTheDocument();

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
          title: searchResultTitle,
          author: searchResultAuthor,
          year: parseInt(searchResultYear),
          olid: "OL52151281M",
          olids: '["OL52151281M","OL51503229M","OL46911647M"]',
        }),
      })
    );
  });

  fetchSpy.mockRestore(); // Restore fetch after test
});

test("handles zero search results", async () => {
  // Required for MSW to be able to monitor the request
  const fetchSpy = jest.spyOn(global, "fetch");

  render(
    <BrowserRouter>
      <CreateBook />
    </BrowserRouter>
  );

  // Search form
  const searchInput = await screen.findByLabelText("Search for a title");
  const searchButton = await screen.findByText("Search");

  // Search
  await userEvent.type(searchInput, "Potrzebie!");
  await userEvent.click(searchButton);

  // Verify that search API call happens
  await waitFor(() => {
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.REACT_APP_API_URL}/books/search/Potrzebie!`,
      {}
    );
  });

  // Ensure we've been alerted of no search results
  const noResultsMessage = await screen.findByText(
    "No Results Found. Please Try Another Search."
  );
  expect(noResultsMessage).toBeInTheDocument();

  // Restore fetch after test
  fetchSpy.mockRestore();
});
