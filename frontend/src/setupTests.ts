// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom/extend-expect";
import "@testing-library/jest-dom";
import "./tests/jest.polyfills.js";

import { server } from "./tests/mocks/server";

// Establish API mocking before all tests.
beforeAll(() => {
  console.log("Setting up MSW server...");
  server.listen();
});

// Reset any request handlers that are declared during tests, so they don't affect other tests.
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished.
afterAll(() => server.close());
