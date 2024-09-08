import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import CreateBookshelf from "../../components/bookshelves/CreateBookshelf";
import { userEvent } from "@testing-library/user-event";

test("creates a bookshelf", async () => {
  // Required for MSW to be able to monitor the request
  const fetchSpy = jest.spyOn(global, "fetch");

  render(
    <BrowserRouter>
      <CreateBookshelf />
    </BrowserRouter>
  );

  const header = screen.getByText("Create Bookshelf");
  expect(header).toBeInTheDocument();

  const titleField = screen.getByLabelText("Title");
  expect(titleField).toBeInTheDocument();

  const descriptionField = screen.getByLabelText("Description");
  expect(descriptionField).toBeInTheDocument();

  const createButton = screen.getByText("Create");
  expect(createButton).toBeInTheDocument();

  const title = "Epic Fantasy Sagas";
  const description = "Here be dragons!";

  await userEvent.type(titleField, title);
  await userEvent.type(descriptionField, description);

  await userEvent.click(createButton);

  // Verify that delete API call happens
  await waitFor(() => {
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.REACT_APP_API_URL}/bookshelves/`,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          title: title,
          description: description,
          sort_key: "id", // default value
          sort_direction: "ascending", // default value
        }),
      })
    );
  });

  fetchSpy.mockRestore(); // Restore fetch after test
});
