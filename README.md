# Basic Setup

## Installation

From the root directory:

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

Then from the `frontend` directory:

`npm install`

This will install all of the frontend requirements, including dev

Then from the `backend` directory:

`pip install -r requirements.txt`

This will install all of the backend requirements

## Running

The backend application can be run from the `backend/app` directory with:

`fastapi dev main.py`

It will start the FastAPI server on `http://127.0.0.1:8000`

The frontend application can be run from the `frontend` directory with:

`npm run start`

It will start the node server on `http://127.0.0.1:3000`

## Documentation

Documentation for the backend API can be found at:

`http://127.0.0.1:8000/docs`

## Testing

Backend tests can be found in `backend/tests` and tests are run using `pylint`

## Production

...