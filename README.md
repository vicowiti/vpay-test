# VPAY WALLETS SYSTEM

- Custom API server to manage transactions.

## Technology Stack

- [Nodejs]("") - A javascript runtime based on the Google V8 engine
- [Typescript]("") - A superset of javascript that enables us to leverage types among other features enabling us to catch bugs early.
- [Express]("") - A web application framework for Nodejs to manage our API endpoints.
- [Postgres]("") - An ACID compliant open source SQL database.
- [DrizzleORM]("") - A Typescript friendly ORM that enables us to interact with our database in a more efficient way.
- [Zod]("") - A Typescript first schema validation library to validate our API requests and responses. Here it is used for swagger schema generation.
- [Swagger]("") - A tool to generate API documentation and client SDKs from our API definitions.
- [Jest]("") - A testing framework for JavaScript and Typescript to write unit and integration tests.
- [Supertest]("") - A library to test our API endpoints.

## Technology decisions

- Authentication - Used HTTP only cookies for authentication. As they can not be accessed via client side javascript.
- OOP - Went the Java-esque way for ease in code readability and maintainability as I would do in a production grade project. This introduces what I consider one of the most important features of a backend project, predictability.
- Use database transactions for Deposits and Reversals. This ensures an all or nothing approach so that if any part of the transaction fails for whatever reason, a rollback is initiated immidiately. This is critical for money handling systems. When successful, the transaction is committed.

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [PostgreSQL](https://www.postgresql.org/) v14 or higher
- npm v8 or higher
- [Git](https://git-scm.com/) v2.0.0 or higher

## Project Setup on local machine

1. Clone the public repository.

`git clone https://github.com/vicowiti/vpay-test.git`

2. Navigate to the project directory.

```bash
 cd vpay-test && cd cd server
```

3. Install dependencies.

```bash
 npm ci
```

4. Create a `.env` file in the root of the project(inside the server directory) and add the variables shared on email.

5. Open `pgAdmin` and create a database called `vunar`.
6. Run the migrations to create the tables in the database.

```bash
 npm run db:migrate
```

7. Start the server.

```bash
 npm run dev
```

8. The server should now be running on `http://localhost:9090`.

## API Documentation

Interactive Swagger documentation is available at:

`http://localhost:9090/docs`

## Running Tests

```bash
npm run test
```

## API Endpoints

### Auth

| Method | Endpoint             | Description                   | Protected |
| ------ | -------------------- | ----------------------------- | --------- |
| POST   | `/api/auth/register` | Register a new user           | No        |
| POST   | `/api/auth/login`    | Login and receive auth cookie | No        |
| POST   | `/api/auth/logout`   | Logout and clear auth cookie  | No        |

### Accounts

| Method | Endpoint            | Description                             | Protected |
| ------ | ------------------- | --------------------------------------- | --------- |
| POST   | `/api/accounts`     | Create a new wallet account             | Yes       |
| GET    | `/api/accounts`     | Get all accounts for authenticated user | Yes       |
| GET    | `/api/accounts/:id` | Get a single account by ID              | Yes       |
| DELETE | `/api/accounts/:id` | Soft delete an account                  | Yes       |

### Transactions

| Method | Endpoint                       | Description                            | Protected |
| ------ | ------------------------------ | -------------------------------------- | --------- |
| POST   | `/api/transactions/deposit`    | Deposit funds into an account          | Yes       |
| POST   | `/api/transactions/transfer`   | Transfer funds between accounts        | Yes       |
| POST   | `/api/transactions/reverse`    | Reverse a previous transaction         | Yes       |
| GET    | `/api/transactions/:accountId` | Get transaction history for an account | Yes       |

---

## Business Rules

- A user can have multiple wallet accounts
- Sender must have sufficient balance before a transfer is processed
- Both accounts must exist and be active for a transfer to proceed
- Every deposit and transfer is recorded as a transaction
- Accounts are soft deleted — transaction history is always preserved
- A reversed transaction cannot be reversed again
- A reversal transaction itself cannot be reversed
- Negative or zero amounts are rejected on all operations

---

## Authentication

This API uses **JWT tokens stored in HttpOnly cookies** for authentication.

- On login, a `token` cookie is set automatically
- The cookie is **HttpOnly** — it cannot be accessed by JavaScript, protecting against XSS attacks
- The cookie has a **1 hour expiry** matching the JWT expiry
- In production, the cookie is **Secure** — only sent over HTTPS
- On logout, the cookie is cleared server-side

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description here"
}
```

| Status Code | Meaning                                           |
| ----------- | ------------------------------------------------- |
| 400         | Bad request — invalid input or insufficient funds |
| 401         | Unauthorized — missing or invalid token           |
| 403         | Forbidden — accessing another user's resource     |
| 404         | Not found — resource does not exist               |
| 409         | Conflict — email already in use                   |
| 500         | Internal server error                             |

## Example Requests

### Auth

1. Register
2. Login
3. Logout

### Accounts

1. Create account
2. Get all accounts
3. Get single account
4. Soft delete account

### Transactions

1. Deposit
2. Transfer
3. Reverse
4. Get transaction history

Please find the postman collection [here]("./vunapay-api.postman_collection.json") with all the request examples
