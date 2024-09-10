import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Books from "../../components/books/Books";

test("displays book search, filter and sort tools", async () => {
  render(
    <BrowserRouter>
      <Books />
    </BrowserRouter>
  );

  const searchInput = await screen.findByLabelText("Search...");
  expect(searchInput).toBeInTheDocument();

  const sortByDropdown = await screen.findByLabelText("Sort by");
  expect(sortByDropdown).toBeInTheDocument();

  const filterByReadStatusDropdown = await screen.findByLabelText("Filter");
  expect(filterByReadStatusDropdown).toBeInTheDocument();

  const sortDirectionButton = screen.getByRole("button", {
    name: "Sort",
  });
  expect(sortDirectionButton).toBeInTheDocument();
});

test("loads and displays books from the API", async () => {
  render(
    <BrowserRouter>
      <Books />
    </BrowserRouter>
  );

  // First book properties
  const firstBookTitle = await screen.findByText(/The Grapes of Wrath/i);
  const firstBookAuthor = await screen.findByText(/John Steinbeck/i);
  const firstBookYear = await screen.findByText(/1939/i);
  const firstBookImage = await screen.findByAltText(
    /The Grapes of Wrath: Book Cover/i
  );
  expect(firstBookTitle).toBeInTheDocument();
  expect(firstBookAuthor).toBeInTheDocument();
  expect(firstBookYear).toBeInTheDocument();
  expect(firstBookImage).toBeInTheDocument();

  // Second book properties
  const secondBookTitle = await screen.findByText(/Crime and Punishment/i);
  const secondBookAuthor = await screen.findByText(/Fyodor Dostoevsky/i);
  const secondBookYear = await screen.findByText(/1866/i);
  const secondBookImage = await screen.findByAltText(
    /Crime and Punishment: Book Cover/i
  );
  expect(secondBookTitle).toBeInTheDocument();
  expect(secondBookAuthor).toBeInTheDocument();
  expect(secondBookYear).toBeInTheDocument();
  expect(secondBookImage).toBeInTheDocument();

  // For some reason getByRole was not working for the star ratings
  // This feels like a more brittle approach, but it works
  const fiveStarRatings = screen.getAllByLabelText(/5 Stars/i);
  const fourStarRatings = screen.getAllByLabelText(/4 Stars/i);

  // The order of the books is dependent on the default sort
  // It is currently `title`, thus our second book from the API being first
  expect(fourStarRatings[0]).toBeChecked(); // 0 = first book
  expect(fiveStarRatings[1]).toBeChecked(); // 1 = second book
});
