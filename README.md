# AI-Test-Platform

AI-Test-Platform is a web application designed to facilitate testing and analyzing AI models and their performance. It provides a robust backend constructed with Django and a modern, responsive frontend built with React and Vite.

## Project Structure

The project is structured into two main components:

- `frontend/`: A React-based single-page application built using Vite, styled with Tailwind CSS, and incorporating features such as Monaco Editor for code editing, and Chart.js for analytics.
- `ai_test_platform/` (and other backend apps like `coding`, `accounts`, `reasoning`, `results`): A Django-based backend application handling API requests, data persistence, and core logic.

## Prerequisites

- Python 3.8+
- Node.js & npm (or yarn/pnpm)

## Installation & Setup

### Backend (Django)

1. Navigate to the project root directory.
2. Create and activate a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```
3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run database migrations:
   ```bash
   python manage.py migrate
   ```
5. Start the development server:
   ```bash
   python manage.py runserver
   ```

### Frontend (React/Vite)

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

## Key Technologies

- **Frontend:** React, Vite, Tailwind CSS, Monaco Editor, Chart.js, Axios
- **Backend:** Django, Django REST Framework (assumed based on standard patterns), SQLite (default)

## License

This project is licensed under the MIT License.
