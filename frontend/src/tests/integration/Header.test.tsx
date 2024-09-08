import { render, screen, fireEvent } from "@testing-library/react";
import App from "../../App";
import "@testing-library/jest-dom/extend-expect";
import "@testing-library/jest-dom";

test("renders the title and subtitle", () => {
  render(<App />);

  const titleElement = screen.getByText("Alexandria");
  expect(titleElement).toBeInTheDocument();
  expect(titleElement).toBeInstanceOf(HTMLHeadingElement);

  const subTitleElement = screen.getByText("A Library Management System");
  expect(subTitleElement).toBeInTheDocument();
  expect(subTitleElement).toBeInstanceOf(HTMLParagraphElement);
});

test("renders the navigation dropdowns", () => {
  render(<App />);

  const bookshelfLinkElement = screen.getByText("Bookshelves");
  expect(bookshelfLinkElement).toBeInTheDocument();
  expect(bookshelfLinkElement).toBeInstanceOf(HTMLAnchorElement);

  const bookLinkElement = screen.getByText("Books");
  expect(bookLinkElement).toBeInTheDocument();
  expect(bookLinkElement).toBeInstanceOf(HTMLAnchorElement);
});

test("navigation dropdown clicks show options", () => {
  render(<App />);

  fireEvent.click(screen.getByText("Bookshelves"));
  let viewLinkElements = screen.getAllByText("View");
  expect(viewLinkElements[0]).toBeVisible();
  let createLinkElements = screen.getAllByText("Create");
  expect(createLinkElements[0]).toBeVisible();

  fireEvent.click(screen.getByText("Books"));
  viewLinkElements = screen.getAllByText("View");
  expect(viewLinkElements[1]).toBeVisible();
  createLinkElements = screen.getAllByText("Create");
  expect(createLinkElements[1]).toBeVisible();
});
