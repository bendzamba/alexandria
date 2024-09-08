import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Bookshelf from "../../components/bookshelves/Bookshelf";
import userEvent from "@testing-library/user-event";

test("loads and displays bookshelf", async () => {
  render(
    <BrowserRouter>
      <Bookshelf bookshelfId={1} />
    </BrowserRouter>
  );

  const title = await waitFor(() =>
    screen.getByText(/The Great American Novel/i)
  );
  expect(title).toBeInTheDocument();

  const description = await waitFor(() =>
    screen.getByText(/Books that capture the essence of America/i)
  );
  expect(description).toBeInTheDocument();

  const bookCover = await screen.findByAltText(/Lonesome Dove: Book Cover/i);
  expect(bookCover).toBeInTheDocument();

  // Verifying bookshelf controls. Should not have to re-verify these in subsequent tests.
  const addBookToBookshelfButton = await screen.findByLabelText(
    "Add Book to Bookshelf"
  );
  expect(addBookToBookshelfButton).toBeInTheDocument();

  const removeBookFromBookshelfButton = await screen.findByLabelText(
    "Remove Lonesome Dove from bookshelf"
  );
  expect(removeBookFromBookshelfButton).toBeInTheDocument();

  const updateButton = await screen.findByText("Update");
  expect(updateButton).toBeInTheDocument();

  const deleteButton = await screen.findByText("Delete");
  expect(deleteButton).toBeInTheDocument();
});

test("shows books that can be added to bookshelf", async () => {
  render(
    <BrowserRouter>
      <Bookshelf bookshelfId={1} />
    </BrowserRouter>
  );

  const addBookToBookshelfButton = await screen.findByLabelText(
    "Add Book to Bookshelf"
  );
  await userEvent.click(addBookToBookshelfButton);

  // Our modal for adding books to our bookshelf should fire
  expect(screen.getByRole("dialog")).toBeInTheDocument();

  // Find and verify our Save Changes button
  const saveChangesButton = await screen.findByLabelText(
    "Add Books to Bookshelf"
  );
  expect(saveChangesButton).toBeInTheDocument();

  // Find and verify our Cancel button
  const cancelButton = await screen.findByLabelText(
    "Cancel Adding Books to Bookshelf"
  );
  expect(cancelButton).toBeInTheDocument();

  // Find and verify our excluded book image
  const coverOfBookToAdd = await screen.findByAltText(
    /The Grapes of Wrath: Book Cover/i
  );
  expect(coverOfBookToAdd).toBeInTheDocument();
});

test("adds book to bookshelf", async () => {
  // Required for MSW to be able to monitor the request
  const fetchSpy = jest.spyOn(global, "fetch");

  render(
    <BrowserRouter>
      <Bookshelf bookshelfId={1} />
    </BrowserRouter>
  );

  const addBookToBookshelfButton = await screen.findByLabelText(
    "Add Book to Bookshelf"
  );
  await userEvent.click(addBookToBookshelfButton);

  // Find our excluded book image
  const coverOfBookToAdd = await screen.findByAltText(
    /The Grapes of Wrath: Book Cover/i
  );

  await userEvent.click(coverOfBookToAdd);

  const saveChangesButton = await screen.findByLabelText(
    "Add Books to Bookshelf"
  );

  await userEvent.click(saveChangesButton);

  waitFor(() => {
    expect(screen.getByRole("dialog")).not.toBeInTheDocument();
  });

  // Verify that delete API call happens
  await waitFor(() => {
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.REACT_APP_API_URL}/bookshelves/1/books/`,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ book_ids: [3] }),
      })
    );
  });

  fetchSpy.mockRestore(); // Restore fetch after test
});

test("removes book from bookshelf", async () => {
  // Required for MSW to be able to monitor the request
  const fetchSpy = jest.spyOn(global, "fetch");

  render(
    <BrowserRouter>
      <Bookshelf bookshelfId={1} />
    </BrowserRouter>
  );

  const removeBookFromBookshelfButton = await screen.findByLabelText(
    "Remove Lonesome Dove from bookshelf"
  );

  await userEvent.click(removeBookFromBookshelfButton);

  // Verify that delete API call happens
  await waitFor(() => {
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.REACT_APP_API_URL}/bookshelves/1/books/1`,
      expect.objectContaining({
        method: "DELETE",
      })
    );
  });

  fetchSpy.mockRestore(); // Restore fetch after test
});

test("deletes bookshelf", async () => {
  // Required for MSW to be able to monitor the request
  const fetchSpy = jest.spyOn(global, "fetch");

  render(
    <BrowserRouter>
      <Bookshelf bookshelfId={1} />
    </BrowserRouter>
  );

  const deleteButton = await screen.findByText("Delete");
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
      `${process.env.REACT_APP_API_URL}/bookshelves/1`,
      expect.objectContaining({
        method: "DELETE",
      })
    );
  });

  fetchSpy.mockRestore(); // Restore fetch after test
});

test("cancels deleting a bookshelf with cancel button", async () => {
  render(
    <BrowserRouter>
      <Bookshelf bookshelfId={1} />
    </BrowserRouter>
  );

  const deleteButton = await screen.findByText("Delete");
  await userEvent.click(deleteButton);

  // Our delete confirmation modal should fire
  const modal = screen.getByRole("dialog");
  expect(modal).toBeInTheDocument();

  // Find and verify our delete confirmation button
  const cancelDeleteButton = await screen.findByLabelText("Cancel Delete");
  expect(cancelDeleteButton).toBeInTheDocument();

  // Confirm deletion
  await userEvent.click(cancelDeleteButton);

  // Modal should disappear
  waitFor(() => {
    expect(modal).not.toBeInTheDocument();
  });
});

test("cancels deleting a bookshelf with click outside modal", async () => {
  render(
    <BrowserRouter>
      <Bookshelf bookshelfId={1} />
    </BrowserRouter>
  );

  const deleteButton = await screen.findByText("Delete");
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
});

test("cancels deleting a bookshelf with x button", async () => {
  render(
    <BrowserRouter>
      <Bookshelf bookshelfId={1} />
    </BrowserRouter>
  );

  const deleteButton = await screen.findByText("Delete");
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
});
