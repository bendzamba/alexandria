# Introduction

This is a fairly simple application for organizing books and bookshelves.

The frontend is built with React, and the backend is built in Python with FastAPI.

This app can be run locally in two ways:


# Docker

After pulling down the repo, and ensuring that the Docker daemon is installed and running, simply run the application from the root of the project with:

`docker-compose up`

This will build and start two separate Docker images and containers, one of which serves the frontend, and one of which serves the backend.

The database is [SQLite](https://www.sqlite.org/), which is a file-based, lightweight database that requires no actual database engine or application. When the app starts, a file called `alexandria.db` will be created in the `data` directory at the root of the repository and used by the backend application for reading and writing.

The application will also download image files from [Open Library](https://openlibrary.org/), which will be stored in the `images` directory at the root of the project.


# Basic

If `Docker` is not an option, the app can still be run using Python and Node.

## Setup

Running the application outside of Docker has the following requirements:

1. Python 3.12.4
    + Pip 24.0
2. Node 18.20.4
    + Npm 10.7.0

(These are what has been tested, but the app will likely run on slightly earlier or later versions)

It is typically a good idea to run python and pip inside of a virtual environment.

From the root directory of the project:

`python -m venv ./backend/venv`

The virtual environment can then be activated with:

`source ./backend/venv/bin/activate`

And de-activated with

`deactivate`

From the root directory of the project, run:

`pip install -r requirements.txt`

This will install global requirements for the project.

`pre-commit install`

This will set up global pre-commit hooks for the project, including:

1. ESLint
    + For linting TypeScript, including React, for the frontend
2. Prettier
    + For formatting TypeScript, including React, for the frontend
3. Ruff
    + For linting and formatting Python, for the backend

Then from the `frontend` directory, run:

`npm install`

This will install all of the frontend requirements, including dev

Then from the `backend` directory, run:

`pip install -r requirements.txt`

This will install all of the backend requirements

## Running

The backend application can be run from the `backend/app` directory with:

`fastapi dev main.py`

It will start the FastAPI server on `http://127.0.0.1:8000`

The frontend application can be run from the `frontend` directory with:

`npm run start`

It will start the node server on `http://127.0.0.1:3000`


# Documentation

Once the app is running using either method, documentation for the backend API can be found at:

`http://127.0.0.1:8000/docs`


# Testing

Backend tests can be found in `backend/tests` and are run with `pylint` from `backend/app`

`backend/tests/integration` contains integration tests, primarily testing our routes, mocking our database with an in-memory implementation of SQLite

`backend/tests/unit` contains unit tests for some of our model, service, and utility class methods