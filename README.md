# Winnow Management Transaction Monitoring

Winnow Transaction Monitoring is a system that helps track financial transactions to identify any suspicious activity. It automatically checks for unusual patterns in transactions and alerts when something looks out of the ordinary, helping to keep things secure and compliant.



## Features

- **Real-time Transaction Monitoring**: The dashboard monitors transactions as they occur and raises alerts based on specific conditions.
- **Alert Triggers**:
  - A customer making 3 or more transactions.
  - A transaction amount greater than 55,000.
  - A single transaction of exactly 55,000.
- **Dynamic Data Fetching**: Fetches alert data dynamically from a FastAPI backend and displays it in cards and charts
- - **Responsive Layout**: The dashboard is designed to be responsive, with a layout that adapts to different screen sizes.
- **Interactive Pie Chart**: Displays the distribution of alert statuses with labels showing the count for each category.
- **Breadcrumb Navigation**: Helps users navigate between different sections of the application, with a custom component for breadcrumb navigation.

---


## Technologies Used


### Frontend:
- **React**: JavaScript library for building user interfaces.
- **Material UI**: React UI framework for styling components and layouts.

### Backend:
- **FastAPI**: Fast and modern web framework for building APIs with Python.
- **Flask**: Micro web framework for Python for handling backend routes and requests.
- **SQLite**: Lightweight SQL database for storing alert data.

### Other Tools:
- **React Router**: For navigation and routing between different pages.
- **MUI**: For rendering interactive charts in the frontend.

---

## Installation

### Prerequisites

- Python 3.7+ installed on your machine.
- npm or yarn for managing frontend dependencies.
- SQLite for the backend database.

### Clone the Repository
```sh
git clone https://github.com/yourusername/Transaction-Monitoring.git
cd Transaction-Monitoring
```

### Backend Setup
1. Navigate to the backend directory:
   ```sh
   cd backend
   ```
2. Create a virtual environment and activate it:
   ```sh
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```
3. Install dependencies:
   ```sh
   pip install fastapi sqlalchemy pandas aiofiles pydantic
   pip install uvicorn  # for running FastAPI
   pip install python-dotenv  # If you plan to use environment variables for configuration (optional)
   pip install sqlite3   # For SQLite (usually comes pre-installed with Python)
   ```
4. Run the FastAPI server:
   ```sh
   uvicorn main:app --reload
   ```
   The API will be available at `http://localhost:8000`
   

### Frontend Setup
1. Navigate to the frontend directory:
   ```sh
   cd frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm start
   ```
   The frontend will be available at `http://localhost:3000`

---

## API Endpoints

### 1. **Upload CSV File**
- **Endpoint:** `/upload/`
- **Method:** `POST`
- **Description:** Upload a CSV file and store the data in the database.
- **Request Body:**
  - File (CSV)
- **Response:**
  - `{"message": "File uploaded and data stored successfully"}`

---

### 2. **Get All Transactions**
- **Endpoint:** `/transactions/`
- **Method:** `GET`
- **Description:** Retrieve all transactions from the database.
- **Response:**
  - List of all transactions

---

### 3. **Get Transactions for a Specific Customer**
- **Endpoint:** `/transactions/{customer_name}`
- **Method:** `GET`
- **Description:** Retrieve all transactions for a specific customer.
- **Parameters:**
  - `customer_name` (Path parameter)
- **Response:**
  - List of transactions for the customer

---

### 4. **Get Rule Breakers**
- **Endpoint:** `/rule_breakers/`
- **Method:** `GET`
- **Description:** Retrieve rule breakers based on certain transaction conditions.
- **Response:**
  - List of rule breakers

---

### 5. **Get Rule Breaker for a Specific Customer**
- **Endpoint:** `/rule_breakers/{customer_name}`
- **Method:** `GET`
- **Description:** Retrieve rule breakers for a specific customer.
- **Parameters:**
  - `customer_name` (Path parameter)
- **Response:**
  - Details of the rule breaker for the specified customer

---

### 6. **Get All Alerts**
- **Endpoint:** `/alerts/`
- **Method:** `GET`
- **Description:** Retrieve all alerts stored in the database.
- **Response:**
  - List of all alerts

---

### 7. **Get Alert for a Specific Customer**
- **Endpoint:** `/alerts/{customer_name}`
- **Method:** `GET`
- **Description:** Retrieve alert for a specific customer.
- **Parameters:**
  - `customer_name` (Path parameter)
- **Response:**
  - Alert details for the customer

---

### 8. **Update Alert Status for a Specific Customer**
- **Endpoint:** `/update_alert_status/{customer_name}`
- **Method:** `POST`
- **Description:** Update the status of an alert for a specific customer.
- **Parameters:**
  - `customer_name` (Path parameter)
- **Request Body:**
    - `status` (string)
- **Response:**
  - `{"message": "Status updated successfully"}`

## Notes
- The backend uses **SQLite** for lightweight storage, making it easy to manage data without needing a full database setup.
- The frontend communicates with the backend using **Axios**.
- **Search and filtering** features have been implemented in the UI.
- **CORS** is enabled in FastAPI to allow frontend-backend communication.
- The UI is built using **Material UI** for a modern look.

---

## Future Enhancements
- Migrate database from SQLite to PostgreSQL/MySQL for better scalability.
- Improve authentication & role-based access control.

---

## License
This project is open-source and available under the [MIT License](LICENSE).

---

## Author
Developed by Raswanth(https://github.com/Raswanth-RM).
