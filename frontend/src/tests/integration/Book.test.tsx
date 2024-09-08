import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import Book from "../../components/books/Book";
import {
  BookWithBookshelvesInterface,
  CreateOrUpdateBookInterface,
} from "../../interfaces/book_and_bookshelf";
import dotenv from "dotenv";
dotenv.config({ path: ".env.development" });

const book: BookWithBookshelvesInterface = {
  id: 1,
  title: "The Grapes of Wrath",
  author: "John Steinbeck",
  year: 1939,
  olid: "OL14994208M",
  olids: '["OL14994208M","OL46855753M","OL13890061M","OL7641090M"]',
  cover_uri: "/images/OL14994208M.jpg",
  read_status: "read",
  read_start_date: "2022-02-13T05:00:00.000Z",
  read_end_date: "2022-02-21T05:00:00.000Z",
  rating: 5,
  review: "I liked it!",
  bookshelves: [],
};

const checkEditSaved = async (body: Partial<CreateOrUpdateBookInterface>) => {
  return await waitFor(() => {
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.REACT_APP_API_URL}/books/1`,
      expect.objectContaining({
        method: "PATCH",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(body),
      })
    );
  });
};

test("displays book metadata", async () => {
  render(
    <BrowserRouter>
      <Book book={book} />
    </BrowserRouter>
  );

  const bookTitle = await screen.findByText(/The Grapes of Wrath/i);
  const bookAuthor = await screen.findByText(/John Steinbeck/i);
  const bookYear = await screen.findByText(/1939/i);
  const bookImage = await screen.findByAltText(
    /The Grapes of Wrath: Book Cover/i
  );
  const bookRating = screen.getByLabelText(/5 Stars/i);
  expect(bookTitle).toBeInTheDocument();
  expect(bookAuthor).toBeInTheDocument();
  expect(bookYear).toBeInTheDocument();
  expect(bookImage).toBeInTheDocument();
  expect(bookRating).toBeChecked();

  const datepicker = await screen.findByText("Feb 13, 2022 - Feb 21, 2022");
  expect(datepicker).toBeInTheDocument();

  expect(
    (screen.getByRole("option", { name: "Read" }) as HTMLOptionElement).selected
  ).toBe(true);

  const bookReview = screen.getByTestId("book-review-content-editable");
  expect(bookReview.textContent).toBe("I liked it!");
});

test("edits book title", async () => {
  const bookToEdit = { ...book };
  // Truncated spelling, needs to be fixed
  bookToEdit.title = "The Grapes of Wra";

  // Required for MSW to be able to monitor the request
  const fetchSpy = jest.spyOn(global, "fetch");

  render(
    <BrowserRouter>
      <Book book={bookToEdit} />
    </BrowserRouter>
  );

  // Our `contenteditable` title <div>
  const bookTitle = screen.getByTestId("book-title-content-editable");

  /* Testing blur */

  // Complete the title
  await userEvent.type(bookTitle, "th");
  // Clicking on the body should blur the element, triggering the onBlue handler
  await userEvent.click(document.body);
  // Completed title should be saved
  await checkEditSaved({ title: "The Grapes of Wrath" });

  /* Testing {Enter} press */

  // Complete the title (unclear currently why previous edit isn't preserved here)
  await userEvent.type(bookTitle, "th");
  // Hitting the `enter` or `return` key should trigger the blur event
  await userEvent.keyboard("{Enter}");
  // Completed title should be saved
  await checkEditSaved({ title: "The Grapes of Wrath" });

  fetchSpy.mockRestore(); // Restore fetch after test
});

test("edits book author", async () => {
  const bookToEdit = { ...book };

  // Truncated spelling, needs to be fixed
  bookToEdit.author = "John Stein";

  // Required for MSW to be able to monitor the request
  const fetchSpy = jest.spyOn(global, "fetch");

  render(
    <BrowserRouter>
      <Book book={bookToEdit} />
    </BrowserRouter>
  );

  // Our `contenteditable` author <div>
  const bookAuthor = screen.getByTestId("book-author-content-editable");

  /* Testing blur */

  // Complete the author
  await userEvent.type(bookAuthor, "beck");
  // Clicking on the body should blur the element, triggering the onBlue handler
  await userEvent.click(document.body);
  // Completed author should be saved
  await checkEditSaved({ author: "John Steinbeck" });

  /* Testing {Enter} press */

  // Complete the author (unclear currently why previous edit isn't preserved here)
  await userEvent.type(bookAuthor, "beck");
  // Hitting the `enter` or `return` key should trigger the blur event
  await userEvent.keyboard("{Enter}");
  // Completed author should be saved
  await checkEditSaved({ author: "John Steinbeck" });

  fetchSpy.mockRestore(); // Restore fetch after test
});

test("edits book year", async () => {
  const bookToEdit = { ...book };

  // Truncated spelling, needs to be fixed
  bookToEdit.year = 193;

  // Required for MSW to be able to monitor the request
  const fetchSpy = jest.spyOn(global, "fetch");

  render(
    <BrowserRouter>
      <Book book={bookToEdit} />
    </BrowserRouter>
  );

  // Our `contenteditable` year <div>
  const bookYear = screen.getByTestId("book-year-content-editable");

  /* Testing blur */

  // Complete the year
  await userEvent.type(bookYear, "9");
  // Clicking on the body should blur the element, triggering the onBlue handler
  userEvent.click(document.body);
  // Completed year should be saved
  await checkEditSaved({ year: 1939 });

  /* Testing {Enter} press */

  // Complete the year (unclear currently why previous edit isn't preserved here)
  await userEvent.type(bookYear, "9");
  // Hitting the `enter` or `return` key should trigger the blur event
  await userEvent.keyboard("{Enter}");
  // Completed year should be saved
  await checkEditSaved({ year: 1939 });

  fetchSpy.mockRestore(); // Restore fetch after test
});

test("edits book review", async () => {
  const bookToEdit = { ...book };

  // Required for MSW to be able to monitor the request
  const fetchSpy = jest.spyOn(global, "fetch");

  render(
    <BrowserRouter>
      <Book book={bookToEdit} />
    </BrowserRouter>
  );

  // Our `contenteditable` year <div>
  const bookReview = screen.getByTestId("book-review-content-editable");

  // Add to the review
  await userEvent.type(bookReview, " A lot!");

  // Our `update` button
  const reviewUpdateButton = await screen.findByText("Update Review");

  // Should be visible now that we are editing the review
  expect(reviewUpdateButton).toBeInTheDocument();

  // Click `update`
  await userEvent.click(reviewUpdateButton);

  // Should be removed now that we're done editing
  expect(reviewUpdateButton).not.toBeInTheDocument();

  // New review should be saved
  await checkEditSaved({ review: "I liked it! A lot!" });

  fetchSpy.mockRestore(); // Restore fetch after test
});

test("edits book rating", async () => {
  const bookToEdit = { ...book };

  // Required for MSW to be able to monitor the request
  const fetchSpy = jest.spyOn(global, "fetch");

  render(
    <BrowserRouter>
      <Book book={bookToEdit} />
    </BrowserRouter>
  );

  const newBookRating = screen.getByLabelText(/4 Stars/i); // Was 5 stars

  await userEvent.click(newBookRating);

  // New review should be saved
  await checkEditSaved({ rating: 4 });

  fetchSpy.mockRestore(); // Restore fetch after test
});

test("edits book read status", async () => {
  const bookToEdit = { ...book };

  // Required for MSW to be able to monitor the request
  const fetchSpy = jest.spyOn(global, "fetch");

  render(
    <BrowserRouter>
      <Book book={bookToEdit} />
    </BrowserRouter>
  );

  // Our read status select dropdown
  const select = screen.getByLabelText("Status");

  // Change from read to not read
  await userEvent.selectOptions(select, ["not_read"]);

  // New read status should be saved. Reading dates should be nullified due to selecting 'not read'
  await checkEditSaved({
    read_status: "not_read",
    read_start_date: null,
    read_end_date: null,
  });

  // Change from not read to read
  await userEvent.selectOptions(select, ["read"]);

  // New read status should be saved. No implicit reading dates
  await checkEditSaved({ read_status: "read" });

  fetchSpy.mockRestore(); // Restore fetch after test
});

test("edits book reading dates", async () => {
  const bookToEdit = { ...book };

  // Required for MSW to be able to monitor the request
  const fetchSpy = jest.spyOn(global, "fetch");

  render(
    <BrowserRouter>
      <Book book={bookToEdit} />
    </BrowserRouter>
  );

  // Our datepicker button
  const datepicker = screen.getByTestId("reading-dates-selection");

  await userEvent.click(datepicker);

  // Wait for the datepicker to 'open' and then find dates we know will be
  // rendered into the DOM, based on proximity to our original selected dates
  await waitFor(() => {
    const startDateToSelect = screen.getByLabelText(
      "Choose Sunday, January 30th, 2022"
    );
    userEvent.click(startDateToSelect);
  });

  // When start date is chosen, we should update the API with start date and null end date
  await checkEditSaved({
    read_start_date: "2022-01-30T05:00:00.000Z",
    read_end_date: null,
  });

  await waitFor(() => {
    const endDateToSelect = screen.getByLabelText(
      "Choose Saturday, February 5th, 2022"
    );
    userEvent.click(endDateToSelect);
  });

  // When end date is chosen, we should update the API with both dates
  await checkEditSaved({
    read_start_date: "2022-01-30T05:00:00.000Z",
    read_end_date: "2022-02-05T05:00:00.000Z",
  });

  fetchSpy.mockRestore(); // Restore fetch after test
});

test("edits book cover", async () => {
  const bookToEdit = { ...book };
  // Our first cover/olid is selected in our example
  // Select the second one, which has index 1 because arrays start at 0
  const newOlidIndex = 1;

  // Required for MSW to be able to monitor the request
  const fetchSpy = jest.spyOn(global, "fetch");

  render(
    <BrowserRouter>
      <Book book={bookToEdit} />
    </BrowserRouter>
  );

  const coverButton = await screen.findByText("Cover");
  expect(coverButton).toBeInTheDocument();

  await userEvent.click(coverButton);

  // Cover button should have been replaced by Update button
  const updateButton = await screen.findByText("Update");
  expect(updateButton).toBeInTheDocument();

  // Test that all alternate book covers show up
  const parsedOlids: Array<string> = JSON.parse(bookToEdit.olids);
  for (const [index, olid] of parsedOlids.entries()) {
    const cover = await screen.findByAltText(
      `Alternate Book Cover ${index.toString()}`
    );
    expect(cover).toBeInTheDocument();

    // Test that our selected cover is highlighted and the rest are not
    if (olid === bookToEdit.olid) {
      expect(cover).toHaveClass("border-primary");
    } else {
      expect(cover).toHaveClass("border-light");
    }
  }

  // Find new cover to select
  const newCover = await screen.findByAltText(
    `Alternate Book Cover ${newOlidIndex}`
  );

  // Select new cover
  await userEvent.click(newCover);

  // TODO the below doesn't work despite several attempts
  // The image does not seem to get updated to reflect the selection, and the update doesn't send our new OLID
  // await waitFor(() => {
  //   const imageWithNewCover = screen.getByTestId(`https://covers.openlibrary.org/b/olid/${parsedOlids[newOlidIndex]}-L.jpg`);
  //   expect(imageWithNewCover).toBeInTheDocument();
  // }, {
  //   timeout: 3000
  // });

  // // // Click update to submit the cover change
  // await userEvent.click(updateButton);

  // // // New olid should be saved
  // await checkEditSaved({ olid: parsedOlids[newOlidIndex] });

  fetchSpy.mockRestore(); // Restore fetch after test
});

test("deletes a book", async () => {
  const bookToEdit = { ...book };

  // Required for MSW to be able to monitor the request
  const fetchSpy = jest.spyOn(global, "fetch");

  render(
    <BrowserRouter>
      <Book book={bookToEdit} />
    </BrowserRouter>
  );

  const deleteButton = await screen.findByText("Delete");
  expect(deleteButton).toBeInTheDocument();

  await userEvent.click(deleteButton);

  // Our delete confirmation modal should fire
  expect(screen.getByRole("dialog")).toBeInTheDocument();

  // Find and verify our delete confirmation button
  const deleteConfirmationButton = await screen.findByLabelText(
    "Delete Confirmation"
  );
  expect(deleteConfirmationButton).toBeInTheDocument();

  // Confirm deletion
  await userEvent.click(deleteConfirmationButton);

  // Verify that delete API call happens
  await waitFor(() => {
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.REACT_APP_API_URL}/books/1`,
      expect.objectContaining({
        method: "DELETE",
      })
    );
  });

  fetchSpy.mockRestore(); // Restore fetch after test
});

test("cancels deleting a book with cancel button", async () => {
  const bookToEdit = { ...book };

  // Required for MSW to be able to monitor the request
  const fetchSpy = jest.spyOn(global, "fetch");

  render(
    <BrowserRouter>
      <Book book={bookToEdit} />
    </BrowserRouter>
  );

  const deleteButton = await screen.findByText("Delete");
  expect(deleteButton).toBeInTheDocument();

  await userEvent.click(deleteButton);

  // Our delete confirmation modal should fire
  const modal = screen.getByRole("dialog");
  expect(modal).toBeInTheDocument();

  // Find and verify our cancel delete button
  const cancelDeleteButton = await screen.findByLabelText("Cancel Delete");
  expect(cancelDeleteButton).toBeInTheDocument();

  // Cancel deletion
  await userEvent.click(cancelDeleteButton);

  // Modal should disappear
  expect(modal).not.toBeInTheDocument();

  fetchSpy.mockRestore(); // Restore fetch after test
});

test("cancels deleting a book with click outside modal", async () => {
  const bookToEdit = { ...book };

  // Required for MSW to be able to monitor the request
  const fetchSpy = jest.spyOn(global, "fetch");

  render(
    <BrowserRouter>
      <Book book={bookToEdit} />
    </BrowserRouter>
  );

  const deleteButton = await screen.findByText("Delete");
  expect(deleteButton).toBeInTheDocument();

  await userEvent.click(deleteButton);

  // Our delete confirmation modal should fire
  const modal = screen.getByRole("dialog");
  expect(modal).toBeInTheDocument();

  // Click outside of the modal, closing it
  await userEvent.click(document.body);

  // Modal should disappear
  waitFor(() => {
    expect(modal).not.toBeInTheDocument();
  });

  fetchSpy.mockRestore(); // Restore fetch after test
});

test("cancels deleting a book with x button", async () => {
  const bookToEdit = { ...book };

  // Required for MSW to be able to monitor the request
  const fetchSpy = jest.spyOn(global, "fetch");

  render(
    <BrowserRouter>
      <Book book={bookToEdit} />
    </BrowserRouter>
  );

  const deleteButton = await screen.findByText("Delete");
  expect(deleteButton).toBeInTheDocument();

  await userEvent.click(deleteButton);

  // Our delete confirmation modal should fire
  const modal = screen.getByRole("dialog");
  expect(modal).toBeInTheDocument();

  // Click the `X` button in the modal
  const closeButton = await screen.findByLabelText("Close");
  await userEvent.click(closeButton);

  // Modal should disappear
  waitFor(() => {
    expect(modal).not.toBeInTheDocument();
  });

  fetchSpy.mockRestore(); // Restore fetch after test
});
