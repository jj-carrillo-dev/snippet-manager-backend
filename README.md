# Snippet Code Manager API

This is a **Node.js API** built with **NestJS**, **TypeORM**, and **PostgreSQL**. It is designed to be the backend for a code snippet management application, allowing users to store, organize, and manage their personal code snippets.

-----

## 🚀 Features

  * **User Authentication**: Secure user registration and login using **JWT (JSON Web Tokens)**.
  * **User Management**: Endpoints for creating, retrieving, updating, and deleting user accounts.
  * **Category Management**: Organize snippets by creating, retrieving, updating, and deleting custom categories for each user.
  * **Snippet Management**: Full CRUD operations for code snippets, with each snippet tied to a user and a category.
  * **Data Validation**: Comprehensive data validation for all requests using **class-validator** and DTOs.
  * **Unit Testing**: Extensive test coverage using **Jest** to ensure the reliability and stability of the application.
  * **Error Handling**: A centralized exception filter to provide consistent and informative error responses.
  * **ORM**: Uses **TypeORM** for seamless database interactions and relationship management.
  * **Environment Configuration**: Secure management of sensitive information using the **NestJS ConfigModule**.

-----

## 🛠️ Tech Stack

  * **Framework**: NestJS
  * **Database**: PostgreSQL
  * **ORM**: TypeORM
  * **Authentication**: Passport.js with JWT and Local strategies
  * **Validation**: class-validator, class-transformer
  * **Testing**: Jest
  * **Linting/Formatting**: ESLint, Prettier

-----

## ⚙️ Getting Started

### Prerequisites

Before you begin, ensure you have the following installed on your machine:

  * **Node.js** (v18 or higher)
  * **npm** or **Yarn**
  * **Docker** (Recommended for setting up the database easily)

### 1\. Clone the repository

```sh
git clone https://github.com/jj-carrillo-dev/snippet-manager-backend
cd snippet-manager-backend
```

### 2\. Set up the environment variables

Create a `.env` file in the root directory based on the `.env.example` file.

```ini
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=myuser
POSTGRES_PASSWORD=mypassword
POSTGRES_DB=snippet_manager
JWT_SECRET_KEY="Your_Secret_Key_Here"
```

### 3\. Install dependencies

```sh
npm install
# or
yarn install
```

### 4\. Run the application

To run the application in development mode with hot-reloading:

```sh
npm run start:dev
```

This will automatically create and run the database container, apply migrations, and start the NestJS server.

-----

## 🧪 Running Tests

To run the unit and end-to-end tests:

```sh
npm run test:cov
```

This command runs all tests and provides a detailed coverage report.

-----

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.