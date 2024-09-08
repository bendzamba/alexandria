import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import UpdateBookshelf from "../../components/bookshelves/UpdateBookshelf";
import { userEvent } from "@testing-library/user-event";

test("updates a bookshelf", async () => {
  // Required for MSW to be able to monitor the request
  const fetchSpy = jest.spyOn(global, "fetch");

  const route = "/bookshelf/1"; // Simulate the route with id=123

  render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/bookshelf/:id" element={<UpdateBookshelf />} />
      </Routes>
    </MemoryRouter>
  );

  // Verify that delete API call happens
  await waitFor(() => {
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.REACT_APP_API_URL}/bookshelves/1`,
      expect.objectContaining({})
    );
  });

  const header = await screen.findByText("Update Bookshelf");
  waitFor(() => {
    expect(header).toBeInTheDocument();
  });

  const titleField = await screen.findByLabelText("Title");
  waitFor(() => {
    expect(titleField).toBeInTheDocument();
  });

  const descriptionField = await screen.findByLabelText("Description");
  waitFor(() => {
    expect(descriptionField).toBeInTheDocument();
  });

  const updateButton = await screen.findByText("Update");
  waitFor(() => {
    expect(updateButton).toBeInTheDocument();
  });

  const titleRedux = "Great American Novels";
  const descriptionRedux = "Books that depict the soul of America";

  await userEvent.clear(titleField);
  await userEvent.type(titleField, titleRedux);

  await userEvent.clear(descriptionField);
  await userEvent.type(descriptionField, descriptionRedux);

  await userEvent.click(updateButton);

  // Verify that delete API call happens
  await waitFor(() => {
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.REACT_APP_API_URL}/bookshelves/1`,
      expect.objectContaining({
        method: "PATCH",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          title: titleRedux,
          description: descriptionRedux,
        }),
      })
    );
  });

  fetchSpy.mockRestore(); // Restore fetch after test
});
