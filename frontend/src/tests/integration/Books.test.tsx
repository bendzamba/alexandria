import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
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

test("bulk deletes multiple books", async () => {
  // Required for MSW to be able to monitor the request
  const fetchSpy = jest.spyOn(global, "fetch");

  render(
    <BrowserRouter>
      <Books />
    </BrowserRouter>
  );

  // Find Bulk Delete button
  const bulkDeleteButton = await screen.findByText("Bulk Delete");
  expect(bulkDeleteButton).toBeInTheDocument();

  // Click Bulk Delete button
  await waitFor(() => {
    userEvent.click(bulkDeleteButton);
  });

  // New action buttons should appear
  const deleteButton = await screen.findByText("Delete");
  const cancelButton = await screen.findByText("Cancel");
  expect(deleteButton).toBeInTheDocument();
  expect(cancelButton).toBeInTheDocument();

  // Bulk Delete button should be hidden
  expect(bulkDeleteButton).not.toBeInTheDocument();

  // Deletion overlays should appear
  const overlayOne = screen.getByTestId("1");
  const overlayTwo = screen.getByTestId("2");
  expect(overlayOne).toBeInTheDocument();
  expect(overlayTwo).toBeInTheDocument();

  // Click both books to highlight for deletion
  await waitFor(() => {
    userEvent.click(overlayOne);
    userEvent.click(overlayTwo);
  });

  // Click 'Delete' to delete both books
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
      `${process.env.REACT_APP_API_URL}/books/bulk`,
      expect.objectContaining({
        method: "DELETE",
        body: JSON.stringify({ book_ids: [1, 2] }),
      })
    );
  });

  fetchSpy.mockRestore(); // Restore fetch after test
});

test("bulk deletes one book", async () => {
  // Required for MSW to be able to monitor the request
  const fetchSpy = jest.spyOn(global, "fetch");

  render(
    <BrowserRouter>
      <Books />
    </BrowserRouter>
  );

  // Find Bulk Delete button
  const bulkDeleteButton = await screen.findByText("Bulk Delete");
  expect(bulkDeleteButton).toBeInTheDocument();

  // Click Bulk Delete button
  await waitFor(() => {
    userEvent.click(bulkDeleteButton);
  });

  // New action buttons should appear
  const deleteButton = await screen.findByText("Delete");
  const cancelButton = await screen.findByText("Cancel");
  expect(deleteButton).toBeInTheDocument();
  expect(cancelButton).toBeInTheDocument();

  // Bulk Delete button should be hidden
  expect(bulkDeleteButton).not.toBeInTheDocument();

  // Deletion overlay should appear
  const overlayOne = screen.getByTestId("1");
  expect(overlayOne).toBeInTheDocument();

  // Click one book to highlight for deletion
  await waitFor(() => {
    userEvent.click(overlayOne);
  });

  // Click 'Delete' to delete both books
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
      `${process.env.REACT_APP_API_URL}/books/bulk`,
      expect.objectContaining({
        method: "DELETE",
        body: JSON.stringify({ book_ids: [1] }),
      })
    );
  });

  fetchSpy.mockRestore(); // Restore fetch after test
});

test("cancels bulk deletion with main cancel button", async () => {
  // Required for MSW to be able to monitor the request
  const fetchSpy = jest.spyOn(global, "fetch");

  render(
    <BrowserRouter>
      <Books />
    </BrowserRouter>
  );

  // Find Bulk Delete button
  let bulkDeleteButton = await screen.findByText("Bulk Delete");
  expect(bulkDeleteButton).toBeInTheDocument();

  // Click Bulk Delete button
  await waitFor(() => {
    userEvent.click(bulkDeleteButton);
  });

  // New action buttons should appear
  const deleteButton = await screen.findByText("Delete");
  const cancelButton = await screen.findByText("Cancel");
  expect(deleteButton).toBeInTheDocument();
  expect(cancelButton).toBeInTheDocument();

  // Bulk Delete button should be hidden
  expect(bulkDeleteButton).not.toBeInTheDocument();

  // Deletion overlays should appear
  const overlayOne = screen.getByTestId("1");
  const overlayTwo = screen.getByTestId("2");
  expect(overlayOne).toBeInTheDocument();
  expect(overlayTwo).toBeInTheDocument();

  // Click both books to highlight for deletion
  await waitFor(() => {
    userEvent.click(overlayOne);
    userEvent.click(overlayTwo);
  });

  // Click 'Cancel' to cancel bulk deletion
  await userEvent.click(cancelButton);

  // Re-query for bulk delete button because it was removed and re-added
  bulkDeleteButton = await screen.findByText("Bulk Delete");

  // Original controls should be restored
  expect(bulkDeleteButton).toBeInTheDocument();
  expect(deleteButton).not.toBeInTheDocument();
  expect(cancelButton).not.toBeInTheDocument();

  fetchSpy.mockRestore(); // Restore fetch after test
});

test("cancels bulk deletion confirmation with cancel button", async () => {
  // Required for MSW to be able to monitor the request
  const fetchSpy = jest.spyOn(global, "fetch");

  render(
    <BrowserRouter>
      <Books />
    </BrowserRouter>
  );

  // Find Bulk Delete button
  const bulkDeleteButton = await screen.findByText("Bulk Delete");
  expect(bulkDeleteButton).toBeInTheDocument();

  // Click Bulk Delete button
  await waitFor(() => {
    userEvent.click(bulkDeleteButton);
  });

  // New action buttons should appear
  const deleteButton = await screen.findByText("Delete");
  const cancelButton = await screen.findByText("Cancel");
  expect(deleteButton).toBeInTheDocument();
  expect(cancelButton).toBeInTheDocument();

  // Bulk Delete button should be hidden
  expect(bulkDeleteButton).not.toBeInTheDocument();

  // Deletion overlays should appear
  const overlayOne = screen.getByTestId("1");
  const overlayTwo = screen.getByTestId("2");
  expect(overlayOne).toBeInTheDocument();
  expect(overlayTwo).toBeInTheDocument();

  // Click both books to highlight for deletion
  await waitFor(() => {
    userEvent.click(overlayOne);
    userEvent.click(overlayTwo);
  });

  // Click 'Delete' to delete both books
  await userEvent.click(deleteButton);

  // Our delete confirmation modal should fire
  const modal = screen.getByRole("dialog");
  expect(modal).toBeInTheDocument();

  // Find and verify our delete confirmation button
  const cancelConfirmationButton =
    await screen.findByLabelText("Cancel Delete");
  expect(cancelConfirmationButton).toBeInTheDocument();

  // Cancel deletion
  await userEvent.click(cancelConfirmationButton);

  // Modal should disappear
  expect(modal).not.toBeInTheDocument();

  fetchSpy.mockRestore(); // Restore fetch after test
});

test("cancels bulk deletion confirmation with click outside modal", async () => {
  // Required for MSW to be able to monitor the request
  const fetchSpy = jest.spyOn(global, "fetch");

  render(
    <BrowserRouter>
      <Books />
    </BrowserRouter>
  );

  // Find Bulk Delete button
  const bulkDeleteButton = await screen.findByText("Bulk Delete");
  expect(bulkDeleteButton).toBeInTheDocument();

  // Click Bulk Delete button
  await waitFor(() => {
    userEvent.click(bulkDeleteButton);
  });

  // New action buttons should appear
  const deleteButton = await screen.findByText("Delete");
  const cancelButton = await screen.findByText("Cancel");
  expect(deleteButton).toBeInTheDocument();
  expect(cancelButton).toBeInTheDocument();

  // Bulk Delete button should be hidden
  expect(bulkDeleteButton).not.toBeInTheDocument();

  // Deletion overlays should appear
  const overlayOne = screen.getByTestId("1");
  const overlayTwo = screen.getByTestId("2");
  expect(overlayOne).toBeInTheDocument();
  expect(overlayTwo).toBeInTheDocument();

  // Click both books to highlight for deletion
  await waitFor(() => {
    userEvent.click(overlayOne);
    userEvent.click(overlayTwo);
  });

  // Click 'Delete' to delete both books
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

test("cancels bulk deletion confirmation with x button", async () => {
  // Required for MSW to be able to monitor the request
  const fetchSpy = jest.spyOn(global, "fetch");

  render(
    <BrowserRouter>
      <Books />
    </BrowserRouter>
  );

  // Find Bulk Delete button
  const bulkDeleteButton = await screen.findByText("Bulk Delete");
  expect(bulkDeleteButton).toBeInTheDocument();

  // Click Bulk Delete button
  await waitFor(() => {
    userEvent.click(bulkDeleteButton);
  });

  // New action buttons should appear
  const deleteButton = await screen.findByText("Delete");
  const cancelButton = await screen.findByText("Cancel");
  expect(deleteButton).toBeInTheDocument();
  expect(cancelButton).toBeInTheDocument();

  // Bulk Delete button should be hidden
  expect(bulkDeleteButton).not.toBeInTheDocument();

  // Deletion overlays should appear
  const overlayOne = screen.getByTestId("1");
  const overlayTwo = screen.getByTestId("2");
  expect(overlayOne).toBeInTheDocument();
  expect(overlayTwo).toBeInTheDocument();

  // Click both books to highlight for deletion
  await waitFor(() => {
    userEvent.click(overlayOne);
    userEvent.click(overlayTwo);
  });

  // Click 'Delete' to delete both books
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
